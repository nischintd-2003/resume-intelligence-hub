import { User } from '@resume-hub/database';

export class AuthRepository {
  async findUserByEmail(email: string) {
    return User.findOne({ where: { email } });
  }

  async findUserByUsername(username: string) {
    return User.findOne({ where: { username } });
  }

  async createUser(username: string, email: string, passwordHash: string) {
    return User.create({ username, email, passwordHash });
  }
}

export const authRepository = new AuthRepository();
