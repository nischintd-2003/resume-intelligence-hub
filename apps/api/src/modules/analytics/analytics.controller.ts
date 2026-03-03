import { Request, Response } from 'express';
import * as analyticsService from './analytics.service';

export const getDashboard = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await analyticsService.getUserDashboard(userId);
  res.status(200).json({ status: 'success', data: result });
};
