import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import * as authRepo from './auth.repository';
import { AppError } from '../../utils/AppError';
import { RegisterInput, LoginInput, AuthResponseDTO } from './auth.dto';
import { toAuthResponse } from './auth.mapper';
import { config } from '@resume-hub/config';

const expiresIn = config.jwt.expiresIn as SignOptions['expiresIn'];

export const registerUser = async (input: RegisterInput): Promise<AuthResponseDTO> => {
  const [existingEmail, existingUsername] = await Promise.all([
    authRepo.findUserByEmail(input.email),
    authRepo.findUserByUsername(input.username),
  ]);

  if (existingEmail) throw new AppError('Email is already registered', 409);
  if (existingUsername) throw new AppError('Username is already taken', 409);

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await authRepo.createUser(input.username, input.email, passwordHash);

  const token = jwt.sign({ id: user.id }, config.jwt.secret, { expiresIn });

  return toAuthResponse(user, token);
};

export const loginUser = async (input: LoginInput): Promise<AuthResponseDTO> => {
  const user = await authRepo.findUserByEmail(input.email);
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isMatch = await bcrypt.compare(input.password, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = jwt.sign({ id: user.id }, config.jwt.secret, { expiresIn });

  return toAuthResponse(user, token);
};
