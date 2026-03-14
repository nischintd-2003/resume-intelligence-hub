import { Router } from 'express';
import { analyticsController } from '../modules/analytics/analytics.controller';
import { requireAuth } from '../middlewares/requireAuth';

const router: Router = Router();

router.use(requireAuth);
router.get('/dashboard', analyticsController.getDashboard.bind(analyticsController));

export default router;
