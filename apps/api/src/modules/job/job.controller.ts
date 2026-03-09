import { Request, Response } from 'express';
import * as jobService from './job.service';
import { CreateJobInput, UpdateJobInput } from './job.dto';

export const createJob = async (req: Request<unknown, unknown, CreateJobInput>, res: Response) => {
  const userId = req.user!.id;
  const result = await jobService.createJobRole(userId, req.body);
  res.status(201).json({ status: 'success', data: result });
};

export const getJobs = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await jobService.getUserJobs(userId);
  res.status(200).json({ status: 'success', data: result });
};

export const getJob = async (req: Request<{ id: string }>, res: Response) => {
  const userId = req.user!.id;
  const jobId = req.params.id;
  const result = await jobService.getJobById(userId, jobId);
  res.status(200).json({ status: 'success', data: result });
};

export const updateJob = async (
  req: Request<{ id: string }, unknown, UpdateJobInput>,
  res: Response,
) => {
  const userId = req.user!.id;
  const jobId = req.params.id;

  const result = await jobService.updateJobRole(userId, jobId, req.body);

  res.status(200).json({ status: 'success', data: result });
};

export const deleteJob = async (req: Request<{ id: string }>, res: Response) => {
  const userId = req.user!.id;
  const jobId = req.params.id;

  await jobService.deleteJobRole(userId, jobId);
  res.status(204).send();
};
