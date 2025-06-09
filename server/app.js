import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import session from "express-session";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { globalLimiter } from "./config/rateLimit.js";
import sessionConfig from "./config/session.js";
import passport from "./config/passport.js";

import "./config/db.js";
import { createResponse } from "./utils/helper.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";

dotenv.config();

const app = express();
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development, configure for production
  crossOriginEmbedderPolicy: false
}));


app.use(globalLimiter);

app.use(
  cors({
    origin: process.env.CLIENT_URL, // The frontend domain allowed to access your API
    credentials: true, // Allows cookies and sessions to be sent
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Initialize session
app.use(session(sessionConfig));

// Initialize passport and session
app.use(passport.initialize());
app.use(passport.session());

// Register routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.get('/health', (req, res) => {
  res.json(createResponse(true, 'Server is running', {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  }));
});


export default app;