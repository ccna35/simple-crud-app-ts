import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // Log the request
  const start = Date.now();
  
  // Log when request starts
  logger.info(`Request started: ${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // Log when response is sent
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logMethod = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[logMethod](`Request completed: ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      ip: req.ip
    });
  });

  next();
};