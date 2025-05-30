import { Router } from "express";
import BadgeController from "../controllers/badgeController.js";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

// Admin routes
router.post("/", authenticate, BadgeController.createBadge); // Create a new badge
router.post("/award", authenticate, BadgeController.awardBadge); // Award a badge to a user

// Public routes
router.get("/", BadgeController.getAllBadges); // Get all badges
router.get("/user/:userId?", authenticate, BadgeController.getUserBadges);// Get badges for a user

export default router;