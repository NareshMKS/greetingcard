import { useCallback, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { CardTemplate } from '../types/template';
import { useApp } from '../context/AppContext';

function TemplatePreviewModal({
  imageUrl,
  onConfirm,
  onCancel,
}: {
  imageUrl: string;
  onConfirm: () => void;
  onCancel: () => void;
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
        <div
          className="mx-auto w-full aspect-[3/4] max-h-[320px] rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden bg-slate-100 dark:bg-slate-800"
          style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          This image will be used as the greeting card background. Use it?
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

export function TemplateDropZone() {
  const { selectedTemplate, setSelectedTemplate, setTemplates, setError } = useApp();
  const [isDragOver, setIsDragOver] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

  const hasTemplate = selectedTemplate != null;

  const confirmTemplate = useCallback(() => {
    if (!pendingUrl) return;
    const t: CardTemplate = {
      id: 'template-' + String(Date.now()),
      name: 'Greeting card template',
      description: 'Your card background',
      fontFamily: 'system-ui, sans-serif',
      textColor: '#1f2937',
      accentColor: '#059669',
      background: pendingUrl,
      layout: 'centered',
    };
    setTemplates([t]);
    setSelectedTemplate(t);
    setPendingUrl(null);
  }, [pendingUrl, setTemplates, setSelectedTemplate]);

  const cancelPreview = useCallback(() => {
    if (pendingUrl) URL.revokeObjectURL(pendingUrl);
    setPendingUrl(null);
  }, [pendingUrl]);

  const addFromFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) {
        setError('Please use an image file (e.g. PNG, JPEG) for your template.');
        return;
      }
      setError(null);
      if (pendingUrl) URL.revokeObjectURL(pendingUrl);
      setPendingUrl(URL.createObjectURL(file));
    },
    [setError, pendingUrl]
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
    <section className="w-full" aria-label="Greeting card template">
      {!hasTemplate ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={
            'rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden ' +
            (isDragOver
              ? ' border-violet-500 bg-violet-500/10 scale-[1.01]'
              : ' border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 bg-slate-50/50 dark:bg-slate-800/40')
          }
        >
          <div className="relative p-12">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              aria-label="Upload template image"
            />
            <div className="pointer-events-none flex flex-col items-center gap-3 z-0">
              <div className="w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                <svg className="w-7 h-7 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-slate-700 dark:text-slate-200 font-medium">
                Drop your greeting card template here, or click to upload
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">PNG or JPEG • one template per flow</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-800/40 p-6">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-3">Template set</p>
          <div className="flex items-center gap-4">
            <div
              className="w-28 h-36 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 overflow-hidden shrink-0"
              style={
                selectedTemplate.background.startsWith('blob:') || selectedTemplate.background.startsWith('http') || selectedTemplate.background.startsWith('/')
                  ? { backgroundImage: `url(${selectedTemplate.background})`, backgroundSize: 'cover' }
                  : { backgroundColor: selectedTemplate.background }
              }
            />
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">This image is used as the card background for all recipients.</p>
              <label className="mt-2 inline-flex items-center gap-1.5 text-sm text-violet-600 dark:text-violet-400 hover:underline cursor-pointer">
                <input type="file" accept="image/*" className="sr-only" onChange={handleFileInput} />
                Change template
              </label>
            </div>
          </div>
        </div>
      )}

      {pendingUrl &&
        createPortal(
          <TemplatePreviewModal
            imageUrl={pendingUrl}
            onConfirm={confirmTemplate}
            onCancel={cancelPreview}
          />,
          document.body
        )}
    </section>
  );
}
