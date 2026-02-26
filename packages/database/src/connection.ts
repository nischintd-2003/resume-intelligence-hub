import { Sequelize } from 'sequelize-typescript';
import { config } from '@resume-hub/config';
import { logger } from '@resume-hub/logger';
import { ParsedResume } from './models/ParsedResume';
import { JobRole } from './models/JobRole';
import { User } from './models/User';

export const sequelize = new Sequelize({
  database: config.database.database,
  username: config.database.user,
  password: config.database.password,
  host: config.database.host,
  port: config.database.port,
  dialect: 'postgres',
  models: [User, ParsedResume, JobRole],
  logging: (msg) => logger.debug(msg),
  pool: {
    max: config.database.poolMax,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info('PostgreSQL connected successfully');
    await sequelize.sync({ alter: true });
  } catch (error) {
    logger.error('Unable to connect to PostgreSQL:', error);
    throw error;
  }
};
