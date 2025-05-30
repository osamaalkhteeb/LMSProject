import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import { HTTP_STATUS } from "../config/constants.js";

export const authenticate = async (req, res, next) => {
  const token =
    req.cookies?.token || req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: "Access denied. No token provided",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { rows } = await pool.query(
      "SELECT id, email, role FROM users WHERE id = $1",
      [decoded.id]
    );

    if (!rows[0]) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: "Invalid token",
      });
    }
    req.user = rows[0];
    next();
  } catch (error) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: "Invalid or expired token",
    });
  }
};

export const authorize = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      error: "Permission denied",
    });
  }
  next();
};


// checks both cookies and Authorization header for JWT