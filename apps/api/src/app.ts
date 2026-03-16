import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import YAML from 'yamljs';
import appRoutes from './routes/index';
import { errorHandler } from './middlewares/errorHandler';
import { corsConfig } from './config/cors';

const app: Application = express();

app.use(helmet());
app.use(cors(corsConfig));
app.use(express.json({ limit: '100kb' }));

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
