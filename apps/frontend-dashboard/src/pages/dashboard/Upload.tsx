import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  FileText,
  Loader2,
  RefreshCw,
  UploadCloud,
  X,
  AlertCircle,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useUpload } from '../../hooks/useUpload';
import { Button } from '../../components/ui';
import { UPLOAD_COPY, UPLOAD_CONFIG, STATUS_BADGE_CLASSES } from '../../constants/upload.constants';
import type { DropZoneProps, FileRowProps, UploadStatus } from '../../types/upload.types';
import { formatBytes } from '../../utils/dashboard.utils';

// Page

export default function UploadPage() {
  useEffect(() => {
    document.title = UPLOAD_COPY.PAGE_TITLE;
  }, []);

  const { items, isUploading, addFiles, removeFile, retryFile, startAll, clearDone } = useUpload();

  const idleCount = items.filter((i) => i.status === 'idle').length;
  const doneCount = items.filter((i) => i.status === 'done').length;
  const hasItems = items.length > 0;

  function handleFilesSelected(files: FileList | File[]) {
    addFiles(Array.from(files));
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/*  Drop zone */}
      <DropZone onFilesSelected={handleFilesSelected} disabled={isUploading} />

      {/* File list */}
      {hasItems && (
        <section aria-label="Selected files">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-slate-700">
              {UPLOAD_COPY.FILES_QUEUED(items.length)}
            </p>

            {doneCount > 0 && (
              <button
                onClick={clearDone}
                className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors"
              >
                {UPLOAD_COPY.ACTIONS.CLEAR_DONE}
              </button>
            )}
          </div>

          <ul className="space-y-2.5">
            {items.map((item) => (
              <FileRow
                key={item.id}
                item={item}
                onRemove={() => removeFile(item.id)}
                onRetry={() => retryFile(item.id)}
              />
            ))}
          </ul>
        </section>
      )}

      {/*  Upload action */}
      {idleCount > 0 && (
        <Button
          onClick={startAll}
          isLoading={isUploading}
          disabled={isUploading}
          size="lg"
          fullWidth
        >
          <UploadCloud className="w-4 h-4" aria-hidden="true" />
          {isUploading
            ? UPLOAD_COPY.ACTIONS.UPLOADING
            : `${UPLOAD_COPY.ACTIONS.UPLOAD_ALL} (${idleCount})`}
        </Button>
      )}
    </div>
  );
}

// DropZone

function DropZone({ onFilesSelected, disabled }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragging(true);
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      if (e.dataTransfer.files.length > 0) {
        onFilesSelected(e.dataTransfer.files);
      }
    },
    [disabled, onFilesSelected],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) {
        onFilesSelected(e.target.files);
        e.target.value = '';
      }
    },
    [onFilesSelected],
  );

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Upload drop zone. Press Enter or click to browse files."
      aria-disabled={disabled}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => e.key === 'Enter' && !disabled && inputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'relative flex flex-col items-center justify-center gap-3',
        'rounded-xl border-2 border-dashed',
        'px-8 py-14 text-center',
        'transition-colors duration-150 cursor-pointer select-none outline-none',
        'focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2',
        isDragging
          ? 'border-slate-700 bg-slate-50'
          : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50',
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
      )}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={UPLOAD_CONFIG.ACCEPTED_MIME_TYPES.join(',')}
        onChange={handleInputChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />

      <div
        className={cn(
          'w-14 h-14 rounded-full flex items-center justify-center transition-colors duration-150',
          isDragging ? 'bg-slate-200' : 'bg-slate-100',
        )}
      >
        <UploadCloud
          className={cn(
            'w-7 h-7 transition-colors duration-150',
            isDragging ? 'text-slate-700' : 'text-slate-400',
          )}
          aria-hidden="true"
        />
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-700">
          {isDragging ? UPLOAD_COPY.DROP_ZONE.DRAGGING : UPLOAD_COPY.DROP_ZONE.IDLE_HEADING}
        </p>
        {!isDragging && (
          <p className="mt-1 text-xs text-slate-400">{UPLOAD_COPY.DROP_ZONE.IDLE_SUBTEXT}</p>
        )}
        <p className="mt-2 text-xs text-slate-400">{UPLOAD_COPY.DROP_ZONE.CONSTRAINTS}</p>
      </div>
    </div>
  );
}

//  FileRow

const FileRow = memo(function FileRow({
  item,
  onRemove,
  onRetry,
}: FileRowProps & { onRetry: () => void }) {
  return (
    <li className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
      {/* File icon */}
      <div className="shrink-0 w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center">
        <FileText className="w-4 h-4 text-slate-400" aria-hidden="true" />
      </div>

      {/* Name + progress */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-sm font-medium text-slate-800 truncate">{item.file.name}</p>
          <StatusBadge status={item.status} />
        </div>

        <div className="flex items-center gap-2">
          <p className="text-xs text-slate-400 shrink-0">{formatBytes(item.file.size)}</p>

          {/* Progress bar */}
          {(item.status === 'uploading' || item.status === 'registering') && (
            <div
              role="progressbar"
              aria-valuenow={item.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Uploading ${item.file.name}: ${item.progress}%`}
              className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden"
            >
              <div
                className="h-full bg-slate-700 rounded-full transition-all duration-200"
                style={{ width: `${item.progress}%` }}
              />
            </div>
          )}

          {/* Error text */}
          {item.status === 'error' && item.error && (
            <p className="text-xs text-red-500 truncate flex-1">{item.error}</p>
          )}
        </div>
      </div>

      {/* Action / status icon */}
      {item.status === 'error' ? (
        // retry + remove
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onRetry}
            aria-label={`${UPLOAD_COPY.ACTIONS.RETRY}: ${item.file.name}`}
            className={cn(
              'p-1 rounded text-blue-400 hover:text-blue-600',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400',
              'transition-colors',
            )}
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            onClick={onRemove}
            aria-label={`${UPLOAD_COPY.ACTIONS.REMOVE}: ${item.file.name}`}
            className={cn(
              'p-1 rounded text-slate-300 hover:text-slate-600',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400',
              'transition-colors',
            )}
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      ) : item.status === 'idle' ? (
        // Idle state: remove only
        <button
          onClick={onRemove}
          aria-label={`${UPLOAD_COPY.ACTIONS.REMOVE}: ${item.file.name}`}
          className={cn(
            'shrink-0 p-1 rounded text-slate-300 hover:text-slate-600',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400',
            'transition-colors',
          )}
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      ) : (
        <StatusIcon status={item.status} />
      )}
    </li>
  );
});

// StatusBadge

const StatusBadge = memo(function StatusBadge({ status }: { status: UploadStatus }) {
  return (
    <span
      className={cn(
        'shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
        STATUS_BADGE_CLASSES[status],
      )}
    >
      {UPLOAD_COPY.STATUS[status.toUpperCase() as keyof typeof UPLOAD_COPY.STATUS]}
    </span>
  );
});

//  StatusIcon

const StatusIcon = memo(function StatusIcon({ status }: { status: UploadStatus }) {
  switch (status) {
    case 'uploading':
    case 'registering':
      return <Loader2 className="w-4 h-4 text-blue-500 animate-spin shrink-0" aria-hidden="true" />;
    case 'done':
      return <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" aria-hidden="true" />;
    default:
      return <AlertCircle className="w-4 h-4 text-slate-300 shrink-0" aria-hidden="true" />;
  }
});
