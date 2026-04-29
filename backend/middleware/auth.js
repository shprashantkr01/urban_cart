// import jwt from 'jsonwebtoken'

// const authUser = async (req, res, next) => {
//     //Extracts the token from req headers.
//     const { token } = req.headers;

//     //If the token is not found it responds with failure and does not call next()
//     if (!token) {
//         return res.json({ success: false, message: 'Not Authorized Login Again' })
//     }

//     try {
//         //verifies the token using jwt_secret
//         const token_decode = jwt.verify(token, process.env.JWT_SECRET)
//         req.body.userId = token_decode.id
//         next() // pass control to the next middleware or route handler.

//     } catch (error) {
//         console.log(error)
//         res.json({ success: false, message: error.message })
//     }

// }

// export default authUser

/*********************************************************************************************************** */

import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ success: false, message: "No token provided" });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.body.userId = decoded.id;

        next();

    } catch (error) {
        return res.status(403).json({ success: false, message: "Invalid or expired token" });
    }
};

export default authUser;

