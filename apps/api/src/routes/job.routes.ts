import { Router } from 'express';
import * as jobController from '../modules/job/job.controller';
import { validate } from '../middlewares/validateRequest';
import { requireAuth } from '../middlewares/requireAuth';
import { CreateJobSchema, UpdateJobSchema } from '../modules/job/job.dto';

const router: Router = Router();

router.use(requireAuth);

router.post('/', validate(CreateJobSchema), jobController.createJob);
router.get('/', jobController.getJobs);
router.get('/:id', jobController.getJob);
router.patch('/:id', validate(UpdateJobSchema), jobController.updateJob);
router.delete('/:id', jobController.deleteJob);
export default router;
