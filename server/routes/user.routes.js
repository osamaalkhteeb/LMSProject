import express from "express";
import { UserController } from "../controllers/user.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { schema, validateRequest } from "../middleware/validate.js";
import { USER_ROLES } from "../config/constants.js";
import { uploadImage } from "../middleware/upload.js";

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Profile routes ( authenticated users)
router.get("/profile", UserController.getProfile);
router.put("/profile", validateRequest(schema.updateProfile), UserController.updateProfile);
router.put("/change-password", validateRequest(schema.changePassword), UserController.changePassword);

// Image upload route
router.post("/upload-image", uploadImage.single("image"), UserController.uploadProfileImage);

// Admin only routes 
router.get("/", authorize([USER_ROLES.ADMIN]), UserController.getAllUsers);
router.get("/stats", authorize([USER_ROLES.ADMIN]), UserController.getUserStats);
router.get("/role/:role", authorize([USER_ROLES.ADMIN, USER_ROLES.INSTRUCTOR]), UserController.getUsersByRole);
router.get("/:id", authorize([USER_ROLES.ADMIN, USER_ROLES.INSTRUCTOR]), UserController.getUsersById);
router.patch("/:id/toggle-status", authorize([USER_ROLES.ADMIN]), UserController.toggleUserStatus);
router.delete("/:id", authorize([USER_ROLES.ADMIN]), UserController.deleteUser);

export default router;