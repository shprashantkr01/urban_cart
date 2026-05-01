import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Cache (store FINAL response)
const searchCache = new Map();


// ─────────────────────────────────────────────
// PRODUCT CRUD
// ─────────────────────────────────────────────

const addProduct = async (req, res) => {
    try {
        const { name, description, price, category, subCategory, sizes, bestseller } = req.body;

        const image1 = req.files.image1?.[0];
        const image2 = req.files.image2?.[0];
        const image3 = req.files.image3?.[0];
        const image4 = req.files.image4?.[0];

        const images = [image1, image2, image3, image4].filter(Boolean);

        const imagesUrl = await Promise.all(
            images.map(async (item) => {
                const result = await cloudinary.uploader.upload(item.path, { resource_type: "image" });
                return result.secure_url;
            })
        );

        const productData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory,
            bestseller: bestseller === "true",
            sizes: JSON.parse(sizes),
            image: imagesUrl,
            date: Date.now()
        };

        await new productModel(productData).save();

        res.json({ success: true, message: "Product Added" });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

const listProducts = async (req, res) => {
    try {
        const products = await productModel.find({});
        res.json({ success: true, products });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

const removeProduct = async (req, res) => {
    try {
        await productModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Product Removed" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

const singleProduct = async (req, res) => {
    try {
        const product = await productModel.findById(req.body.productId);
        res.json({ success: true, product });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};


// ─────────────────────────────────────────────
// SCORING
// ─────────────────────────────────────────────

const scoreProduct = (product, filters) => {
    let score = 0;

    if (filters.category && product.category === filters.category) score += 3;
    if (filters.subCategory && product.subCategory === filters.subCategory) score += 2;
    if (filters.maxPrice && product.price <= filters.maxPrice) score += 1;

    if (filters.keywords?.length) {
        filters.keywords.forEach(k => {
            const keyword = k.toLowerCase();
            if (product.name.toLowerCase().includes(keyword)) score += 3;
            if (product.description.toLowerCase().includes(keyword)) score += 2;
        });
    }

    return score;
};


// ─────────────────────────────────────────────
// AI SEARCH (FINAL)
// ─────────────────────────────────────────────

// const aiSearchProducts = async (req, res) => {
//     try {
//         const { q } = req.body;

//         if (!q || q.trim().length === 0) {
//             return res.status(400).json({ success: false, message: "Query is required" });
//         }

//         const normalizedQ = q.trim().toLowerCase();

//         // CACHE HIT
//         if (searchCache.has(normalizedQ)) {
//             return res.json(searchCache.get(normalizedQ));
//         }

//         const words = normalizedQ.split(" ").filter(w => w.length > 2);

//         // BASIC SEARCH FIRST
//         const basicQuery = {
//             $or: [
//                 { name: { $regex: words.join("|"), $options: "i" } },
//                 { description: { $regex: words.join("|"), $options: "i" } }
//             ]
//         };

//         const basicResults = await productModel.find(basicQuery).limit(10);

//         let filters = {};
//         let useAI = basicResults.length < 3 || words.length > 2;

//         // ── AI BLOCK ─────────────────────────────
//         if (useAI) {
//             try {
//                 const model = genAI.getGenerativeModel({
//                     model: "gemini-1.5-flash-latest"
//                 });

//                 const prompt = `
// Extract filters from clothing search query.

// Return ONLY JSON:
// {
//   "category": "Men | Women | Kids | null",
//   "subCategory": "Topwear | Bottomwear | Winterwear | null",
//   "maxPrice": number or null,
//   "keywords": []
// }

// Query: "${q}"
// `;

//                 const result = await model.generateContent(prompt);

//                 let raw = result.response.text().replace(/```json|```/g, "").trim();

//                 filters = JSON.parse(raw);

//                 console.log("✅ Gemini used");

//             } catch (geminiError) {
//                 console.log("⚠️ Gemini failed → switching to Groq");

//                 try {
//                     const completion = await groq.chat.completions.create({
//                         model: "llama-3.1-8b-instant",
//                         temperature: 0,
//                         max_tokens: 150,
//                         messages: [
//                             {
//                                 role: "system",
//                                 content: `
// You are a filter extractor for a clothing store search.

// Return ONLY a valid JSON object. No markdown. No explanation. No backticks.

// Available categories: Men, Women, Kids
// Available subCategories: Topwear, Bottomwear, Winterwear

// JSON format:
// {
//   "category": "Men | Women | Kids | null",
//   "subCategory": "Topwear | Bottomwear | Winterwear | null",
//   "maxPrice": number or null,
//   "keywords": []
// }
// `
//                             },
//                             {
//                                 role: "user",
//                                 content: `User query: "${q}"`
//                             }
//                         ]
//                     });

//                     let raw = completion.choices[0].message.content.trim();

//                     console.log("Groq RAW:", raw);

//                     raw = raw.replace(/```json|```/g, "").trim();

//                     filters = JSON.parse(raw);

//                     console.log("✅ Groq used");

//                 } catch (groqError) {
//                     console.log("❌ Groq failed → fallback");

//                     filters = {
//                         keywords: words,
//                         category: null,
//                         subCategory: null,
//                         maxPrice: null
//                     };
//                 }
//             }

//         } else {
//             filters = {
//                 keywords: words,
//                 category: null,
//                 subCategory: null,
//                 maxPrice: null
//             };
//         }

//         // ── BUILD QUERY ───────────────────────────
//         const mongoQuery = {};

//         if (filters.category) mongoQuery.category = filters.category;
//         if (filters.subCategory) mongoQuery.subCategory = filters.subCategory;
//         if (filters.maxPrice) mongoQuery.price = { $lte: Number(filters.maxPrice) };

//         if (filters.keywords?.length) {
//             const safeKeywords = filters.keywords.map(k =>
//                 k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
//             );

//             mongoQuery.$or = [
//                 { name: { $regex: safeKeywords.join("|"), $options: "i" } },
//                 { description: { $regex: safeKeywords.join("|"), $options: "i" } }
//             ];
//         }

//         if (Object.keys(mongoQuery).length === 0) {
//             mongoQuery.$or = [
//                 { name: { $regex: normalizedQ, $options: "i" } },
//                 { description: { $regex: normalizedQ, $options: "i" } }
//             ];
//         }

//         // FETCH + RANK
//         const products = await productModel.find(mongoQuery).limit(100);

//         const rankedProducts = products
//             .map(p => ({
//                 ...p._doc,
//                 score: scoreProduct(p, filters)
//             }))
//             .sort((a, b) => b.score - a.score);

//         const finalProducts = rankedProducts.slice(0, 20);

//         // CACHE FINAL RESPONSE
//         const response = {
//             success: true,
//             products: finalProducts,
//             filters
//         };

//         searchCache.set(normalizedQ, response);
//         setTimeout(() => searchCache.delete(normalizedQ), 10 * 60 * 1000);

//         return res.json(response);

//     } catch (error) {
//         console.error("Search error:", error);
//         return res.status(500).json({ success: false, message: error.message });
//     }
// };
const normalizeCategory = (value) => {
  if (!value) return null;
  const normalized = value.toString().trim().toLowerCase();
  if (normalized.includes("men")) return "Men";
  if (normalized.includes("woman") || normalized.includes("women")) return "Women";
  if (normalized.includes("kid")) return "Kids";
  return null;
};

const normalizeSubCategory = (value) => {
  if (!value) return null;
  const normalized = value.toString().trim().toLowerCase();
  if (normalized.includes("top")) return "Topwear";
  if (normalized.includes("bottom")) return "Bottomwear";
  if (normalized.includes("winter")) return "Winterwear";
  return null;
};

const toQueryWords = (query) =>
  query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 2);

const hasExplicitPrice = (query) =>
  /\d/.test(query) || /\b(under|below|less than|max price|rupees|rs|₹|\$|usd|inr|eur|pounds|bucks|price)\b/i.test(query);

const normalizeMaxPriceValue = (value, rawQuery) => {
  const price = Number.isFinite(Number(value)) ? Number(value) : null;
  if (price == null) return null;
  if (rawQuery && !hasExplicitPrice(rawQuery)) return null;
  return price;
};

const parseAiFilters = (rawFilters, fallbackKeywords, rawQuery) => {
  if (!rawFilters || typeof rawFilters !== "object") {
    return {
      category: null,
      subCategory: null,
      maxPrice: null,
      keywords: fallbackKeywords
    };
  }

  const parseKeywords = (keywords) => {
    if (!Array.isArray(keywords)) return fallbackKeywords;
    return keywords
      .map((kw) => kw?.toString().trim())
      .filter((kw) => kw && kw.length > 0);
  };

  return {
    category: normalizeCategory(rawFilters.category),
    subCategory: normalizeSubCategory(rawFilters.subCategory),
    maxPrice: normalizeMaxPriceValue(rawFilters.maxPrice, rawQuery),
    keywords: parseKeywords(rawFilters.keywords)
  };
};

const buildMongoQuery = (filters, rawQuery) => {
  const query = {};

  if (filters.category) query.category = filters.category;
  if (filters.subCategory) query.subCategory = filters.subCategory;
  if (filters.maxPrice != null) query.price = { $lte: filters.maxPrice };

  if (filters.keywords?.length) {
    const safeKeywords = filters.keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    query.$or = [
      { name: { $regex: safeKeywords.join("|"), $options: "i" } },
      { description: { $regex: safeKeywords.join("|"), $options: "i" } }
    ];
  }

  if (Object.keys(query).length === 0) {
    query.$or = [
      { name: { $regex: rawQuery, $options: "i" } },
      { description: { $regex: rawQuery, $options: "i" } }
    ];
  }

  return query;
};

const shouldUseAI = (q, words, basicCount) => {
  if (basicCount < 3) return true;
  if (words.length > 3) return true;
  return /\b(affordable|cheap|best|recommend|suggest|need|want|for|with|size|color|material|style|occasion|winter|summer|autumn|spring)\b/i.test(q);
};

const fetchAiFilters = async (q, fallbackKeywords) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
Extract filters from clothing search query and return ONLY valid JSON.
{
  "category": "Men | Women | Kids | null",
  "subCategory": "Topwear | Bottomwear | Winterwear | null",
  "maxPrice": number or null,
  "keywords": []
}

If the user does not specify a numeric price, return maxPrice: null. Do not infer a number from words like affordable, cheap, budget, or value.

Query: "${q}"
`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text().replace(/```json|```/g, "").trim();
    console.log("Task Completed Successfully with Gemini");
    return parseAiFilters(JSON.parse(raw), fallbackKeywords, q);
  } catch (geminiError) {
    console.log("⚠️ Gemini failed → switching to Groq");
  }

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0,
      max_tokens: 150,
      messages: [
        {
          role: "system",
          content: `
Return ONLY valid JSON. No markdown.
{
  "category": "Men | Women | Kids | null",
  "subCategory": "Topwear | Bottomwear | Winterwear | null",
  "maxPrice": number or null,
  "keywords": []
}

If the user does not specify a numeric price, return maxPrice: null. Do not infer a number from words like affordable, cheap, or budget.
`
        },
        { role: "user", content: `Query: "${q}"` }
      ]
    });

    let raw = completion.choices[0].message.content.trim();
    raw = raw.replace(/```json|```/g, "").trim();
    console.log("Task Completed Sucessfully with Groq");
    return parseAiFilters(JSON.parse(raw), fallbackKeywords, q);
  } catch (groqError) {
    console.log("❌ Groq failed → fallback", groqError?.message);
    return {
      category: null,
      subCategory: null,
      maxPrice: null,
      keywords: fallbackKeywords
    };
  }
};

const createSearchResponse = (products, filters, usedAI) => ({
  success: true,
  products: products
    .map((p) => ({ ...p._doc, score: scoreProduct(p, filters) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 20),
  filters,
  usedAI
});

const aiSearchProducts = async (req, res) => {
  try {
    const { q } = req.body;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Query is required" });
    }

    const normalizedQ = q.trim();
    const words = toQueryWords(normalizedQ);
    const basicText = words.length > 0 ? words.join("|") : normalizedQ;

    const basicQuery = {
      $or: [
        { name: { $regex: basicText, $options: "i" } },
        { description: { $regex: basicText, $options: "i" } }
      ]
    };

    const basicResults = await productModel.find(basicQuery).limit(10);
    const useAI = shouldUseAI(normalizedQ, words, basicResults.length);

    const keywordFilters = {
      category: null,
      subCategory: null,
      maxPrice: null,
      keywords: words
    };

    if (!useAI) {
      const response = createSearchResponse(basicResults, keywordFilters, false);
      searchCache.set(normalizedQ, response);
      setTimeout(() => searchCache.delete(normalizedQ), 10 * 60 * 1000);
      return res.json(response);
    }

    const filters = await fetchAiFilters(normalizedQ, words);
    const mongoQuery = buildMongoQuery(filters, normalizedQ);
    const products = await productModel.find(mongoQuery).limit(200);

    const response = createSearchResponse(products, filters, true);
    searchCache.set(normalizedQ, response);
    setTimeout(() => searchCache.delete(normalizedQ), 10 * 60 * 1000);
    return res.json(response);
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


// ─────────────────────────────────────────────
// AI DESCRIPTION
// ─────────────────────────────────────────────

const generateDescription = async (req, res) => {
    try {
        const { name, category, subCategory } = req.body;

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash"
        });

        const prompt = `
Write a premium product description (max 40 words).

Product:
${name}, ${category}, ${subCategory}
`;

        const result = await model.generateContent(prompt);

        res.json({
            success: true,
            description: result.response.text().trim()
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// ─────────────────────────────────────────────

export {
    listProducts,
    addProduct,
    removeProduct,
    singleProduct,
    aiSearchProducts,
    generateDescription
};