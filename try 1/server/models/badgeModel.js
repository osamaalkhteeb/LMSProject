import { query } from "../config/db.js";

const BadgeModel = {

    //We create a new badge
  async create({ name, description, icon_url }) {
    const { rows } = await query(
      "INSERT INTO badges (name, description, icon_url) VALUES ($1, $2, $3) RETURNING *",
      [name, description, icon_url]
    );
    return rows[0];
  },

  //We find a badge by its id
  async findById(id) {
    const { rows } = await query("SELECT * FROM badges WHERE id = $1", [id]);
    return rows[0];
  },

  //We find all badges
  async findAll() {
    const { rows } = await query("SELECT * FROM badges");
    return rows;
  },

  //We update a badge by its id
  async awardBadgeToUser(userId, badgeId) {
    const { rows } = await query(
      "INSERT INTO user_badges (user_id, badge_id, awarded_at) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING *",
      [userId, badgeId]
    );
    return rows[0];
  },

  //We find all badges for a user
  async getUserBadges(userId) {
    const { rows } = await query(
      "SELECT b.* FROM badges b JOIN user_badges ub ON b.id = ub.badge_id WHERE ub.user_id = $1",
      [userId]
    );
    return rows;
  }
};

export default BadgeModel;