import { useCallback, useRef, useState, type KeyboardEvent } from 'react';
import { AlertCircle, Briefcase, Loader2, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useJobs, useCreateJob, useDeleteJob, useToggleJob } from '../../hooks/useJobs';
import { getApiErrorMessage } from '../../utils/errors';
import type {
  JobDTO,
  CreateJobFormValues,
  CreateJobFormErrors,
  SkillTagInputProps,
} from '../../types/job.types';
import { formatDate, validateForm } from '../../utils/dashboard.utils';

export default function JobsPage() {
  const [panelOpen, setPanelOpen] = useState(false);
  const { data: jobs = [], isLoading, isError, refetch, isFetching } = useJobs();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">
            {isLoading ? 'Jobs' : `${jobs.length} job role${jobs.length === 1 ? '' : 's'}`}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Active roles are matched against every uploaded resume
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            aria-label="Refresh jobs"
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium',
              'text-slate-500 border border-slate-200 bg-white',
              'hover:bg-slate-50 hover:border-slate-300 transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            <RefreshCw
              className={cn('w-3.5 h-3.5', isFetching && 'animate-spin')}
              aria-hidden="true"
            />
            Refresh
          </button>

          <button
            onClick={() => setPanelOpen(true)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium',
              'bg-slate-800 text-white hover:bg-slate-700 transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500',
            )}
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            New job
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : jobs.length === 0 ? (
        <EmptyState onNew={() => setPanelOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {panelOpen && <CreateJobPanel onClose={() => setPanelOpen(false)} />}
    </div>
  );
}

// JobCard

function JobCard({ job }: { job: JobDTO }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { mutate: deleteJob, isPending: isDeleting } = useDeleteJob();
  const { mutate: toggleJob, isPending: isToggling } = useToggleJob();

  function handleDelete() {
    setDeleteError(null);
    deleteJob(job.id, {
      onError: (err) => setDeleteError(getApiErrorMessage(err)),
    });
  }

  function handleToggle() {
    toggleJob({ id: job.id, isActive: !job.isActive });
  }

  return (
    <div
      className={cn(
        'rounded-xl border bg-white p-4 flex flex-col gap-3 transition-colors',
        job.isActive ? 'border-slate-200' : 'border-slate-100 opacity-70',
      )}
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <div className="shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center mt-0.5">
            <Briefcase className="w-4 h-4 text-slate-400" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 leading-snug">{job.title}</p>
            <p className="text-xs text-slate-400 mt-0.5">{formatDate(job.createdAt)}</p>
          </div>
        </div>

        {/* Delete */}
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            disabled={isDeleting}
            aria-label={`Delete ${job.title}`}
            className={cn(
              'shrink-0 p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50',
              'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400',
              'disabled:opacity-40 disabled:cursor-not-allowed',
            )}
          >
            {isDeleting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            )}
          </button>
        ) : (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-2 py-0.5 rounded text-xs font-medium bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              {isDeleting ? '…' : 'Delete'}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-2 py-0.5 rounded text-xs font-medium text-slate-500 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {deleteError && <p className="text-xs text-red-500">{deleteError}</p>}

      {/* Required skills */}
      <div>
        <p className="text-xs text-slate-400 mb-1.5">Required skills</p>
        <div className="flex flex-wrap gap-1">
          {job.requiredSkills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Active toggle */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Status pill */}
          <span
            className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
              job.isActive ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400',
            )}
          >
            <span
              className={cn(
                'w-1.5 h-1.5 rounded-full',
                job.isActive ? 'bg-green-400' : 'bg-slate-300',
              )}
            />
            {job.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Toggle switch */}
        <button
          role="switch"
          aria-checked={job.isActive}
          aria-label={`${job.isActive ? 'Deactivate' : 'Activate'} ${job.title}`}
          onClick={handleToggle}
          disabled={isToggling}
          className={cn(
            'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent',
            'transition-colors duration-200 ease-in-out',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            job.isActive ? 'bg-slate-800' : 'bg-slate-200',
          )}
        >
          <span
            className={cn(
              'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow',
              'transform transition-transform duration-200 ease-in-out',
              job.isActive ? 'translate-x-4' : 'translate-x-0',
            )}
          />
        </button>
      </div>
    </div>
  );
}

// CreateJobPanel

const EMPTY_FORM: CreateJobFormValues = { title: '', requiredSkills: [] };

function CreateJobPanel({ onClose }: { onClose: () => void }) {
  const [values, setValues] = useState<CreateJobFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<CreateJobFormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const { mutate: createJob, isPending } = useCreateJob();

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValues((v) => ({ ...v, title: e.target.value }));
    if (errors.title) setErrors((e) => ({ ...e, title: undefined }));
  }

  function handleSkillsChange(skills: string[]) {
    setValues((v) => ({ ...v, requiredSkills: skills }));
    if (errors.requiredSkills) setErrors((e) => ({ ...e, requiredSkills: undefined }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError(null);
    const validationErrors = validateForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    createJob(
      { title: values.title.trim(), requiredSkills: values.requiredSkills },
      {
        onSuccess: onClose,
        onError: (err) => setApiError(getApiErrorMessage(err)),
      },
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/20" aria-hidden="true" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Create new job role"
        className="fixed right-0 top-0 bottom-0 z-40 w-full max-w-md bg-white border-l border-slate-200 shadow-xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">New job role</h2>
          <button
            onClick={onClose}
            aria-label="Close panel"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto p-6 space-y-5">
          {apiError && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-xs text-red-600">{apiError}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="job-title" className="block text-xs font-medium text-slate-700">
              Job title <span className="text-red-500">*</span>
            </label>
            <input
              id="job-title"
              type="text"
              value={values.title}
              onChange={handleTitleChange}
              placeholder="e.g. Senior Frontend Engineer"
              disabled={isPending}
              aria-invalid={!!errors.title}
              className={cn(
                'w-full rounded-lg border px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-300',
                'focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                errors.title ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white',
              )}
            />
            {errors.title && (
              <p className="text-xs text-red-500" role="alert">
                {errors.title}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Required skills <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-slate-400">
              Type a skill and press{' '}
              <kbd className="px-1 py-0.5 rounded border border-slate-200 text-xs font-mono bg-slate-50">
                Enter
              </kbd>{' '}
              or{' '}
              <kbd className="px-1 py-0.5 rounded border border-slate-200 text-xs font-mono bg-slate-50">
                ,
              </kbd>{' '}
              to add
            </p>
            <SkillTagInput
              skills={values.requiredSkills}
              onChange={handleSkillsChange}
              disabled={isPending}
              hasError={!!errors.requiredSkills}
            />
            {errors.requiredSkills && (
              <p className="text-xs text-red-500" role="alert">
                {errors.requiredSkills}
              </p>
            )}
          </div>

          <p className="text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
            New jobs are active by default and will be matched against all uploaded resumes
            immediately.
          </p>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isPending}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
              'bg-slate-800 text-white hover:bg-slate-700 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />}
            {isPending ? 'Creating…' : 'Create job'}
          </button>
        </div>
      </div>
    </>
  );
}

// SkillTagInput

function SkillTagInput({ skills, onChange, disabled, hasError }: SkillTagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addSkill = useCallback(
    (raw: string) => {
      const trimmed = raw.trim().toLowerCase();
      if (!trimmed) return;
      if (!skills.includes(trimmed)) onChange([...skills, trimmed]);
      setInputValue('');
    },
    [skills, onChange],
  );

  function removeSkill(skill: string) {
    onChange(skills.filter((s) => s !== skill));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill(inputValue);
    } else if (e.key === 'Backspace' && inputValue === '' && skills.length > 0) {
      onChange(skills.slice(0, -1));
    }
  }

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className={cn(
        'min-h-[42px] w-full rounded-lg border px-2.5 py-2 cursor-text',
        'flex flex-wrap gap-1.5 items-center',
        'focus-within:ring-2 focus-within:ring-slate-400 focus-within:border-transparent transition-colors',
        hasError ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      {skills.map((skill) => (
        <span
          key={skill}
          className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-white"
        >
          {skill}
          {!disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeSkill(skill);
              }}
              aria-label={`Remove ${skill}`}
              className="rounded-full p-0.5 hover:bg-white/20 transition-colors"
            >
              <X className="w-2.5 h-2.5" aria-hidden="true" />
            </button>
          )}
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (inputValue.trim()) addSkill(inputValue);
        }}
        disabled={disabled}
        placeholder={skills.length === 0 ? 'e.g. react, typescript, node.js' : ''}
        className="flex-1 min-w-[120px] text-sm text-slate-800 placeholder:text-slate-300 bg-transparent outline-none disabled:cursor-not-allowed"
        aria-label="Add a required skill"
      />
    </div>
  );
}

// Loading / Error / Empty

function LoadingState() {
  return (
    <div className="flex justify-center py-16">
      <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <AlertCircle className="w-6 h-6 text-red-400" />
      <p className="text-sm text-slate-500">Failed to load jobs.</p>
      <button
        onClick={onRetry}
        className="text-xs text-slate-500 underline underline-offset-2 hover:text-slate-700"
      >
        Try again
      </button>
    </div>
  );
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
        <Briefcase className="w-5 h-5 text-slate-400" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-600">No job roles yet</p>
        <p className="text-xs text-slate-400 mt-1">
          Create a role and resumes will be matched against it automatically.
        </p>
      </div>
      <button
        onClick={onNew}
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 text-white hover:bg-slate-700 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" aria-hidden="true" />
        Create first job
      </button>
    </div>
  );
}
