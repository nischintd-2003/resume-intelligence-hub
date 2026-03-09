import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { Button, FormField, Input, PasswordInput } from '../../components/ui';
import { useRegister } from '../../hooks/useAuth';
import { registerSchema, type RegisterFormValues } from '../../validations/auth.schemas';
import { AUTH_COPY } from '../../constants/auth.constants';
import { getApiErrorMessage } from '../../utils/errors';

// Types

type FieldErrors = Partial<Record<keyof RegisterFormValues, string>>;

// Initial State

const INITIAL_VALUES: RegisterFormValues = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
};

//  Component

export default function RegisterPage() {
  const navigate = useNavigate();
  const { mutate: registerMutate, isPending } = useRegister();

  const [values, setValues] = useState<RegisterFormValues>(INITIAL_VALUES);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);

  // Set page title
  useEffect(() => {
    document.title = AUTH_COPY.REGISTER.PAGE_TITLE;
  }, []);

  //  Handlers

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    setApiError(null);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const result = registerSchema.safeParse(values);
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      setFieldErrors({
        username: flat.username?.[0],
        email: flat.email?.[0],
        password: flat.password?.[0],
        confirmPassword: flat.confirmPassword?.[0],
      });
      return;
    }

    const { ...payload } = result.data;

    registerMutate(payload, {
      onSuccess: () => navigate('/dashboard', { replace: true }),
      onError: (err) => setApiError(getApiErrorMessage(err)),
    });
  }

  //  Render

  return (
    <div className="min-h-screen flex">
      {/*  Left Brand Panel  */}
      <BrandPanel />

      {/*  Right Form Panel  */}
      <main className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {AUTH_COPY.REGISTER.HEADING}
            </h1>
            <p className="mt-1 text-sm text-slate-500">{AUTH_COPY.REGISTER.SUBHEADING}</p>
          </div>

          {/* API Error Banner */}
          {apiError && <ErrorBanner message={apiError} />}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <FormField
              label={AUTH_COPY.FIELDS.USERNAME}
              htmlFor="username"
              error={fieldErrors.username}
            >
              <Input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder={AUTH_COPY.FIELDS.USERNAME_PLACEHOLDER}
                value={values.username}
                onChange={handleChange}
                hasError={!!fieldErrors.username}
                disabled={isPending}
              />
            </FormField>

            <FormField label={AUTH_COPY.FIELDS.EMAIL} htmlFor="email" error={fieldErrors.email}>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder={AUTH_COPY.FIELDS.EMAIL_PLACEHOLDER}
                value={values.email}
                onChange={handleChange}
                hasError={!!fieldErrors.email}
                disabled={isPending}
              />
            </FormField>

            <FormField
              label={AUTH_COPY.FIELDS.PASSWORD}
              htmlFor="password"
              error={fieldErrors.password}
            >
              <PasswordInput
                id="password"
                name="password"
                autoComplete="new-password"
                placeholder={AUTH_COPY.FIELDS.PASSWORD_PLACEHOLDER}
                value={values.password}
                onChange={handleChange}
                hasError={!!fieldErrors.password}
                disabled={isPending}
              />
            </FormField>

            <FormField
              label={AUTH_COPY.FIELDS.CONFIRM_PASSWORD}
              htmlFor="confirmPassword"
              error={fieldErrors.confirmPassword}
            >
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                autoComplete="new-password"
                placeholder={AUTH_COPY.FIELDS.CONFIRM_PASSWORD_PLACEHOLDER}
                value={values.confirmPassword}
                onChange={handleChange}
                hasError={!!fieldErrors.confirmPassword}
                disabled={isPending}
              />
            </FormField>

            <Button type="submit" fullWidth isLoading={isPending} size="lg" className="mt-2">
              {isPending ? AUTH_COPY.REGISTER.SUBMITTING : AUTH_COPY.REGISTER.SUBMIT}
            </Button>
          </form>

          {/* Footer Link */}
          <p className="mt-6 text-center text-sm text-slate-500">
            {AUTH_COPY.REGISTER.HAS_ACCOUNT}{' '}
            <Link
              to="/login"
              className="font-medium text-slate-800 hover:text-slate-600 underline underline-offset-2 transition-colors"
            >
              {AUTH_COPY.REGISTER.LOGIN_LINK}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

//  Sub-components

function BrandPanel() {
  return (
    <aside
      className="hidden lg:flex lg:w-[45%] xl:w-[42%] flex-col justify-between p-12 bg-slate-900 text-white relative overflow-hidden"
      aria-hidden="true"
    >
      {/* Decorative grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Decorative circle accents */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/5 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight">{AUTH_COPY.APP_NAME}</span>
      </div>

      {/* Tagline + Features */}
      <div className="relative z-10 space-y-8">
        <div>
          <p className="text-3xl font-bold leading-tight text-white">
            Start parsing
            <br />
            <span className="text-slate-400">smarter today.</span>
          </p>
          <p className="mt-3 text-slate-400 text-sm leading-relaxed">{AUTH_COPY.APP_TAGLINE}</p>
        </div>

        <ul className="space-y-3">
          {AUTH_COPY.FEATURES.map(({ icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-sm text-slate-300">
              <span className="text-base">{icon}</span>
              {text}
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom attribution */}
      <p className="relative z-10 text-xs text-slate-600">
        © {new Date().getFullYear()} Resume Intelligence Hub
      </p>
    </aside>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      <svg
        className="mt-0.5 h-4 w-4 shrink-0"
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm.75 3.75a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 1.5 0v-3.5zm-.75 6.5a.875.875 0 1 0 0-1.75.875.875 0 0 0 0 1.75z" />
      </svg>
      {message}
    </div>
  );
}
