import app from './app';
import { initDatabase } from '@resume-hub/database';
import { logger } from '@resume-hub/logger';
import { PORT } from './config/constants';

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
