import { query } from "../config/db.js";

const UserModel = {
  // find user by email
  async findUserByEmail(email) {
    try {
      const { rows } = await query(
        "SELECT id, name, email, role, password_hash, oauth_provider, oauth_id FROM users WHERE email = $1",
        [email]
      );
      return rows[0];
    } catch (error) {
      console.error("Error finding user by Email:", error);
      throw error;
    }
  },
  
  // find user by id
  async findUserById(id) {
    try {
      const { rows } = await query(
        "SELECT id, name, email, role, bio, avatar_url, is_active, created_at FROM users WHERE id = $1",
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error("Error finding user by ID:", error);
      throw error;
    }
  },
  
  // find user by OAuth
  async findUserByOAuthId(oauthId) {
    try {
      const { rows } = await query(
        "SELECT id, name, email, role, oauth_provider, oauth_id FROM users WHERE oauth_id = $1",
        [oauthId]
      );
      return rows[0];
    } catch (error) {
      console.error("Error finding user by OAuth Id:", error);
      throw error;
    }
  },

  // create new user
  async createUser({ name, email, hashedPassword, role = "student" }) {
    try {
      const { rows } = await query(
        "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
        [name, email, hashedPassword, role]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  },
  
  // create OAuth user
  async createOAuthUser({ name, email, oauth_provider, oauth_id, avatar_url, role = "student" }) {
    try {
      const { rows } = await query(
        "INSERT INTO users (name, email, avatar_url, oauth_provider, oauth_id, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role",
        [name, email, avatar_url, oauth_provider, oauth_id, role]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  },

  //update last login
  async updateLastLogin(id) {
    try {
      await query("UPDATE users SET last_login_at = NOW() WHERE id = $1", [id]);
    } catch (error) {
      throw error;
    }
  },

  // get all users (admin)
  async getAllUsers(limit = 20, offset = 0) {
    try {
      const { rows } = await query(
        "SELECT id, name, email, role, is_active, created_at, last_login_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2",
        [limit, offset]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  },

  //get users by role
  async getUserByRole(role) {
    try {
      const { rows } = await query(
        "SELECT id, name, email, role, is_active FROM users WHERE role = $1",
        [role]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  },
  
  // Update user
  async updateUser(id, { name, bio, avatar_url }) {
    try {
      const { rows } = await query(
        "UPDATE users SET name = $1, bio = $2, avatar_url = $3, updated_at = NOW() WHERE id = $4 RETURNING id, name, email, role, bio, avatar_url",
        [name, bio, avatar_url, id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  },

  //toggle user active status (admin)
  async toggleUserStatus(id) {
    try {
      const { rows } = await query(
        "UPDATE users SET is_active = NOT is_active, updated_at = NOW() WHERE id = $1 RETURNING id, is_active",
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Delete user (admin only)
  async deleteUser(id) {
    try {
      const { rows } = await query(
        "DELETE FROM users WHERE id = $1 RETURNING id",
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Check if email exists
  async emailExists(email) {
    try {
      const { rows } = await query("SELECT id FROM users WHERE email = $1", [
        email,
      ]);
      return rows.length > 0;
    } catch (error) {
      throw error;
    }
  },

  // Get user stats (for admin dashboard)
  async getUserStats() {
    try {
      const { rows } = await query(`
        SELECT 
          COUNT(*) as total_users, 
          COUNT(CASE WHEN role = 'student' THEN 1 END) as students, 
          COUNT(CASE WHEN role = 'instructor' THEN 1 END) as instructors, 
          COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins, 
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_users, 
          COUNT(CASE WHEN last_login_at > NOW() - INTERVAL '7 days' THEN 1 END) as recent_logins 
        FROM users
      `);
      return rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Update password
  async updatePassword(id, hashedPassword) {
    try {
      const { rows } = await query(
        "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2 RETURNING id",
        [hashedPassword, id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }
};

export default UserModel;