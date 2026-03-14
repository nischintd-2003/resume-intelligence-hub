import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { AuthRepository, authRepository } from './auth.repository';
import { AppError } from '../../utils/AppError';
import { RegisterInput, LoginInput, AuthResponseDTO } from './auth.dto';
import { toAuthResponse } from './auth.mapper';
import { config } from '@resume-hub/config';
import { AUTH } from '../../config/constants';

const expiresIn = config.jwt.expiresIn as SignOptions['expiresIn'];

export class AuthService {
  constructor(private readonly repository: AuthRepository) {}

  async registerUser(input: RegisterInput): Promise<AuthResponseDTO> {
    const [existingEmail, existingUsername] = await Promise.all([
      this.repository.findUserByEmail(input.email),
      this.repository.findUserByUsername(input.username),
    ]);

    if (existingEmail) throw new AppError('Email is already registered', 409);
    if (existingUsername) throw new AppError('Username is already taken', 409);

    const passwordHash = await bcrypt.hash(input.password, AUTH.SALT_ROUNDS);
    const user = await this.repository.createUser(input.username, input.email, passwordHash);

    const token = jwt.sign({ id: user.id }, config.jwt.secret, { expiresIn });
    return toAuthResponse(user, token);
  }

  async loginUser(input: LoginInput): Promise<AuthResponseDTO> {
    const user = await this.repository.findUserByEmail(input.email);
    if (!user) throw new AppError('Invalid email or password', 401);

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) throw new AppError('Invalid email or password', 401);

    const token = jwt.sign({ id: user.id }, config.jwt.secret, { expiresIn });
    return toAuthResponse(user, token);
  }
}

export const authService = new AuthService(authRepository);
