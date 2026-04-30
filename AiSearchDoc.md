# AI Search Feature — Implementation Plan
## Urban Cart | Using Google Gemini (Free)

---

## WHAT WE ARE BUILDING

A natural language search for Urban Cart.

Instead of this:
- User types "hoodie" → only finds products with "hoodie" in the name

We want this:
- User types "something warm for women under 2000" → finds Women's Winterwear under ₹2000
- User types "gift for my dad" → finds Men's bestsellers
- User types "cheap kids jacket" → finds Kids Winterwear sorted by price

---

## HOW IT WORKS (Simple Version)

```
User types query
      ↓
Wait 600ms (debounce — don't fire on every keystroke)
      ↓
Send query to our backend
      ↓
Backend checks cache (same query asked before? return instantly)
      ↓
If not cached → send query to Gemini AI
      ↓
Gemini returns structured JSON filters
      ↓
We build a MongoDB query from those filters
      ↓
MongoDB returns matching products
      ↓
Frontend shows products + pills showing what AI understood
```

---

## ROLE OF AI (Critical to understand)

AI does NOT search the database.
AI does NOT return products.
AI ONLY converts English → JSON filters.

Example:

Input to AI:
"warm jacket for women under 3000"

Output from AI:
```json
{
  "category": "Women",
  "subCategory": "Winterwear",
  "maxPrice": 3000,
  "keywords": ["jacket", "warm"]
}
```

We then build this MongoDB query:
```js
{
  category: "Women",
  subCategory: "Winterwear",
  price: { $lte: 3000 },
  $or: [
    { name: { $regex: "jacket|warm", $options: "i" } },
    { description: { $regex: "jacket|warm", $options: "i" } }
  ]
}
```

MongoDB does the actual searching. AI just helps us understand what the user meant.

---

## PART 1: BACKEND

### Files to modify:
- `backend/controllers/productController.js` → add aiSearchProducts function
- `backend/routes/productRoute.js` → add one route line

### Step 1 — Get Gemini API Key
1. Go to https://aistudio.google.com
2. Sign in with Google account
3. Click "Get API Key" → "Create API key"
4. Copy the key
5. Add to your backend `.env` file:
```
GEMINI_API_KEY=your_key_here
```

### Step 2 — Install Gemini SDK
Run this in your backend folder:
```bash
npm install @google/generative-ai
```

### Step 3 — Add route
In `routes/productRoute.js`, add:
```js
router.post('/ai-search', aiSearchProducts);
```
And add `aiSearchProducts` to the import at the top.

### Step 4 — Write the controller function

Add to `controllers/productController.js`:

```js
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Simple in-memory cache
// Key = search query, Value = { mongoQuery, filters }
const searchCache = new Map();

const aiSearchProducts = async (req, res) => {
  try {
    const { q } = req.body;

    // Validate input
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Query is required" });
    }

    const normalizedQ = q.trim().toLowerCase();

    // ── STEP 1: Check cache ──────────────────────────────────────
    if (searchCache.has(normalizedQ)) {
      const cached = searchCache.get(normalizedQ);
      const products = await productModel.find(cached.mongoQuery).limit(20);
      return res.json({
        success: true,
        products,
        filters: cached.filters,
        fromCache: true
      });
    }

    // ── STEP 2: Ask Gemini to extract filters ────────────────────
    let filters = {};

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
You are a filter extractor for a clothing store search.
Extract search filters from the user query below.

Store data:
- categories: Men, Women, Kids
- subCategories: Topwear, Bottomwear, Winterwear

Return ONLY a valid JSON object. No markdown. No explanation. No backticks.

JSON format:
{
  "category": "Men" or "Women" or "Kids" or null,
  "subCategory": "Topwear" or "Bottomwear" or "Winterwear" or null,
  "maxPrice": number or null,
  "keywords": ["word1", "word2"]
}

Rules:
- keywords should be product-related words only (ignore words like "cheap", "good", "nice")
- if no clear category is mentioned, use null
- if no price is mentioned, maxPrice should be null
- keywords array can be empty []

User query: "${q}"
`;

      const result = await model.generateContent(prompt);
      const raw = result.response.text().trim();

      // Strip markdown fences if Gemini wraps response
      const cleaned = raw.replace(/```json|```/g, "").trim();
      filters = JSON.parse(cleaned);

    } catch (aiError) {
      // AI failed — filters stays empty, fallback will handle it
      console.error("Gemini error:", aiError.message);
    }

    // ── STEP 3: Build MongoDB query from filters ─────────────────
    const mongoQuery = {};

    if (filters.category) {
      mongoQuery.category = filters.category;
    }

    if (filters.subCategory) {
      mongoQuery.subCategory = filters.subCategory;
    }

    if (filters.maxPrice) {
      mongoQuery.price = { $lte: Number(filters.maxPrice) };
    }

    if (filters.keywords && filters.keywords.length > 0) {
      // Escape special regex characters to prevent crashes
      const safeKeywords = filters.keywords.map(k =>
        k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      );

      // Search in BOTH name and description
      mongoQuery.$or = [
        { name: { $regex: safeKeywords.join("|"), $options: "i" } },
        { description: { $regex: safeKeywords.join("|"), $options: "i" } }
      ];
    }

    // ── STEP 4: Fallback if AI returned nothing useful ───────────
    if (Object.keys(mongoQuery).length === 0) {
      mongoQuery.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } }
      ];
    }

    // ── STEP 5: Query database ───────────────────────────────────
    const products = await productModel.find(mongoQuery).limit(20);

    // ── STEP 6: Cache the result ─────────────────────────────────
    if (Object.keys(filters).length > 0) {
      searchCache.set(normalizedQ, { mongoQuery, filters });

      // Auto-clear cache after 10 minutes
      setTimeout(() => searchCache.delete(normalizedQ), 10 * 60 * 1000);
    }

    res.json({ success: true, products, filters });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

---

## PART 2: FRONTEND

### Files to modify:
- `frontend/src/pages/Collection.jsx` → main changes here

### Step 5 — Add new state variables

Inside Collection component, add these 3 new states:
```js
const [aiFilters, setAiFilters] = useState(null);
const [aiLoading, setAiLoading] = useState(false);
const [debouncedSearch, setDebouncedSearch] = useState("");
```

### Step 6 — Add debounce useEffect

This waits 600ms after user stops typing before firing:
```js
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search);
  }, 600);
  return () => clearTimeout(timer);  // cleanup on each keystroke
}, [search]);
```

### Step 7 — Add AI search trigger useEffect

```js
useEffect(() => {
  // Only trigger AI search if query is more than 2 characters
  if (debouncedSearch && debouncedSearch.trim().length > 2) {
    fetchAISearch(debouncedSearch);
  } else {
    // Empty or too short — clear AI results and use normal filter
    setAiFilters(null);
    applyFilter();
  }
}, [debouncedSearch]);
```

### Step 8 — Add fetchAISearch function

```js
const fetchAISearch = async (query) => {
  setAiLoading(true);
  try {
    const res = await api.post("/api/product/ai-search", { q: query });

    if (res.data.success) {
      setFilterProducts(res.data.products);
      setAiFilters(res.data.filters);
    }

  } catch (error) {
    toast.error("AI search failed, showing regular results");
    setAiFilters(null);
    applyFilter(); // graceful fallback
  } finally {
    setAiLoading(false);
  }
};
```

### Step 9 — Add UI feedback strip

Add this just above your product grid (where you map over filterProducts):

```jsx
{/* AI Loading */}
{aiLoading && (
  <div className="w-full text-center py-3 text-sm text-gray-400 col-span-full">
    🔍 Searching with AI...
  </div>
)}

{/* AI Filter Pills — shows what AI understood */}
{aiFilters && !aiLoading && (
  <div className="w-full flex flex-wrap items-center gap-2 px-1 py-2 mb-2 col-span-full">
    <span className="text-xs text-gray-500 font-medium">AI understood:</span>
    {aiFilters.category && (
      <span className="bg-black text-white text-xs px-3 py-1 rounded-full">
        {aiFilters.category}
      </span>
    )}
    {aiFilters.subCategory && (
      <span className="bg-black text-white text-xs px-3 py-1 rounded-full">
        {aiFilters.subCategory}
      </span>
    )}
    {aiFilters.maxPrice && (
      <span className="bg-black text-white text-xs px-3 py-1 rounded-full">
        Under ₹{aiFilters.maxPrice}
      </span>
    )}
    {aiFilters.keywords?.length > 0 && (
      <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
        Keywords: {aiFilters.keywords.join(", ")}
      </span>
    )}
  </div>
)}
```

---

## PART 3: TESTING

### Test queries to try in order:

| Query | Expected AI output |
|---|---|
| `women jacket` | category: Women, keywords: [jacket] |
| `warm clothes under 2000` | subCategory: Winterwear, maxPrice: 2000 |
| `cheap kids hoodie` | category: Kids, keywords: [hoodie] |
| `something for winter women under 3000` | category: Women, subCategory: Winterwear, maxPrice: 3000 |
| `blue shirt for men` | category: Men, subCategory: Topwear, keywords: [shirt] |
| `xyzabc123` | fallback regex search, no AI filters shown |

---

## TIMELINE

| Task | Time |
|---|---|
| Get Gemini API key | 5 min |
| Install SDK + add to .env | 5 min |
| Write backend controller | 30 min |
| Add route | 5 min |
| Test backend with Postman | 20 min |
| Frontend state + debounce | 20 min |
| Frontend fetch function | 15 min |
| UI pills + loading state | 20 min |
| End-to-end testing | 20 min |
| **Total** | **~2.5 hours** |

---

## HOW TO EXPLAIN THIS IN YOUR INTERVIEW

"I built an AI-assisted semantic search using Google Gemini. The key design decision was using AI only for natural language understanding — it converts the user's query into structured filters like category, price range, and keywords. MongoDB then executes the actual search. This keeps it fast, scalable, and cost-efficient. I also added an in-memory cache so repeated queries don't hit the AI API, regex escaping to prevent crashes, and a fallback so if Gemini fails the search still works using basic regex. On the frontend, I show the user exactly what the AI understood through filter pills — so it's transparent, not a black box."

---

## END OF PLAN