import { config } from '@resume-hub/config';

export const AUTH = {
  SALT_ROUNDS: 12,
};

export const RATE_LIMIT = {
  CAPACITY: 100,
  REFILL_RATE: 2,
  BLOCK_DURATION: 300,
};

export const PORT = config.server.port;
