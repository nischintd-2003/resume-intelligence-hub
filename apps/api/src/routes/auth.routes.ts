import { Router } from 'express';
import { authController } from '../modules/auth/auth.controller';
import { validate } from '../middlewares/validateRequest';
import { RegisterSchema, LoginSchema } from '../modules/auth/auth.dto';

const router: Router = Router();

router.post('/register', validate(RegisterSchema), authController.register.bind(authController));
router.post('/login', validate(LoginSchema), authController.login.bind(authController));

export default router;
