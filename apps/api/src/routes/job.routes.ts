import { Router } from 'express';
import { jobController } from '../modules/job/job.controller';
import { validate } from '../middlewares/validateRequest';
import { requireAuth } from '../middlewares/requireAuth';
import { CreateJobSchema, UpdateJobSchema } from '../modules/job/job.dto';

const router: Router = Router();

router.use(requireAuth);

router.post('/', validate(CreateJobSchema), jobController.createJob.bind(jobController));
router.get('/', jobController.getJobs.bind(jobController));
router.get('/:id', jobController.getJob.bind(jobController));
router.patch('/:id', validate(UpdateJobSchema), jobController.updateJob.bind(jobController));
router.delete('/:id', jobController.deleteJob.bind(jobController));

export default router;
