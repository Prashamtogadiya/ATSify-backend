// utils/logger.ts
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import fs from "fs";

// Log directory
const logDir = "logs";

// Ensure folders exist
const folders = ["info", "error", "http"];
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

folders.forEach((folder) => {
  const dir = path.join(logDir, folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// -------- Custom Levels & Colors --------
const customLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

winston.addColors({
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
});

// -------- Log Format --------
const logFormat = winston.format.printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level.toUpperCase()}] : ${stack || message}`;
});

// -------- Logger Instance --------
const logger = winston.createLogger({
  levels: customLevels,

  level: process.env.NODE_ENV === "production" ? "info" : "debug",

  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    logFormat
  ),

  transports: [
    // ---------- Console Logging ----------
    new winston.transports.Console({
      level:
        process.env.NODE_ENV === "production"
          ? "info"
          : "debug",
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, stack }) => {
          return `${timestamp} [${level}]: ${stack || message}`;
        })
      ),
    }),

    // ---------- Daily Info Logs ----------
    new DailyRotateFile({
      level: "info",
      dirname: path.join(logDir, "info"),
      filename: "%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    }),

    // ---------- Daily Error Logs ----------
    new DailyRotateFile({
      level: "error",
      dirname: path.join(logDir, "error"),
      filename: "%DATE%.error.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "30d",
    }),

    // ---------- Daily HTTP Logs ----------
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

  // ---------- Crash Handlers ----------
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, "exceptions.log"),
    }),
  ],

  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, "rejections.log"),
    }),
  ],
});

export default logger;
