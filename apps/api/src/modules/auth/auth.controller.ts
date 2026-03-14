import { Request, Response } from 'express';
import { AuthService, authService } from './auth.service';
import { LoginInput, RegisterInput } from './auth.dto';

export class AuthController {
  constructor(private readonly service: AuthService) {}

  async register(req: Request<unknown, unknown, RegisterInput>, res: Response): Promise<void> {
    const result = await this.service.registerUser(req.body);
    res.status(201).json({ status: 'success', data: result });
  }

  async login(req: Request<unknown, unknown, LoginInput>, res: Response): Promise<void> {
    const result = await this.service.loginUser(req.body);
    res.status(200).json({ status: 'success', data: result });
  }
}

export const authController = new AuthController(authService);
