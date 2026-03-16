import type { LoginFormValues, RegisterFormValues } from '@/validations/auth.schemas';

export const AUTH_STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
} as const;

export const AUTH_COPY = {
  APP_NAME: 'Resume Intelligence Hub',
  APP_TAGLINE: 'Parse, match, and analyse resumes at scale.',

  FEATURES: [
    { icon: '🔍', text: 'AI-powered resume parsing' },
    { icon: '🎯', text: 'Smart job-role matching' },
    { icon: '📊', text: 'Actionable analytics dashboard' },
  ],

  LOGIN: {
    PAGE_TITLE: 'Sign in — Resume Intelligence Hub',
    HEADING: 'Welcome back',
    SUBHEADING: 'Sign in to your account to continue',
    SUBMIT: 'Sign In',
    SUBMITTING: 'Signing in…',
    NO_ACCOUNT: "Don't have an account?",
    REGISTER_LINK: 'Create one',
  },

  REGISTER: {
    PAGE_TITLE: 'Create account — Resume Intelligence Hub',
    HEADING: 'Create an account',
    SUBHEADING: 'Join Resume Intelligence Hub to get started',
    SUBMIT: 'Create Account',
    SUBMITTING: 'Creating account…',
    HAS_ACCOUNT: 'Already have an account?',
    LOGIN_LINK: 'Sign in',
  },

  FIELDS: {
    USERNAME: 'Username',
    USERNAME_PLACEHOLDER: 'e.g. jdoe',
    EMAIL: 'Email address',
    EMAIL_PLACEHOLDER: 'you@example.com',
    PASSWORD: 'Password',
    PASSWORD_PLACEHOLDER: '••••••••',
    CONFIRM_PASSWORD: 'Confirm password',
    CONFIRM_PASSWORD_PLACEHOLDER: '••••••••',
    SHOW_PASSWORD: 'Show password',
    HIDE_PASSWORD: 'Hide password',
  },

  ERRORS: {
    GENERIC: 'Something went wrong. Please try again.',
  },
} as const;

export const LOGIN_INITIAL_VALUES: LoginFormValues = { email: '', password: '' };

export const REGISTER_INITIAL_VALUES: RegisterFormValues = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
};
