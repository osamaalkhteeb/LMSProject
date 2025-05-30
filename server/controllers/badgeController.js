import BadgeModel from "../models/badgeModel.js";

const BadgeController = {
    // Create a new badge
  async createBadge(req, res, next) {
    try {
      const { name, description, icon_url } = req.body;
      
      if (!name) throw new Error("Badge name is required");
      
      const badge = await BadgeModel.create({ name, description, icon_url });
      res.status(201).json({ success: true, badge });
    } catch (error) {
      next(error);
    }
  },

  // Get a badge by ID
  async getAllBadges(req, res, next) {
    try {
      const badges = await BadgeModel.findAll();
      res.json({ success: true, badges });
    } catch (error) {
      next(error);
    }
  },

  // Award a badge to a user
  async awardBadge(req, res, next) {
    try {
      const { userId, badgeId } = req.body;
      
      if (!userId || !badgeId) throw new Error("User ID and Badge ID are required");
      
      const userBadge = await BadgeModel.awardBadgeToUser(userId, badgeId);
      res.status(201).json({ success: true, userBadge });
    } catch (error) {
      next(error);
    }
  },

  // Get all badges for a user
  async getUserBadges(req, res, next) {
    try {
      const userId = req.params.userId || req.user.id;
      const badges = await BadgeModel.getUserBadges(userId);
      res.json({ success: true, badges });
    } catch (error) {
      next(error);
    }
  }
};

export default BadgeController;