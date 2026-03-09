import { Request, Response } from 'express';
import * as resumeService from './resume.service';
import { CreateResumeInput, GetResumesQuery } from './resume.dto';

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
  const { page, limit } = req.query as unknown as GetResumesQuery;
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
