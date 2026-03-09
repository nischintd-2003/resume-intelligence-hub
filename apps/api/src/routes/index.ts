import { Router } from 'express';
import authRoutes from './auth.routes';
import resumeRoutes from './resume.routes';
import jobRoutes from './job.routes';
import analyticsRoutes from './analytics.routes';

const apiRouter: Router = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/resumes', resumeRoutes);
apiRouter.use('/jobs', jobRoutes);
apiRouter.use('/analytics', analyticsRoutes);

export default apiRouter;
