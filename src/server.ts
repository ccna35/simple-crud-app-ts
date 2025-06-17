import app from "./app";
import dotenv from "dotenv";
import logger from "./utils/logger";
import { startScheduledJobs } from "./utils/scheduler";

dotenv.config();

const port = process.env.PORT || 3000;

// Start scheduled jobs when the server starts
app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
  startScheduledJobs();
  app.emit("ready");
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception", { error: error.stack });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection", { reason, promise });
  process.exit(1);
});
