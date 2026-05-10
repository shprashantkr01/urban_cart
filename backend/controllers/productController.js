/**
 * ────────────────────────────────────────────────────────────────
 * PRODUCT CONTROLLER
 * ────────────────────────────────────────────────────────────────
 *
 * This controller manages:
 * - Product CRUD operations
 * - AI-powered semantic product search
 * - AI-generated product descriptions
 *
 * Architecture Overview:
 * ------------------------------------------------
 * The controller follows a service-oriented architecture
 * where all business logic, AI orchestration, ranking,
 * parsing, normalization, and provider handling are
 * delegated to dedicated services and utility layers.
 *
 * Controller Responsibilities:
 * ------------------------------------------------
 * - Handle HTTP request/response lifecycle
 * - Validate incoming request flow
 * - Delegate operations to service layer
 * - Return standardized API responses
 * - Handle centralized error responses
 *
 * AI Search Pipeline:
 * ------------------------------------------------
 * User Query
 *    ↓
 * aiSearchService
 *    ↓
 * Query Orchestration (shouldUseAI)
 *    ↓
 * AI Filter Extraction (Gemini → Groq Fallback)
 *    ↓
 * AI Output Sanitization & Normalization
 *    ↓
 * MongoDB Retrieval
 *    ↓
 * Product Ranking Engine
 *    ↓
 * Final Search Response
 *
 * Key Engineering Features:
 * ------------------------------------------------
 * - Multi-model AI fallback architecture
 * - AI query orchestration
 * - AI output sanitization layer
 * - Search response caching
 * - Modular ranking system
 * - Scalable service-based architecture
 * - Future-ready for Hybrid RAG + Vector Search
 * ────────────────────────────────────────────────────────────────
 */




import { v2 as cloudinary } from "cloudinary";

import productModel from "../models/productModel.js";

import aiSearchService
  from "../services/search/aiSearchService.js";

import generateDescriptionService
  from "../services/ai/descriptionService.js";


// ─────────────────────────────────────────────
// PRODUCT CRUD CONTROLLERS
// ─────────────────────────────────────────────

/**
 * Add new product
 */
const addProduct = async (req, res) => {

  try {

    const {
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
      bestseller
    } = req.body;

    // Extract uploaded images
    const image1 = req.files.image1?.[0];
    const image2 = req.files.image2?.[0];
    const image3 = req.files.image3?.[0];
    const image4 = req.files.image4?.[0];

    const images = [
      image1,
      image2,
      image3,
      image4
    ].filter(Boolean);

    // Upload images to Cloudinary
    const imagesUrl = await Promise.all(

      images.map(async (item) => {

        const result =
          await cloudinary.uploader.upload(
            item.path,
            {
              resource_type: "image"
            }
          );

        return result.secure_url;
      })
    );

    // Create product object
    const productData = {

      name,

      description,

      category,

      subCategory,

      price: Number(price),

      bestseller: bestseller === "true",

      sizes: JSON.parse(sizes),

      image: imagesUrl,

      date: Date.now()
    };

    // Save product
    await new productModel(productData).save();

    return res.json({
      success: true,
      message: "Product Added"
    });

  } catch (error) {

    console.error(
      "Add Product Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


/**
 * Get all products
 */
const listProducts = async (req, res) => {

  try {

    const products =
      await productModel.find({});

    return res.json({
      success: true,
      products
    });

  } catch (error) {

    console.error(
      "List Products Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


/**
 * Remove product
 */
const removeProduct = async (req, res) => {

  try {

    await productModel.findByIdAndDelete(
      req.body.id
    );

    return res.json({
      success: true,
      message: "Product Removed"
    });

  } catch (error) {

    console.error(
      "Remove Product Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


/**
 * Get single product
 */
const singleProduct = async (req, res) => {

  try {

    const product =
      await productModel.findById(
        req.body.productId
      );

    return res.json({
      success: true,
      product
    });

  } catch (error) {

    console.error(
      "Single Product Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ─────────────────────────────────────────────
// AI SEARCH CONTROLLER
// ─────────────────────────────────────────────

/**
 * AI-powered product search
 */
const aiSearchProducts = async (
  req,
  res
) => {

  try {

    const result =
      await aiSearchService(req.body.q);

    if (!result.success) {

      return res
        .status(400)
        .json(result);
    }

    return res.json(result);

  } catch (error) {

    console.error(
      "AI Search Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ─────────────────────────────────────────────
// AI DESCRIPTION GENERATION
// ─────────────────────────────────────────────

/**
 * Generate AI-powered product description
 */
const generateDescription = async (
  req,
  res
) => {

  try {

    const result =
      await generateDescriptionService(
        req.body
      );

    if (!result.success) {

      return res
        .status(400)
        .json(result);
    }

    return res.json(result);

  } catch (error) {

    console.error(
      "Description Generation Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ─────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────

export {

  addProduct,

  listProducts,

  removeProduct,

  singleProduct,

  aiSearchProducts,

  generateDescription
};