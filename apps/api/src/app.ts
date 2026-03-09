import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import YAML from 'yamljs';
import appRoutes from './routes/index';
import { errorHandler } from './middlewares/errorHandler';
import { rateLimiter } from './middlewares/rateLimiter';
import { corsConfig } from './config/cors';
import { RATE_LIMIT } from './config/constants';

const app: Application = express();

app.use(helmet());
app.use(cors(corsConfig));
app.use(express.json());
app.use(
  '/api',
  rateLimiter({
    capacity: RATE_LIMIT.CAPACITY,
    refillRate: RATE_LIMIT.REFILL_RATE,
    blockDuration: RATE_LIMIT.BLOCK_DURATION,
  }),
);

const swaggerPath = path.join(process.cwd(), 'src/docs/swagger.yaml');
const swaggerDocument = YAML.load(swaggerPath);

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/v1', appRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(errorHandler);

export default app;
