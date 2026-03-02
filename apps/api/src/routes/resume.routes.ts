import { Router } from 'express';
import * as resumeController from '../modules/resume/resume.controller';
import { validate } from '../middlewares/validateRequest';
import { requireAuth } from '../middlewares/requireAuth';
import { CreateResumeSchema } from '../modules/resume/resume.dto';

const router: Router = Router();

router.use(requireAuth);

router.post('/', validate(CreateResumeSchema), resumeController.createResume);
router.get('/', resumeController.getResumes);
router.get('/:id', resumeController.getResume);

export default router;
