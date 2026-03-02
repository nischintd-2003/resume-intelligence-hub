import { User } from '@resume-hub/database';

export const findUserByEmail = async (email: string) => {
  return await User.findOne({ where: { email } });
};

export const findUserByUsername = async (username: string) => {
  return await User.findOne({ where: { username } });
};

export const createUser = async (username: string, email: string, passwordHash: string) => {
  return await User.create({
    username,
    email,
    passwordHash,
  });
};
