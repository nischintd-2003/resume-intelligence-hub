import { Request, Response, NextFunction } from 'express';
import { createClient } from 'redis';
import { logger } from '@resume-hub/logger';
import { config } from '@resume-hub/config';

const redisClient = createClient({
  url: `redis://${config.redis.host}:${config.redis.port}`,
});

redisClient.on('error', (err) => logger.error('Redis Client Error', err));

(async () => {
  try {
    await redisClient.connect();
    logger.info('Rate Limiter connected to Redis');
  } catch (error) {
    logger.error('Failed to connect Rate Limiter to Redis', error);
  }
})();

const tokenBucketScript = `
  local key = KEYS[1]
  local capacity = tonumber(ARGV[1])
  local refill_rate = tonumber(ARGV[2])
  local now = tonumber(ARGV[3])
  local block_duration = tonumber(ARGV[4])

  local bucket = redis.call('HMGET', key, 'tokens', 'last_refill', 'block_until')
  local tokens = tonumber(bucket[1])
  local last_refill = tonumber(bucket[2])
  local block_until = tonumber(bucket[3]) or 0

  if now < block_until then
    return { 0, block_until - now }
  end

  if not tokens then
    tokens = capacity
    last_refill = now
  else
    local elapsed = math.max(0, now - last_refill)
    local refill = math.floor(elapsed * refill_rate)
    
    if refill > 0 then
      tokens = math.min(capacity, tokens + refill)
      last_refill = now
    end
  end

  if tokens >= 1 then
    tokens = tokens - 1
    redis.call('HMSET', key, 'tokens', tokens, 'last_refill', last_refill, 'block_until', 0)
    redis.call('EXPIRE', key, math.ceil(capacity / refill_rate))
    return { 1, tokens }
  else
    block_until = now + block_duration
    redis.call('HMSET', key, 'tokens', tokens, 'last_refill', last_refill, 'block_until', block_until)
    redis.call('EXPIRE', key, block_duration)
    return { 0, block_duration }
  end
`;

interface RateLimitConfig {
  capacity: number;
  refillRate: number;
  blockDuration: number;
}

export const rateLimiter = (options: RateLimitConfig) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!redisClient.isReady) {
      logger.warn('Redis is not ready. Bypassing rate limiter.');
      return next();
    }

    const identifier = req.user?.id
      ? `user:${req.user.id}`
      : `ip:${req.ip || req.socket.remoteAddress}`;
    const key = `ratelimit:${identifier}`;
    const now = Math.floor(Date.now() / 1000);

    try {
      const [allowed, metric] = (await redisClient.eval(tokenBucketScript, {
        keys: [key],
        arguments: [
          options.capacity.toString(),
          options.refillRate.toString(),
          now.toString(),
          options.blockDuration.toString(),
        ],
      })) as [number, number];

      if (allowed === 1) {
        res.setHeader('X-RateLimit-Remaining', metric);
        return next();
      } else {
        res.setHeader('Retry-After', metric);
        res.status(429).json({
          status: 'error',
          message: `Rate limit exceeded. Try again in ${metric} seconds.`,
        });
      }
    } catch (error) {
      logger.error('Rate Limiter execution failed', error);
      return next();
    }
  };
};
