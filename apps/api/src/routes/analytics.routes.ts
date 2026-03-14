import { Router } from 'express';
import { analyticsController } from '../modules/analytics/analytics.controller';
import { requireAuth } from '../middlewares/requireAuth';
import { apiLimiter } from '../middlewares/rateLimiter';

const router: Router = Router();

router.use(requireAuth);
router.use(apiLimiter);
router.get('/dashboard', analyticsController.getDashboard.bind(analyticsController));

export default router;
