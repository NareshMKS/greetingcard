import { useCallback, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { CardTemplate } from '../types/template';
import { useApp } from '../context/AppContext';

const MAX_TEMPLATES = 5;

function TemplatePreviewModal({
  imageUrl,
  onConfirm,
  onCancel,
  templateNumber,
}: {
  imageUrl: string;
  onConfirm: () => void;
  onCancel: () => void;
  templateNumber: number;
}) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="template-preview-title"
    >
      <div
        className="absolute inset-0 bg-black/70"
        aria-hidden
        onClick={onCancel}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 id="template-preview-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Preview template
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="mx-auto w-full rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <img
            src={imageUrl}
            alt="Template preview"
            className="w-full h-auto max-h-[70vh] object-contain"
          />
        </div>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          {templateNumber === 1
            ? 'This image will be used as the greeting card background. Use it?'
            : `This will be added as template ${templateNumber}. Use it?`}
        </p>
        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
          >
            Use this template
          </button>
        </div>
      </div>
    </div>
  );
}

function DropZoneArea({
  isDragOver,
  onDrop,
  onDragOver,
  onDragLeave,
  onFileSelect,
  compact,
}: {
  isDragOver: boolean;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  compact?: boolean;
}) {
  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
        className={
        'rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden ' +
        (isDragOver
          ? ' border-violet-500 bg-violet-500/10 scale-[1.01]'
          : ' border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 bg-slate-50/50 dark:bg-slate-800/40')
      }
    >
      <div className={'relative ' + (compact ? 'p-6' : 'p-12')}>
        <input
          type="file"
          accept="image/*"
          onChange={onFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          aria-label="Upload template image"
        />
        <div className="pointer-events-none flex flex-col items-center gap-3 z-0">
          <div className="w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center shrink-0">
            <svg className="w-7 h-7 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-slate-700 dark:text-slate-200 font-medium text-center">
            {compact ? 'Add another template' : 'Drop your greeting card template here, or click to upload'}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {compact ? `PNG or JPEG • up to ${MAX_TEMPLATES} templates` : `PNG or JPEG • up to ${MAX_TEMPLATES} templates`}
          </p>
        </div>
      </div>
    </div>
  );
}

export function TemplateDropZone() {
  const { templates, addTemplate, removeTemplate, setError } = useApp();
  const [isDragOver, setIsDragOver] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const canAddMore = templates.length < MAX_TEMPLATES;
  const nextNumber = templates.length + 1;

  const confirmTemplate = useCallback(() => {
    if (!pendingUrl || !pendingFile) return;
    const t: CardTemplate = {
      id: 'template-' + String(Date.now()),
      name: `Template ${nextNumber}`,
      description: 'Your card background',
      fontFamily: 'system-ui, sans-serif',
      textColor: '#1f2937',
      accentColor: '#059669',
      background: pendingUrl,
      layout: 'centered',
    };
    addTemplate(t, pendingFile);
    setPendingUrl(null);
    setPendingFile(null);
  }, [pendingUrl, pendingFile, nextNumber, addTemplate]);

  const cancelPreview = useCallback(() => {
    if (pendingUrl) URL.revokeObjectURL(pendingUrl);
    setPendingUrl(null);
    setPendingFile(null);
  }, [pendingUrl]);

  const addFromFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) {
        setError('Please use an image file (e.g. PNG, JPEG) for your template.');
        return;
      }
      if (templates.length >= MAX_TEMPLATES) return;
      setError(null);
      if (pendingUrl) URL.revokeObjectURL(pendingUrl);
      setPendingUrl(URL.createObjectURL(file));
      setPendingFile(file);
    },
    [setError, templates.length, pendingUrl]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      setError(null);
      const file = e.dataTransfer.files[0];
      if (file) addFromFile(file);
    },
    [addFromFile, setError]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null);
      const file = e.target.files?.[0];
      if (file) addFromFile(file);
      e.target.value = '';
    },
    [addFromFile, setError]
  );

  return (
    <section className="w-full" aria-label="Greeting card templates">
      {templates.length === 0 ? (
        <DropZoneArea
          isDragOver={isDragOver}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onFileSelect={handleFileInput}
        />
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-800/40 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Templates ({templates.length}/{MAX_TEMPLATES}) — used in rotation for Generate all
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {templates.map((t, idx) => (
              <div
                key={t.id}
                className="relative group rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 overflow-hidden"
              >
                <div
                  className="w-full aspect-[3/4] bg-slate-100 dark:bg-slate-700"
                  style={
                    t.background.startsWith('blob:') || t.background.startsWith('http') || t.background.startsWith('/')
                      ? { backgroundImage: `url(${t.background})`, backgroundSize: 'cover' }
                      : { backgroundColor: t.background }
                  }
                />
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <span className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeTemplate(idx)}
                    className="rounded-lg p-1.5 bg-red-500/90 text-white hover:bg-red-600 transition-colors"
                    aria-label={`Remove template ${idx + 1}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          {canAddMore ? (
            <DropZoneArea
              compact
              isDragOver={isDragOver}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onFileSelect={handleFileInput}
            />
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Maximum {MAX_TEMPLATES} templates. Remove one to add another.
            </p>
          )}
        </div>
      )}

      {pendingUrl &&
        createPortal(
          <TemplatePreviewModal
            imageUrl={pendingUrl}
            onConfirm={confirmTemplate}
            onCancel={cancelPreview}
            templateNumber={nextNumber}
          />,
          document.body
        )}
    </section>
  );
}
