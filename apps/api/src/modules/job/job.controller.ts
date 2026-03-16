import { Request, Response } from 'express';
import { JobService, jobService } from './job.service';
import { CreateJobInput, UpdateJobInput } from './job.dto';

export class JobController {
  constructor(private readonly service: JobService) {}

  async createJob(req: Request<unknown, unknown, CreateJobInput>, res: Response): Promise<void> {
    const userId = req.user!.id;
    const result = await this.service.createJobRole(userId, req.body);
    res.status(201).json({ status: 'success', data: result });
  }

  async getJobs(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const result = await this.service.getUserJobs(userId);
    res.status(200).json({ status: 'success', data: result });
  }

  async getJob(req: Request<{ id: string }>, res: Response): Promise<void> {
    const userId = req.user!.id;
    const result = await this.service.getJobById(userId, req.params.id);
    res.status(200).json({ status: 'success', data: result });
  }

  async updateJob(
    req: Request<{ id: string }, unknown, UpdateJobInput>,
    res: Response,
  ): Promise<void> {
    const userId = req.user!.id;
    const result = await this.service.updateJobRole(userId, req.params.id, req.body);
    res.status(200).json({ status: 'success', data: result });
  }

  async deleteJob(req: Request<{ id: string }>, res: Response): Promise<void> {
    const userId = req.user!.id;
    await this.service.deleteJobRole(userId, req.params.id);
    res.status(204).send();
  }
}

export const jobController = new JobController(jobService);
