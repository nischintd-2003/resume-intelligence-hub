import { CorsOptions } from 'cors';
import { AppError } from '../utils/AppError';

const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost'];

export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new AppError('Access blocked by CORS policy', 403), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
