import { config } from '@resume-hub/config';

export const AUTH = {
  SALT_ROUNDS: 12,
};

export const PORT = config.server.apiPort;

export const RATE_LIMIT_CONSTANTS = {
  TOKEN_BUCKET_SCRIPT: `
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
`,
};
