
// // Validator is npm package for String validation and sanitization
// import validator from "validator";
// // Bcrypt is a library to hash password securely.
// import bcrypt from "bcrypt"
// // Json Web token Used for authentication and authorization based user requests.
// import jwt from 'jsonwebtoken'
// import userModel from "../models/userModel.js";

// //1. token creation utility 
// // Creates JWT token using user's unique id as payload
// // const createToken = (id) => {
// //     return jwt.sign({ id }, process.env.JWT_SECRET)
// // }

// const createAccessToken = (id) => {
//     return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "15m" });
// };

// const createRefreshToken = (id) => {
//     return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
// };

// //2. Route for user login
// const loginUser = async (req, res) => {
//     try {
//         // extract email and password from incoming req.body
//         const { email, password } = req.body;
//         // searches the userModel for matching email
//         const user = await userModel.findOne({ email });
//         //If no user found response user dont exists.
//         if (!user) {
//             return res.json({ success: false, message: "User doesn't exists" })
//         }
//         //Cimpare user.password and databse password
//         const isMatch = await bcrypt.compare(password, user.password);
//         // If password matches securely sends the token.
//         if (isMatch) {

//             const token = createToken(user._id)
//             res.json({ success: true, token })

//         }
//         else {
//             res.json({ success: false, message: 'Invalid credentials' })
//         }

//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: error.message })
//     }
// }

// //3. Route for user register
// const registerUser = async (req, res) => {
//     try {
//         // Extract name, email, password from request body.
//         const { name, email, password } = req.body;

//         // checking user already exists or not
//         const exists = await userModel.findOne({ email });
//         if (exists) {
//             return res.json({ success: false, message: "User already exists" })
//         }

//         // validating email format & strong password
//         if (!validator.isEmail(email)) {
//             return res.json({ success: false, message: "Please enter a valid email" })
//         }
//         if (password.length < 8) {
//             return res.json({ success: false, message: "Please enter a strong password" })
//         }

//         // hashing user password
//         const salt = await bcrypt.genSalt(10)
//         const hashedPassword = await bcrypt.hash(password, salt)

//         const newUser = new userModel({
//             name,
//             email,
//             password: hashedPassword
//         })

//         const user = await newUser.save()

//         const token = createToken(user._id)

//         res.json({ success: true, token })

//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: error.message })
//     }
// }

// // Route for admin login
// const adminLogin = async (req, res) => {
//     try {
//         // Extracting email and password from user req.
//         const {email,password} = req.body
//         // Matching the .env credentials with user req credentials.
//         if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
//             const token = jwt.sign(email+password,process.env.JWT_SECRET);//JWT_secret is a string that is treated as a verifying password by the server to verify that the server signed the token.
//             res.json({success:true,token})
//         } else {
//             res.json({success:false,message:"Invalid credentials"})
//         }

//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: error.message })
//     }
// }


// export { loginUser, registerUser, adminLogin }



/************************************************************************************************************************ */




import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

// 🔐 Token utilities
const createAccessToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "15m" });
};

const createRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
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
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
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

