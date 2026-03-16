import { Router } from 'express';
import { resumeController } from '../modules/resume/resume.controller';
import { validate } from '../middlewares/validateRequest';
import { requireAuth } from '../middlewares/requireAuth';
import { CreateResumeSchema, GetResumesQuerySchema } from '../modules/resume/resume.dto';
import { apiLimiter } from '../middlewares/rateLimiter';

const router: Router = Router();

router.use(requireAuth);
router.use(apiLimiter);

router.post(
  '/',
  validate(CreateResumeSchema),
  resumeController.createResume.bind(resumeController),
);
router.get(
  '/',
  validate(GetResumesQuerySchema),
  resumeController.getResumes.bind(resumeController),
);
router.get('/:id', resumeController.getResume.bind(resumeController));
router.get('/:id/matches', resumeController.getMatches.bind(resumeController));
router.get('/:id/preview', requireAuth, resumeController.getPreviewUrl.bind(resumeController));

export default router;
