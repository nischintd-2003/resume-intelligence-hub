import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes';
import { errorHandler } from './middlewares/errorHandler';
import { requireAuth } from './middlewares/requireAuth';

const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);

app.get('/api/protected', requireAuth, (req, res) => {
  res.status(200).json({ status: 'success', user: req.user });
});

app.use(errorHandler);

export default app;
