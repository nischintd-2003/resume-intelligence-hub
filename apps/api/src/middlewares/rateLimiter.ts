import { Request, Response, NextFunction } from 'express';
import { redisConnection } from '@resume-hub/queue-lib';
import { logger } from '@resume-hub/logger';
import { RateLimitConfig } from '../types/rateLimiter.types';
import { RATE_LIMIT_CONSTANTS } from '../config/constants';

export const rateLimiter = (options: RateLimitConfig) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (redisConnection.status !== 'ready') {
      logger.warn('Redis is not ready. Bypassing rate limiter.');
      return next();
    }

    const identifier = req.user?.id
      ? `user:${req.user.id}`
      : `ip:${req.ip || req.socket.remoteAddress || 'unknown'}`;

    const key = `ratelimit:${identifier}`;
    const now = Math.floor(Date.now() / 1000);

    try {
      const result = (await redisConnection.eval(
        RATE_LIMIT_CONSTANTS.TOKEN_BUCKET_SCRIPT,
        1,
        key,
        options.capacity.toString(),
        options.refillRate.toString(),
        now.toString(),
        options.blockDuration.toString(),
      )) as [number, number];

      const allowed = result[0];
      const remainingTokens = result[1];

      res.setHeader('X-RateLimit-Limit', options.capacity);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, remainingTokens));

      if (allowed === 1) {
        return next();
      } else {
        res.setHeader('Retry-After', options.blockDuration);
        return res.status(429).json({
          success: false,
          message: 'Too many requests. Please try again later.',
        });
      }
    } catch (error) {
      logger.error(
        `Rate limiter execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return next();
    }
  };
};

export const authLimiter = rateLimiter({
  capacity: 10,
  refillRate: 0.1,
  blockDuration: 600,
});

export const apiLimiter = rateLimiter({
  capacity: 100,
  refillRate: 2,
  blockDuration: 300,
});
