import { Router } from 'express';
import * as analyticsController from '../modules/analytics/analytics.controller';
import { requireAuth } from '../middlewares/requireAuth';

const router: Router = Router();

router.use(requireAuth);
router.get('/dashboard', analyticsController.getDashboard);

export default router;
