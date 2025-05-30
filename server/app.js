import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import session from "express-session";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import badgeRoutes from "./routes/badgeRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import videoNoteRoutes from "./routes/videoNoteRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import { notFound, errorHandler } from "./middlewares/error.js";
import "./config/db.js"; // we import this to initialize DB connection 

// Load env var from the .env file 
dotenv.config();

// Create an instance of Express app
const app = express();

// Security middleware

// Add security headers to all responses (prevents some known vulnerabilities)
app.use(helmet());

//This allows your backend to accept requests from a different domain (like a frontend app)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN, // The frontend domain allowed to access your API
    credentials: true, // Allows cookies and sessions to be sent
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Log HTTP requests to the console (GET /api/auth/login 200 5ms)
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

//Parse incoming JSON payloads (req.body will contain parsed JSON)
app.use(express.json());

//Parse cookies from the incoming requests (used for authentication/session)
app.use(cookieParser());


// Setup session management
// This keeps user sessions alive between page loads
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/notes", videoNoteRoutes);
app.use("/api/certificates", certificateRoutes);

//If no route matches, this middleware sends a 404 Not Found
app.use(notFound);

//Custom error handler to catch and respond to all errors in the app
app.use(errorHandler);

export default app;
