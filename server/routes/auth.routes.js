import express from "express";
import passport from "passport";
import { authLimiter } from "../config/rateLimit.js";
import { AuthController } from "../controllers/auth.controller.js";
import { schema, validateRequest } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import { createResponse } from "../utils/helper.js";

const router = express.Router();

// Apply rate limiting to all auth routes 
router.use(authLimiter);

// Public routes 
router.post("/register", validateRequest(schema.register), AuthController.register);
router.post("/login", validateRequest(schema.login), AuthController.login);
router.post("/logout", AuthController.logout);
router.post("/refresh-token", AuthController.refreshToken);

// OAuth routes 
router.get("/google",AuthController.googleCallback);
router.get("/google/callback",AuthController.googleCallback);

// Protected routes
router.get("/me", authenticate, AuthController.getCurrentUser);

export default router;