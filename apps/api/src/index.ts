import app from './app';
import { initDatabase } from '@resume-hub/database';
import { logger } from '@resume-hub/logger';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await initDatabase();

    app.listen(PORT, () => {
      logger.info(`API Gateway listening on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
