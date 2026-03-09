import { Router } from 'express';
import * as resumeController from '../modules/resume/resume.controller';
import { validate } from '../middlewares/validateRequest';
import { requireAuth } from '../middlewares/requireAuth';
import { CreateResumeSchema, GetResumesQuerySchema } from '../modules/resume/resume.dto';

const router: Router = Router();

router.use(requireAuth);

router.post('/', validate(CreateResumeSchema), resumeController.createResume);
router.get('/', validate(GetResumesQuerySchema), resumeController.getResumes);
router.get('/:id', resumeController.getResume);
router.get('/:id/matches', resumeController.getMatches);

export default router;
