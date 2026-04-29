import mongoose from "mongoose";

// Product Schema model
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: Array, required: true },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    sizes: { type: Array, required: true },
    bestseller: { type: Boolean },
    date: { type: Number, required: true }
})

// If the product already exists in the mongoose use it otherwise create a new product.
const productModel  = mongoose.models.product || mongoose.model("product",productSchema);

export default productModel