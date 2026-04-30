
import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js"
import { GoogleGenerativeAI } from "@google/generative-ai";


// function for add product
const addProduct = async (req, res) => {
    try {
        
        //Extracts the product details from req.body
        const { name, description, price, category, subCategory, sizes, bestseller } = req.body
       
        // Extracts upto 4 images from req..files Using multer
        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]
        
        //Filter out any undefined images means that keep only images uploaded.
        const images = [image1, image2, image3, image4].filter((item) => item !== undefined)
        
        
        
        //Upload all images to cloudinary using cloudinary.uploader.upload
        // waits for the upload to complete
        // returns the secure_url of images.
        // promise.all ensures all the images are uploaded
        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                return result.secure_url
            })
        )

        // Create new ProductData object with values from req.body
        const productData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory,
            bestseller: bestseller === "true" ? true : false,
            sizes: JSON.parse(sizes),
            image: imagesUrl,
            date: Date.now()
        }

        // console.log(productData);

        //Create new product model using product data object
        const product = new productModel(productData);
        await product.save()

        res.json({ success: true, message: "Product Added" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for list product
const listProducts = async (req, res) => {
    try {
        
        const products = await productModel.find({});
        res.json({success:true,products})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for removing product
const removeProduct = async (req, res) => {
    try {
        
        await productModel.findByIdAndDelete(req.body.id)
        res.json({success:true,message:"Product Removed"})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for single product info
const singleProduct = async (req, res) => {
    try {
        
        const { productId } = req.body
        const product = await productModel.findById(productId)
        res.json({success:true,product})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}




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
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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

const generateDescription = async (req, res) => {
  try {
    const { name, category, subCategory } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Product name required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are a product description generator for an e-commerce clothing brand.

Write a high-quality product description.

Product details:
- Name: ${name}
- Category: ${category}
- SubCategory: ${subCategory}

Rules:
- Keep it under 40 words
- Make it sound premium and appealing
- Mention comfort, style, and usage
- Do NOT include emojis
- Return ONLY the description (no extra text)
`;

    const result = await model.generateContent(prompt);
    const description = result.response.text().trim();
    res.json({
      success: true,
      description
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { listProducts, addProduct, removeProduct, singleProduct, aiSearchProducts, generateDescription }