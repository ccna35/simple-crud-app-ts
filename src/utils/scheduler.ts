import { CronJob } from 'cron';
import { VerificationService } from '../services/verification.service';
import logger from './logger';

// Run daily at midnight
const tokenCleanupJob = new CronJob('0 0 * * *', async () => {
  try {
    logger.info('Running expired token cleanup job');
    const verificationService = new VerificationService();
    const deletedCount = await verificationService.cleanupExpiredTokens();
    logger.info(`Token cleanup complete. Deleted ${deletedCount} expired tokens.`);
  } catch (error) {
    logger.error('Error during token cleanup job', { error });
  }
});

export const startScheduledJobs = () => {
  tokenCleanupJob.start();
  logger.info('Scheduled jobs started');
};