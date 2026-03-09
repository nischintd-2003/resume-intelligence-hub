import {
  AlertCircle,
  BarChart2,
  BookOpen,
  Briefcase,
  FileText,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAnalytics } from '../../hooks/useAnalytics';
import type {
  SkillCount,
  MatchAverage,
  UniversityCount,
  StatCardProps,
} from '../../types/analytics.types';
import { formatDateAnalytics } from '../../utils/dashboard.utils';

export default function AnalyticsPage() {
  const { data, isLoading, isError, refetch, isFetching } = useAnalytics();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <AlertCircle className="w-6 h-6 text-red-400" />
        <p className="text-sm text-slate-500">Failed to load analytics.</p>
        <button
          onClick={() => refetch()}
          className="text-xs text-slate-500 underline underline-offset-2 hover:text-slate-700"
        >
          Try again
        </button>
      </div>
    );
  }

  const hasData = !!data && data.updatedAt !== null;

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Overview</h2>
          {data?.updatedAt ? (
            <p className="text-xs text-slate-400 mt-0.5">
              Last updated {formatDateAnalytics(data.updatedAt)}
            </p>
          ) : (
            <p className="text-xs text-slate-400 mt-0.5">
              Analytics are computed after each resume is fully processed
            </p>
          )}
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          aria-label="Refresh analytics"
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

      {!hasData ? (
        <EmptyState />
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={FileText} label="Resumes parsed" value={data.totalResumes} />
            <StatCard
              icon={BarChart2}
              label="Top skill"
              value={data.topSkills[0]?.skill ?? '—'}
              sub={
                data.topSkills[0]
                  ? `${data.topSkills[0].count} resume${data.topSkills[0].count === 1 ? '' : 's'}`
                  : undefined
              }
            />
            <StatCard
              icon={BookOpen}
              label="Top university"
              value={data.topUniversities[0]?.university ?? '—'}
              truncate
            />
            <StatCard
              icon={Briefcase}
              label="Best match avg"
              value={
                data.matchAverages[0] ? `${Math.round(data.matchAverages[0].averageScore)}%` : '—'
              }
              sub={data.matchAverages[0]?.jobTitle}
              truncate
            />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SkillsChart skills={data.topSkills} />
            <MatchAveragesChart averages={data.matchAverages} />
          </div>

          {/* Universities */}
          {data.topUniversities.length > 0 && (
            <UniversitiesTable universities={data.topUniversities} />
          )}
        </>
      )}
    </div>
  );
}

// StatCard

function StatCard({ icon: Icon, label, value, sub, truncate }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
        </div>
        <p className="text-xs text-slate-400 font-medium">{label}</p>
      </div>
      <p
        className={cn(
          'text-xl font-bold text-slate-800 leading-none',
          truncate && 'truncate text-base',
        )}
        title={typeof value === 'string' ? value : undefined}
      >
        {value}
      </p>
      {sub && (
        <p className="text-xs text-slate-400 truncate" title={sub}>
          {sub}
        </p>
      )}
    </div>
  );
}

// SkillsChart

function SkillsChart({ skills }: { skills: SkillCount[] }) {
  const max = skills[0]?.count ?? 1;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-4">
        Top skills
      </h3>

      {skills.length === 0 ? (
        <p className="text-xs text-slate-400 py-4 text-center">No skill data yet.</p>
      ) : (
        <ul className="space-y-3">
          {skills.map(({ skill, count }) => {
            const pct = Math.round((count / max) * 100);
            return (
              <li key={skill}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-slate-700 capitalize">{skill}</span>
                  <span className="text-xs text-slate-400 tabular-nums">
                    {count} resume{count === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-slate-700 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${skill}: ${count} resumes`}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// MatchAveragesChart

function MatchAveragesChart({ averages }: { averages: MatchAverage[] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-4">
        Match averages by role
      </h3>

      {averages.length === 0 ? (
        <p className="text-xs text-slate-400 py-4 text-center">
          No match data yet. Create job roles and upload resumes to see scores.
        </p>
      ) : (
        <ul className="space-y-3">
          {averages.map(({ jobTitle, averageScore }) => {
            const score = Math.round(averageScore);
            const barColor =
              score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-amber-400' : 'bg-red-400';
            const scoreColor =
              score >= 70 ? 'text-green-600' : score >= 40 ? 'text-amber-600' : 'text-red-500';

            return (
              <li key={jobTitle}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-slate-700 truncate max-w-[70%]">
                    {jobTitle}
                  </span>
                  <span className={cn('text-xs font-bold tabular-nums', scoreColor)}>{score}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', barColor)}
                    style={{ width: `${score}%` }}
                    role="progressbar"
                    aria-valuenow={score}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${jobTitle}: ${score}% average match`}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// UniversitiesTable

function UniversitiesTable({ universities }: { universities: UniversityCount[] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
        <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
          Top universities
        </h3>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="px-5 py-2.5 text-left text-xs font-semibold text-slate-400">#</th>
            <th className="px-5 py-2.5 text-left text-xs font-semibold text-slate-400">
              Institution
            </th>
            <th className="px-5 py-2.5 text-right text-xs font-semibold text-slate-400">Resumes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {universities.map(({ university, count }, idx) => (
            <tr key={university} className="hover:bg-slate-50/60 transition-colors">
              <td className="px-5 py-3 text-xs text-slate-300 font-mono tabular-nums">
                {String(idx + 1).padStart(2, '0')}
              </td>
              <td className="px-5 py-3 text-sm text-slate-700 font-medium max-w-xs truncate">
                {university}
              </td>
              <td className="px-5 py-3 text-sm text-slate-500 text-right tabular-nums">{count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// EmptyState

function EmptyState() {
  return (
    <div className="rounded-xl border-2 border-dashed border-slate-200 p-12 flex flex-col items-center gap-4 text-center">
      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
        <BarChart2 className="w-5 h-5 text-slate-400" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-600">No analytics yet</p>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Analytics are computed automatically after a resume completes the full OCR → NLP → match
          pipeline. Upload a resume to get started.
        </p>
      </div>
      <div className="flex flex-col gap-1 text-xs text-slate-400">
        <PipelineStep n={1} label="Upload a resume on the Upload page" />
        <PipelineStep n={2} label="Worker extracts and parses text" />
        <PipelineStep n={3} label="Match scores are calculated against active jobs" />
        <PipelineStep n={4} label="Analytics appear here automatically" />
      </div>
    </div>
  );
}

function PipelineStep({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center shrink-0">
        {n}
      </span>
      <span>{label}</span>
    </div>
  );
}
