import { Request, Response } from 'express';
import * as resumeService from './resume.service';
import { CreateResumeInput } from './resume.dto';

export const createResume = async (
  req: Request<unknown, unknown, CreateResumeInput>,
  res: Response,
) => {
  const userId = req.user!.id;
  const result = await resumeService.uploadResumeRecord(userId, req.body);
  res.status(201).json({ status: 'success', data: result });
};

export const getResumes = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const rawPage = parseInt(req.query.page as string, 10);
  const rawLimit = parseInt(req.query.limit as string, 10);
  const page = !isNaN(rawPage) && rawPage > 0 ? rawPage : 1;
  const limit = !isNaN(rawLimit) && rawLimit > 0 && rawLimit <= 50 ? rawLimit : 10;
  const result = await resumeService.getUserResumes(userId, page, limit);
  res.status(200).json({
    status: 'success',
    data: result.data,
    meta: result.meta,
  });
};

export const getResume = async (req: Request<{ id: string }>, res: Response) => {
  const userId = req.user!.id;
  const resumeId = req.params.id;
  const result = await resumeService.getResumeById(userId, resumeId);
  res.status(200).json({ status: 'success', data: result });
};

export const getMatches = async (req: Request<{ id: string }>, res: Response) => {
  const userId = req.user!.id;
  const resumeId = req.params.id;
  const result = await resumeService.getResumeMatches(userId, resumeId);
  res.status(200).json({ status: 'success', data: result });
};
