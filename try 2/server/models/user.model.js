import { query } from "../config/db.js";

const UserModel = {
  // to find a specific email
  async findUserByEmail(email) {
    try {
      const { rows } = await query(
        "SELECT id,name,email,role,password_hash FROM users WHERE email = $1",
        [email]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  },
  // to find a specific id
  async findUserById(id) {
    try {
      const { rows } = await query(
        "SELECT id,name,email,role,bio,avatar_url FROM users WHERE id =$1",
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  },
  // create new user
  async createUser({ name, email, hashedPassword, role = "student" }) {
    try {
      const { rows } = await query(
        "INSERT INTO users (name,email,password_hash,role) VALUES ($1, $2,$3,$4) RETURNING id,name,email,role",
        [name, email, hashedPassword, role]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  },
  //update last login
  async updateLastLogin(id) {
    await query("UPDATE users SET last_login_at = NOW() WHERE id = $1", [id]);
  },

  // get all users (admin)
  async getAllUsers() {
    try {
      const { rows } = await query(
        "SELECT id,name,email,role,is_active FROM users"
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
        "UPDATE users SET name = $1, bio = $2, avatar_url = $3, updated_at = NOW() WHERE id = $4 RETURNING id,name,email,role,bio,avatar_url",
        [name, bio, avatar_url, id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  },
  
  //delete user
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
};
