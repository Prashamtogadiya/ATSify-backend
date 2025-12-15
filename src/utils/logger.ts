// Logger setup using Winston with daily rotated files
// - Creates separate folders for 'info', 'error', and 'http' logs
// - Supports custom log levels and colored console output
// - Handles exceptions and promise rejections
// - Rotates logs daily with size and retention limits
// - Formats logs with timestamp, level, and stack trace (if available)

import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import fs from "fs";

// Directory setup for logs
const logDir = "logs";
const folders = ["info", "error", "http"];
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

folders.forEach((folder) => {
  const dir = path.join(logDir, folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Custom log levels
const customLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Assign colors for console output
winston.addColors({
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
});

// Log format: timestamp [LEVEL]: message or stack trace
const logFormat = winston.format.printf(
  ({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level.toUpperCase()}] : ${stack || message}`;
  }
);

// Create logger instance
const logger = winston.createLogger({
  levels: customLevels,

  level: process.env.NODE_ENV === "production" ? "info" : "debug",

  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    logFormat
  ),

  transports: [
    // Console output with colors
    new winston.transports.Console({
      level: process.env.NODE_ENV === "production" ? "info" : "debug",
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, stack }) => {
          return `${timestamp} [${level}]: ${stack || message}`;
        })
      ),
    }),

    // Daily rotating files for info logs
    new DailyRotateFile({
      level: "info",
      dirname: path.join(logDir, "info"),
      filename: "%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    }),

    // Daily rotating files for error logs
    new DailyRotateFile({
      level: "error",
      dirname: path.join(logDir, "error"),
      filename: "%DATE%.error.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "30d",
    }),

    // Daily rotating files for HTTP logs
    new DailyRotateFile({
      level: "http",
      dirname: path.join(logDir, "http"),
      filename: "%DATE%.http.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "7d",
    }),
  ],

  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, "exceptions.log"),
    }),
  ],

  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, "rejections.log"),
    }),
  ],
});

export default logger;
