import { Router } from 'express';
import { register, login } from '../modules/auth/auth.controller';
import { validate } from '../middlewares/validateRequest';
import { RegisterSchema, LoginSchema } from '../modules/auth/auth.dto';

const router: Router = Router();

router.post('/register', validate(RegisterSchema), register);
router.post('/login', validate(LoginSchema), login);

export default router;
