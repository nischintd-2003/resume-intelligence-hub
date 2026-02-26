import { z } from 'zod';

export const RegisterSchema = z.object({
  body: z.object({
    username: z.string().min(6, 'Username must be at least 6 characters'),
    email: z.email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),
});

export const LoginSchema = z.object({
  body: z.object({
    email: z.email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export type RegisterInput = z.infer<typeof RegisterSchema>['body'];
export type LoginInput = z.infer<typeof LoginSchema>['body'];

export type AuthResponseDTO = {
  user: {
    id: string;
    username: string;
    email: string;
  };
  token: string;
};
