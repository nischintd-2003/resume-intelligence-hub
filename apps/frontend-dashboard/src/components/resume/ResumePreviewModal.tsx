import { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { resumeService } from '../../services/resume.service';
import type { ResumePreviewModalProps } from '@/types/resume.types';

export function ResumePreviewModal({ resumeId, onClose }: ResumePreviewModalProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    resumeService
      .getPreviewUrl(resumeId)
      .then(setUrl)
      .catch(() => setError(true));
  }, [resumeId]);

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      {/* Modal */}
      <div
        className="relative w-full max-w-4xl h-[90vh] bg-white rounded-xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-700">Resume Preview</p>
          <button
            onClick={onClose}
            aria-label="Close preview"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {error ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <p className="text-sm">Failed to load preview.</p>
            </div>
          ) : !url ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : (
            <iframe src={url} title="Resume Preview" className="w-full h-full border-0" />
          )}
        </div>
      </div>
    </div>
  );
}
