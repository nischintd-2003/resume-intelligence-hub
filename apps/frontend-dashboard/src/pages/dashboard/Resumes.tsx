import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useResumes, useResumeMatches } from '../../hooks/useResumes';
import type {
  MatchesPanelProps,
  MatchResultDTO,
  PaginationProps,
  ResumeRowProps,
  ResumeStatus,
  SkillGroupProps,
} from '../../types/resume.types';
import { STATUS_CLASSES, STATUS_LABELS } from '../../constants/resume.constants';
import { deriveFilename, formatDate } from '../../utils/dashboard.utils';

export default function ResumesPage() {
  const [page, setPage] = useState(1);
  const LIMIT = 10;

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch, isFetching } = useResumes(page, LIMIT);

  const resumes = data?.data ?? [];
  const meta = data?.meta;

  function handleRowClick(id: string) {
    setSelectedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">
            {meta ? `${meta.totalItems} resume${meta.totalItems === 1 ? '' : 's'}` : 'Resumes'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Click a row to view job match scores</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          aria-label="Refresh resumes"
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
      </div>

      {/* Main layout: table + slide-over */}
      <div className="flex gap-4 items-start">
        {/* Table card */}
        <div
          className={cn(
            'flex-1 min-w-0 rounded-xl border border-slate-200 bg-white overflow-hidden',
          )}
        >
          {isLoading ? (
            <LoadingRows />
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : resumes.length === 0 ? (
            <EmptyState />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-[40%]">
                    File
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">
                    Skills
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">
                    Uploaded
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resumes.map((resume) => (
                  <ResumeRow
                    key={resume.id}
                    resume={resume}
                    isSelected={selectedId === resume.id}
                    onClick={() => handleRowClick(resume.id)}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {selectedId && <MatchesPanel resumeId={selectedId} onClose={() => setSelectedId(null)} />}
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <Pagination
          meta={meta}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
          isFetching={isFetching}
        />
      )}
    </div>
  );
}

// ResumeRow

function ResumeRow({ resume, isSelected, onClick }: ResumeRowProps) {
  const skills = resume.extractedData?.skills ?? [];
  const VISIBLE = 4;
  const overflow = skills.length - VISIBLE;

  return (
    <tr
      onClick={onClick}
      className={cn(
        'cursor-pointer transition-colors duration-100',
        isSelected ? 'bg-slate-50 ring-1 ring-inset ring-slate-300' : 'hover:bg-slate-50/60',
      )}
    >
      <td className="px-4 py-3">
        <p className="font-medium text-slate-800 truncate max-w-[200px]">
          {deriveFilename(resume.minioPath)}
        </p>
        <p className="text-xs text-slate-400 font-mono truncate max-w-[200px]">
          {resume.id.slice(0, 8)}…
        </p>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <StatusBadge status={resume.status as ResumeStatus} />
      </td>

      {/* Skills chips */}
      <td className="px-4 py-3 hidden md:table-cell">
        {skills.length === 0 ? (
          <span className="text-xs text-slate-300">—</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {skills.slice(0, VISIBLE).map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600"
              >
                {skill}
              </span>
            ))}
            {overflow > 0 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-slate-200 text-slate-500">
                +{overflow}
              </span>
            )}
          </div>
        )}
      </td>

      {/* Date */}
      <td className="px-4 py-3 text-xs text-slate-400 hidden lg:table-cell whitespace-nowrap">
        {formatDate(resume.createdAt)}
      </td>
    </tr>
  );
}

// MatchesPanel

function MatchesPanel({ resumeId, onClose }: MatchesPanelProps) {
  const { data: matches, isLoading, isError } = useResumeMatches(resumeId);

  return (
    <div className="w-72 shrink-0 rounded-xl border border-slate-200 bg-white overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
        <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Match Scores</p>
        <button
          onClick={onClose}
          aria-label="Close match panel"
          className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        >
          <X className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>

      {/* Panel body */}
      <div className="p-3 space-y-2 max-h-[480px] overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          </div>
        ) : isError ? (
          <p className="text-xs text-red-500 text-center py-4">Failed to load matches.</p>
        ) : !matches || matches.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">
            No match results yet. Upload is likely still processing.
          </p>
        ) : (
          matches.map((match) => <MatchCard key={match.id} match={match} />)
        )}
      </div>
    </div>
  );
}

// MatchCard

function MatchCard({ match }: { match: MatchResultDTO }) {
  const score = match.score;
  const barColor = score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-amber-400' : 'bg-red-400';
  const scoreColor =
    score >= 70 ? 'text-green-600' : score >= 40 ? 'text-amber-600' : 'text-red-500';

  return (
    <div className="rounded-lg border border-slate-100 p-3 space-y-2">
      {/* Job title + score */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold text-slate-700 leading-tight">
          {match.JobRole?.title ?? 'Unknown Role'}
        </p>
        <span className={cn('text-sm font-bold shrink-0', scoreColor)}>{score}%</span>
      </div>

      {/* Score bar */}
      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', barColor)}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Matched / missing skills */}
      {match.details.matchedSkills.length > 0 && (
        <SkillGroup label="Matched" skills={match.details.matchedSkills} variant="matched" />
      )}
      {match.details.missingSkills.length > 0 && (
        <SkillGroup label="Missing" skills={match.details.missingSkills} variant="missing" />
      )}
    </div>
  );
}

// SkillGroup

function SkillGroup({ label, skills, variant }: SkillGroupProps) {
  return (
    <div>
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <div className="flex flex-wrap gap-1">
        {skills.map((s) => (
          <span
            key={s}
            className={cn(
              'inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium',
              variant === 'matched' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600',
            )}
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

// Pagination

function Pagination({ meta, onPrev, onNext, isFetching }: PaginationProps) {
  const start = (meta.currentPage - 1) * meta.itemsPerPage + 1;
  const end = Math.min(meta.currentPage * meta.itemsPerPage, meta.totalItems);

  return (
    <div className="flex items-center justify-between">
      <p className="text-xs text-slate-400">
        Showing {start}–{end} of {meta.totalItems}
      </p>
      <div className="flex items-center gap-1">
        <PaginationBtn
          onClick={onPrev}
          disabled={meta.currentPage <= 1 || isFetching}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </PaginationBtn>
        <span className="px-3 text-xs font-medium text-slate-600">
          {meta.currentPage} / {meta.totalPages}
        </span>
        <PaginationBtn
          onClick={onNext}
          disabled={meta.currentPage >= meta.totalPages || isFetching}
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </PaginationBtn>
      </div>
    </div>
  );
}

function PaginationBtn({
  children,
  disabled,
  onClick,
  'aria-label': ariaLabel,
}: {
  children: React.ReactNode;
  disabled: boolean;
  onClick: () => void;
  'aria-label': string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        'p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500',
        'hover:bg-slate-50 hover:border-slate-300 transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400',
        'disabled:opacity-40 disabled:cursor-not-allowed',
      )}
    >
      {children}
    </button>
  );
}

// Loading / error / empty states

function LoadingRows() {
  return (
    <div className="p-8 flex justify-center">
      <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="p-8 flex flex-col items-center gap-3 text-center">
      <AlertCircle className="w-6 h-6 text-red-400" />
      <p className="text-sm text-slate-500">Failed to load resumes.</p>
      <button
        onClick={onRetry}
        className="text-xs text-slate-500 underline underline-offset-2 hover:text-slate-700"
      >
        Try again
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="p-8 text-center">
      <p className="text-sm text-slate-400">No resumes uploaded yet.</p>
      <p className="text-xs text-slate-300 mt-1">
        Head to the Upload page to add your first resume.
      </p>
    </div>
  );
}

// Status Badge

function StatusBadge({ status }: { status: ResumeStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium',
        STATUS_CLASSES[status] ?? 'bg-slate-100 text-slate-500',
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full',
          status === 'parsed'
            ? 'bg-green-400'
            : status === 'extracted'
              ? 'bg-blue-400'
              : status === 'failed'
                ? 'bg-red-400'
                : 'bg-slate-400',
        )}
      />
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
