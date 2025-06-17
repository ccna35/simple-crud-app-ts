import winston from "winston";
import path from "path";

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.metadata({
    fillExcept: ["message", "level", "timestamp", "label"]
  }),
  winston.format.printf((info) => {
    return `${info.timestamp} [${info.level}]: ${info.message}`;
  })
);

// Define which transports the logger must use
const loggerTransports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(winston.format.colorize(), logFormat),
    level: process.env.NODE_ENV === "production" ? "info" : "debug"
  }),

  // File transport for all logs
  new winston.transports.File({
    filename: path.join("logs", "app.log"),
    level: "info",
    format: logFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }),

  // File transport for error logs
  new winston.transports.File({
    filename: path.join("logs", "error.log"),
    level: "error",
    format: logFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5
  })
];

// Create the logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: logFormat,
  transports: loggerTransports,
  // Do not exit on error
  exitOnError: false
});

export default logger;
