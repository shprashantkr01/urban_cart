import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

// 🔐 Token utilities
const createAccessToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "15m" });
};

const createRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET , { expiresIn: "7d" });
};

// 🔐 Login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const accessToken = createAccessToken(user._id);
        const refreshToken = createRefreshToken(user._id);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({ success: true, accessToken });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 🔐 Register
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Invalid email" });
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Password too short" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword,
        });

        const user = await newUser.save();

        const accessToken = createAccessToken(user._id);
        const refreshToken = createRefreshToken(user._id);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(201).json({ success: true, accessToken });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 🔄 Refresh Token
const refreshToken = (req, res) => {
    const token = req.cookies.refreshToken;

    if (!token) {
        return res.status(401).json({ message: "No refresh token" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET );
        const newAccessToken = createAccessToken(decoded.id);

        res.json({ accessToken: newAccessToken });

    } catch (error) {
        return res.status(403).json({ message: "Invalid refresh token" });
    }
};

// 🔐 Admin Login
// const adminLogin = async (req, res) => {
//     const { email, password } = req.body;

//     if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
//         const token = jwt.sign(
//             { role: "admin" },
//             process.env.JWT_SECRET,
//             { expiresIn: "1d" }
//         );

//         return res.json({ success: true, token });
//     }

//     return res.status(401).json({ success: false, message: "Invalid credentials" });
// };

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(
        { role: "admin", email },           // ✅ include role
        process.env.JWT_SECRET,
        { expiresIn: "7d" }                 // optional but good
      );

      return res.json({ success: true, token });
    }

    return res.status(401).json({ success: false, message: "Invalid credentials" });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export { loginUser, registerUser, refreshToken, adminLogin };

