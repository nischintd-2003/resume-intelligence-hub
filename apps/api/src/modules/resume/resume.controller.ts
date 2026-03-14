import { Request, Response } from 'express';
import { ResumeService, resumeService } from './resume.service';
import { CreateResumeInput, GetResumesQuery } from './resume.dto';

export class ResumeController {
  constructor(private readonly service: ResumeService) {}

  async createResume(
    req: Request<unknown, unknown, CreateResumeInput>,
    res: Response,
  ): Promise<void> {
    const userId = req.user!.id;
    const result = await this.service.uploadResumeRecord(userId, req.body);
    res.status(201).json({ status: 'success', data: result });
  }

  async getResumes(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { page, limit } = req.query as unknown as GetResumesQuery;
    const result = await this.service.getUserResumes(userId, page, limit);
    res.status(200).json({
      status: 'success',
      data: result.data,
      meta: result.meta,
    });
  }

  async getResume(req: Request<{ id: string }>, res: Response): Promise<void> {
    const userId = req.user!.id;
    const result = await this.service.getResumeById(userId, req.params.id);
    res.status(200).json({ status: 'success', data: result });
  }

  async getMatches(req: Request<{ id: string }>, res: Response): Promise<void> {
    const userId = req.user!.id;
    const result = await this.service.getResumeMatches(userId, req.params.id);
    res.status(200).json({ status: 'success', data: result });
  }
}

export const resumeController = new ResumeController(resumeService);
