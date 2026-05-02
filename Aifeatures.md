# AI Features — Urban Cart 🤖

This document explains the two AI features implemented in Urban Cart, how they work technically, and the design decisions behind them.

---

## Feature 1: AI-Powered Natural Language Search

### The Problem with Basic Search

Traditional keyword search is fragile:

```
User types: "something warm for women under 2000"
Basic search: searches for exact string match → 0 results ❌

User types: "hoodie"
Basic search: finds products with "hoodie" in name only → misses "fleece pullover" ❌
```

### The Solution

Instead of matching strings, we use AI to **understand what the user means** and convert it into structured filters MongoDB can act on.

```
User types: "something warm for women under 2000"
AI understands: { category: "Women", subCategory: "Winterwear", maxPrice: 2000 }
MongoDB finds: all Women's Winterwear products under ₹2000 ✅
```

---

### Architecture

```
User Query
    ↓
Debounce (600ms) — don't fire on every keystroke
    ↓
Cache check — same query asked before? return instantly
    ↓
shouldUseAI() — decide if AI is needed
    ↓
┌─────────────────────────────────────┐
│  Try Gemini 2.5 Flash (primary)     │
│  ↓ (if fails — quota/timeout)       │
│  Try Groq LLaMA 3.1 (fallback)      │
│  ↓ (if both fail)                   │
│  Keyword regex fallback             │
└─────────────────────────────────────┘
    ↓
Build MongoDB query from AI filters
    ↓
Fetch matching products (limit 200)
    ↓
Score & rank each product by relevance
    ↓
Return top 20 + similar products + recommended products
```

---

### When AI is Triggered

Not every search needs AI. We use a `shouldUseAI()` function to decide:

```js
const shouldUseAI = (query, words, basicResultCount) => {
  if (basicResultCount < 3) return true;   // basic search found too little
  if (words.length > 3) return true;       // complex multi-word query
  if (/\b(affordable|cheap|best|for|with|winter|summer)\b/i.test(query)) return true;
  return false;
};
```

This avoids unnecessary AI API calls for simple queries like "shirt" while using AI for intent-heavy queries like "affordable warm jacket for dad".

---

### What AI Extracts

The AI prompt instructs Gemini/Groq to return only a JSON object:

```json
{
  "category": "Women",
  "subCategory": "Winterwear",
  "maxPrice": 2000,
  "keywords": ["warm", "jacket"]
}
```

**Important design decision:** If the user says "cheap" or "affordable" without a number, `maxPrice` stays `null`. We explicitly instruct the AI:

> "If the user does not specify a numeric price, return maxPrice: null. Do not infer a number from words like affordable, cheap, or budget."

---

### Filter Normalization

AI responses are not always perfectly formatted. We normalize every value:

```js
// Handles "men", "MEN", "male", "mens" → all become "Men"
const normalizeCategory = (value) => {
  const v = value?.toString().trim().toLowerCase();
  if (v?.includes("men")) return "Men";
  if (v?.includes("women") || v?.includes("woman")) return "Women";
  if (v?.includes("kid")) return "Kids";
  return null;
};
```

---

### Relevance Scoring

MongoDB returns products that match the query — but not in any meaningful order. We score each product to rank the most relevant first:

| Signal | Points |
|---|---|
| Category match | +3 |
| SubCategory match | +2 |
| Price within range | +1 |
| Keyword found in product name | +3 per keyword |
| Keyword found in description | +2 per keyword |
| Bestseller | implicit sort boost |

Products are sorted by score descending before being returned.

---

### Dual AI Provider — Gemini + Groq

We use two AI providers with automatic fallback:

```
Primary:  Google Gemini 2.5 Flash
              ↓ (if rate limited or fails)
Fallback: Groq LLaMA 3.1-8b-instant
              ↓ (if both fail)
          Keyword regex search (always works)
```

This means the feature **never fully breaks** — even if both AI providers are down, the search falls back to basic regex matching.

---

### Caching

Repeated queries don't hit the AI API:

```js
const searchCache = new Map();

// Check cache first
if (searchCache.has(normalizedQuery)) {
  return res.json(searchCache.get(normalizedQuery));
}

// Cache result after AI responds
searchCache.set(normalizedQuery, response);
setTimeout(() => searchCache.delete(normalizedQuery), 10 * 60 * 1000); // 10 min TTL
```

---

### Frontend: What the User Sees

After AI search, the UI shows:

1. **Filter pills** — transparent display of what AI understood

```
AI understood: [Women] [Winterwear] [Under ₹2000] [Keywords: warm, jacket]
```

2. **Search results** — ranked by relevance score

3. **Similar Products section** — products from same category/subcategory not in main results

4. **Recommended Products section** — scored by category match + bestseller status

---

### Example Queries That Work

| Query | AI Output |
|---|---|
| `warm jacket for women under 3000` | Women, Winterwear, maxPrice: 3000 |
| `something for dad` | Men (inferred) |
| `cheap kids hoodie` | Kids, keywords: [hoodie] |
| `blue shirt men office` | Men, Topwear, keywords: [shirt, blue] |
| `affordable bottomwear` | Bottomwear, maxPrice: null (no number given) |

---

## Feature 2: AI Description Generator (Admin Panel)

### The Problem

Writing unique, compelling product descriptions for 90+ products is time-consuming and inconsistent.

### The Solution

In the admin panel's "Add Product" page, after filling in the product name, category, and subcategory — the admin can click **"AI Generate Description"** and get a ready-to-use description in under 2 seconds.

---

### How It Works

```
Admin fills: Product Name + Category + SubCategory
         ↓
Clicks "AI Generate Description"
         ↓
Backend sends prompt to Gemini 2.5 Flash
         ↓
Gemini returns a 40-word premium product description
         ↓
Description auto-fills the textarea
         ↓
Admin can edit before saving
```

---

### The Prompt

```
Write a premium product description (max 40 words).

Product:
{name}, {category}, {subCategory}
```

Keeping the prompt minimal produces cleaner, more focused descriptions without unnecessary padding.

---

### Example Output

**Input:** `Puffer Jacket – Midnight Blue, Men, Winterwear`

**AI Output:**
> "A lightweight yet warm midnight-blue puffer jacket with water-resistant outer shell and down-alternative fill. Packable design and sleek urban style make it the perfect men's winter essential."

---

### Why This Matters

- **Saves time** — 90 descriptions in minutes instead of hours
- **Consistent quality** — every product gets a professional description
- **Editable** — admin can refine before saving
- **Directly improves AI search** — better descriptions mean more keyword matches in search

---

## Technical Summary

| | AI Search | AI Description |
|---|---|---|
| **AI Provider** | Gemini 2.5 Flash + Groq fallback | Gemini 2.5 Flash |
| **Purpose** | Natural language → structured filters | Generate product copy |
| **Where** | Frontend Collection page | Admin Add Product page |
| **Fallback** | Keyword regex search | Manual entry |
| **Caching** | In-memory Map, 10 min TTL | None needed |
| **Cost** | ~1 API call per unique query | ~1 API call per product |

---

