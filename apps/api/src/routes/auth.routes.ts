import { Router } from 'express';
import { authController } from '../modules/auth/auth.controller';
import { validate } from '../middlewares/validateRequest';
import { RegisterSchema, LoginSchema } from '../modules/auth/auth.dto';
import { authLimiter } from '../middlewares/rateLimiter';

const router: Router = Router();

router.post(
  '/register',
  authLimiter,
  validate(RegisterSchema),
  authController.register.bind(authController),
);
router.post(
  '/login',
  authLimiter,
  validate(LoginSchema),
  authController.login.bind(authController),
);

export default router;
