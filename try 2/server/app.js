import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import session from "express-session";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { globalLimiter } from "./config/rateLimit.js";

import "./config/db.js";

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



app.get('/health', (req, res) => {
  res.json(createResponse(true, 'Server is running', {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  }));
});


export default app;