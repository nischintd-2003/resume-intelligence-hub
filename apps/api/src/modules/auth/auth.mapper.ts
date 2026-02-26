import { User } from '@resume-hub/database';
import { AuthResponseDTO } from './auth.dto';

export const toAuthResponse = (user: User, token: string): AuthResponseDTO => {
  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
    token,
  };
};
