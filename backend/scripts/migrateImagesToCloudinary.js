import mongoose from "mongoose";
import dotenv from "dotenv";

import { v2 as cloudinary } from "cloudinary";

import connectDB from '../config/mongodb.js';

import productModel from "../models/productModel.js";


// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────

dotenv.config({
  path: "./.env"
});
console.log(process.env.MONGODB_URI);
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY
});


// ─────────────────────────────────────────────
// IMAGE MIGRATION SCRIPT
// ─────────────────────────────────────────────

const migrateImages = async () => {

  try {

    console.log(
      "\n🚀 Starting image migration...\n"
    );

    // Connect DB
    await connectDB();

    console.log(
      "✅ MongoDB Connected\n"
    );

    let processed = 0;
    let skipped = 0;
    let failed = 0;

    // Stream products using cursor
    const cursor =
      productModel.find({}).cursor();

    for await (const product of cursor) {

      try {

        processed++;

        console.log(
          `\n[${processed}] Processing: ${product.name}`
        );

        // Validate image array
        if (
          !product.image ||
          !Array.isArray(product.image) ||
          product.image.length === 0
        ) {

          console.log(
            "⚠️ No images found → skipped"
          );

          skipped++;

          continue;
        }

        // Skip already migrated products
        if (
          product.image[0].includes(
            "cloudinary"
          )
        ) {

          console.log(
            "⏭ Already migrated → skipped"
          );

          skipped++;

          continue;
        }

        // Use only FIRST image
        const firstImage =
          product.image[0];

        console.log(
          "☁️ Uploading image to Cloudinary..."
        );

        // Upload base64 directly
        const uploadResult =
          await cloudinary.uploader.upload(
            firstImage,
            {
              folder: "urban-cart/products",
              resource_type: "image"
            }
          );

        const secureUrl =
          uploadResult.secure_url;

        // Replace all 4 entries
        product.image = [
          secureUrl,
          secureUrl,
          secureUrl,
          secureUrl
        ];

        // Save updated product
        await product.save();

        console.log(
          "✅ Migration successful"
        );

      } catch (productError) {

        failed++;

        console.error(
          `❌ Failed for product: ${product.name}`
        );

        console.error(
          productError.message
        );
      }
    }

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━");

    console.log(
      "🎉 IMAGE MIGRATION COMPLETED"
    );

    console.log(
      `✅ Processed: ${processed}`
    );

    console.log(
      `⏭ Skipped: ${skipped}`
    );

    console.log(
      `❌ Failed: ${failed}`
    );

    console.log("━━━━━━━━━━━━━━━━━━━━━━━\n");

    process.exit(0);

  } catch (error) {

    console.error(
      "\n❌ Migration script failed\n"
    );

    console.error(error);

    process.exit(1);
  }
};


// ─────────────────────────────────────────────
// START SCRIPT
// ─────────────────────────────────────────────

migrateImages();