// import jwt from 'jsonwebtoken'

// const adminAuth = async (req,res,next) => {
//     try {
//         //Extract token from req.header
//         const { token } = req.headers
//         // if token not found return not authorized
//         if (!token) {
//             return res.json({success:false,message:"Not Authorized Login Again"})
//         }

//         // if found decode the token using verify
//         const token_decode = jwt.verify(token,process.env.JWT_SECRET);
//         //if the token is not matched then return not authorized 
//         if (token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
//             return res.json({success:false,message:"Not Authorized Login Again"})
//         }
//         //else call the next middleware or route.
//         next()
//     } catch (error) {
//         console.log(error)
//         res.json({ success: false, message: error.message })
//     }
// }

// export default adminAuth
/****************************************************************************************************************** */



import jwt from "jsonwebtoken";

const adminAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ success: false, message: "Not authorized" });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== "admin") {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        next();

    } catch (error) {
        return res.status(403).json({ success: false, message: "Invalid token" });
    }
};

export default adminAuth;

