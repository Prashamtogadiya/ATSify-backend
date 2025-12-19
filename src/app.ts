import express from "express";
import authRouter from "./routes/auth.routes";
import resumeRouter from "./routes/resume.routes";
import jobRequestRoutes from "./routes/jobRequest.routes";
import analysisRouter from "./routes/analysis.routes";
import cookieParser from "cookie-parser";
import httpLogger from "./middleware/httpLogger";
import cors from "cors";
import compression from "compression";
import { notFoundHandler } from "./middleware/notFound.middleware";
import { errorHandler } from "./middleware/errorHandler";
import path from "path";

const app = express();

app.use(compression());

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173", // your frontend
    credentials: true, // allow cookies, auth headers
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware to parse JSON bodies
app.use(express.json());

// HTTP request logger middleware
app.use(httpLogger);

// Middleware to parse cookies
app.use(cookieParser());

// Middleware to set Access-Control-Allow-Credentials header
// remaining from checking CORS issues with cookies
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// Serve static files from the "uploads" directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// auth routes
app.use("/api/v1/auth", authRouter);

// resume routes
app.use("/api/v1/resume", resumeRouter);

// job request routes
app.use("/api/v1/job-requests", jobRequestRoutes);

// analysis routes
app.use("/api/v1/analysis", analysisRouter);

// 404 handler — should be AFTER all routes
app.use(notFoundHandler);

// error handler middleware for handling errors globally
app.use(errorHandler);

export default app;
