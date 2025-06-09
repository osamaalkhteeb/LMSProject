import bcrypt from "bcryptjs";
import UserModel from "../models/user.model.js";
import { createResponse } from "../utils/helper.js";
import { HTTP_STATUS, USER_ROLES } from "../config/constants.js";

export const UserController = {
  // Get current user profile
  async getProfile(req, res) {
    try {
      const user = await UserModel.findUserById(req.user.id);

      if (!user) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json(createResponse(false, "User not found"));
      }

      res.json(createResponse(true, "Profile retrieved successfully", user));
    } catch (error) {
      console.error("Get profile error:", error);
      res
        .status(HTTP_STATUS.SERVER_ERROR)
        .json(createResponse(false, "Failed to retrieve profile"));
    }
  },

  //Update user profile
  async updateProfile(req, res) {
    try {
      const { name, bio, avatar_url } = req.body;
      const userId = req.user.id;

      const updatedUser = await UserModel.updateUser(userId, {
        name: name.trim(),
        bio: bio?.trim() || null,
        avatar_url: avatar_url?.trim() || null,
      });

      if (!updatedUser) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json(createResponse(false, "User not found"));
      }

      res.json(
        createResponse(true, "Profile updated successfully", updatedUser)
      );
    } catch (error) {
      console.error("Update profile error:", error);
      res
        .status(HTTP_STATUS.SERVER_ERROR)
        .json(createResponse(false, "Failed to update profile"));
    }
  },

  // Change password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      // Get user with password
      const user = await UserModel.findUserByEmail(req.user.email);

      if (!user || !user.password_hash) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createResponse(false, "Cannot change password for OAuth users")
          );
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(
        currentPassword,
        user.password_hash
      );
      if (!isValidPassword) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(createResponse(false, "Current password is incorrect"));
      }

      // Prevent using the same password
      if (currentPassword === newPassword) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createResponse(
              false,
              "New password cannot be the same as the current password"
            )
          );
      }

      // Hash new password
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
      const hashedNewPass = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await UserModel.updatePassword(userId, hashedNewPass);

      res.json(createResponse(true, "Password changed successfully"));
    } catch (error) {
      console.error("Change password error:", error);
      res
        .status(HTTP_STATUS.SERVER_ERROR)
        .json(createResponse(false, "Failed to change password"));
    }
  },

  // Get all users (Admin only)
  async getAllUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const users = await UserModel.getAllUsers(limit, offset);

      res.json(
        createResponse(true, "Users retrieved successfully", {
          users,
          pagination: {
            page,
            limit,
            total: users.length,
          },
        })
      );
    } catch (error) {
      console.error("Get all users error:", error);
      res
        .status(HTTP_STATUS.SERVER_ERROR)
        .json(createResponse(false, "Failed to retrieve users"));
    }
  },

  // Get Users by role (Admin/Instructor)
  async getUsersByRole(req, res) {
    try {
      const { role } = req.params;

      // Validate role
      if (!Object.values(USER_ROLES).includes(role)) {
        // we use the Object bc the USER_ROLES is an obj
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(createResponse(false, "Invalid role"));
      }

      const users = await UserModel.getUserByRole(role);

      res.json(createResponse(true, `${role}s retrieved successfully`, users));
    } catch (error) {
      console.error("Get users by role error:", error);
      res
        .status(HTTP_STATUS.SERVER_ERROR)
        .json(createResponse(false, "Failed to retrieve users"));
    }
  },

  // Get user by ID (Admin/Instructor)
  async getUsersById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(createResponse(false, "Invalid user ID"));
      }

      const user = await UserModel.findUserById(parseInt(id));

      if (!user) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json(createResponse(false, "User not found"));
      }

      res.json(createResponse(true, "User retrieved successfully", user));
    } catch (error) {
      console.error("Get user by Id error:", error);
      res
        .status(HTTP_STATUS.SERVER_ERROR)
        .json(createResponse(false, "Failed to retrieve user"));
    }
  },

  // Toggle user status (Admin only)
  async toggleUserStatus(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(createResponse(false, "Invalid user ID"));
      }

      //Prevent admin from deactivating themselves
      if (parseInt(id) === req.user.id) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(createResponse(false, "Cannot modify your own status"));
      }

      const result = await UserModel.toggleUserStatus(parseInt(id));

      if (!result) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json(createResponse(false, "User not found"));
      }

      const status = result.is_active ? "activated" : "deactivated";
      res.json(createResponse(true, `User ${status} successfully`, result));
    } catch (error) {
      console.error("Toggle user status error:", error);
      res
        .status(HTTP_STATUS.SERVER_ERROR)
        .json(createResponse(false, "Failed to update user status"));
    }
  },

  // Delete user (Admin only)
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(createResponse(false, "Invalid user ID"));
      }

      // Prevent admin from deleting themselves
      if (parseInt(id) === req.user.id) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(createResponse(false, "Cannot delete your own account"));
      }

      const result = await UserModel.deleteUser(parseInt(id));

      if (!result) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json(createResponse(false, "User not found"));
      }

      res.json(createResponse(true, "User deleted successfully"));
    } catch (error) {
      console.error("Delete user error:", error);
      res
        .status(HTTP_STATUS.SERVER_ERROR)
        .json(createResponse(false, "Failed to delete user"));
    }
  },

  //Get user statistics (Admin only)
  async getUserStats(req, res) {
    try {
      const stats = await UserModel.getUserStats();

      res.json(
        createResponse(true, "User statistics retrieved successfully", stats)
      );
    } catch (error) {
      console.error("Get user stats error", error);
      res
        .status(HTTP_STATUS.SERVER_ERROR)
        .json(createResponse(false, "Failed to retrieve user statistics"));
    }
  },
};
