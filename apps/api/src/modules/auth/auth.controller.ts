import { Request, Response } from 'express';
import * as authService from './auth.service';
import { LoginInput, RegisterInput } from './auth.dto';

export const register = async (req: Request<unknown, unknown, RegisterInput>, res: Response) => {
  const result = await authService.registerUser(req.body);
  res.status(201).json({ status: 'success', data: result });
};

export const login = async (req: Request<unknown, unknown, LoginInput>, res: Response) => {
  const result = await authService.loginUser(req.body);
  res.status(200).json({ status: 'success', data: result });
};
