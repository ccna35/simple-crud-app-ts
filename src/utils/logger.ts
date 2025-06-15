import { createLogger, format, transports } from "winston";

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

// Determine environment
const level = process.env.NODE_ENV === "development" ? "debug" : "warn";

// Create format
const logFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  format.colorize({ all: true }),
  format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
);

// Create the logger
const logger = createLogger({
  level,
  levels,
  format: logFormat,
  transports: [
    new transports.Console(),
    new transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
    new transports.File({ filename: "logs/all.log" }),
  ],
});

// Add colors to Winston
format.colorize().addColors(colors);

export default logger;
