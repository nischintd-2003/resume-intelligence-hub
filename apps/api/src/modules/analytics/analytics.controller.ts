import { Request, Response } from 'express';
import { AnalyticsService, analyticsService } from './analytics.service';

export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  async getDashboard(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const result = await this.service.getUserDashboard(userId);
    res.status(200).json({ status: 'success', data: result });
  }
}

export const analyticsController = new AnalyticsController(analyticsService);
