import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import YAML from 'yamljs';
import authRoutes from './routes/auth.routes';
import { errorHandler } from './middlewares/errorHandler';
import { requireAuth } from './middlewares/requireAuth';
import { rateLimiter } from './middlewares/rateLimiter';
import resumeRoutes from './routes/resume.routes';
import jobRoutes from './routes/job.routes';
import analyticsRoutes from './routes/analytics.routes';

const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(
  '/api',
  rateLimiter({
    capacity: 100,
    refillRate: 2,
    blockDuration: 300,
  }),
);

const swaggerPath = path.join(process.cwd(), 'src/docs/swagger.yaml');
const swaggerDocument = YAML.load(swaggerPath);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/resumes', resumeRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/api/protected', requireAuth, (req, res) => {
  res.status(200).json({ status: 'success', user: req.user });
});

app.use(errorHandler);

export default app;
