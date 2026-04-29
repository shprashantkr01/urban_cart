import mongoose from "mongoose";
// User Schema model
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} }// CartData object is default empty{} unless added.
}, { minimize: false })

//Searches for user if found retrieves it else creates a new user.
const userModel = mongoose.models.user || mongoose.model('user',userSchema);

export default userModel