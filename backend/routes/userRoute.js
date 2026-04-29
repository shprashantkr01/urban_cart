// import express from 'express';
// import { loginUser,registerUser,adminLogin } from '../controllers/userController.js';
// import loginLimiter from "../middleware/rateLimiter.js";
// const userRouter = express.Router();

// userRouter.post('/register',registerUser)
// userRouter.post('/login',loginUser)
// userRouter.post('/admin',adminLogin)
// userRouter.post("/login", loginLimiter, loginUser);
// export default userRouter;



import express from 'express';
import { loginUser, registerUser, adminLogin, refreshToken } from '../controllers/userController.js';
import loginLimiter from "../middleware/rateLimiter.js";

const userRouter = express.Router();

// User routes
userRouter.post('/register', registerUser);
userRouter.post('/login', loginLimiter, loginUser);

// 🔥 IMPORTANT: Refresh token route
userRouter.post('/refresh', refreshToken);

// Admin route
userRouter.post('/admin', adminLogin);

export default userRouter;

