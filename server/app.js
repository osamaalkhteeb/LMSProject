import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import session from "express-session";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import badgeRoutes from "./routes/badgeRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import videoNoteRoutes from "./routes/videoNoteRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";

// Import utilities 
import { notFound, errorHandler } from "./middlewares/error.js";

import "./config/db.js"; // we import this to initialize DB connection 
import sessionConfig from "./config/session.js";

// Load env var from the .env file 
dotenv.config();

// Create an instance of Express app
const app = express();

// Security middleware

// Add security headers to all responses (prevents some known vulnerabilities)
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development, configure for production
  crossOriginEmbedderPolicy: false
}));


// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: createResponse(false, 'Too many requests', null, 'Rate limit exceeded'),
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);


//This allows your backend to accept requests from a different domain (like a frontend app)
app.use(
  cors({
    origin: process.env.CLIENT_URL, // The frontend domain allowed to access your API
    credentials: true, // Allows cookies and sessions to be sent
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Log HTTP requests to the console (GET /api/auth/login 200 5ms)
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

//Parse incoming JSON payloads (req.body will contain parsed JSON)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

//Parse cookies from the incoming requests (used for authentication/session)
app.use(cookieParser());


// Setup session management
// This keeps user sessions alive between page loads

// Session middleware
app.use(session(sessionConfig));

// Passport middleware
// app.use(passport.initialize());
// app.use(passport.session());


// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/notes", videoNoteRoutes);
app.use("/api/certificates", certificateRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json(createResponse(true, 'Server is running', {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  }));
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

export default app;
