import { useEffect, useRef, useState } from 'react';
import * as React from 'react';
import { useApp } from './context/AppContext';
import { CSVUploader } from './components/CSVUploader';
import { TemplateDropZone } from './components/TemplateDropZone';
import { RecipientsTable } from './components/RecipientsTable';

/**
 * Single-page app: CSV upload → template upload → table with per-row Generate.
 * Scrolls to the next step after each action; one coherent visual flow.
 */
export default function App() {
  const { recipients, selectedTemplate, error, previewImageUrl } = useApp();
  const hasCsv = recipients.length > 0;
  const hasTemplate = selectedTemplate != null;

  const templateSectionRef = useRef<HTMLElement | null>(null);
  const tableSectionRef = useRef<HTMLElement | null>(null);
  const previewSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (hasCsv && templateSectionRef.current) {
      setTimeout(() => {
        templateSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [hasCsv]);

  useEffect(() => {
    if (hasTemplate && tableSectionRef.current) {
      setTimeout(() => {
        tableSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [hasTemplate]);

  useEffect(() => {
    if (previewImageUrl && previewSectionRef.current) {
      setTimeout(() => {
        previewSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [previewImageUrl]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
            Greeting Card Generator
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Upload CSV → add a template → generate text per recipient
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 flex flex-col gap-14">
        {/* Show errors near the active step, not at the top */}
        {error && !hasTemplate && (
          <div
            role="alert"
            className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 text-sm"
          >
            {error}
          </div>
        )}

        {/* Step 1: CSV */}
        <section
          aria-label="Upload CSV"
          className="scroll-mt-24 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-600/80 shadow-sm overflow-hidden"
          style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)' }}
        >
          <div className="px-5 pt-5 pb-1">
            <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
              Step 1
            </span>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mt-1">
              Upload recipient list (CSV)
            </h2>
          </div>
          <div className="p-5 pt-2">
            <CSVUploader />
          </div>
        </section>

        {/* Step 2: Template — appears after CSV, scroll target */}
        {hasCsv && (
          <section
            ref={templateSectionRef}
            aria-label="Upload template"
            className="scroll-mt-24 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-600/80 shadow-sm overflow-hidden"
            style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)' }}
          >
            <div className="px-5 pt-5 pb-1">
              <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                Step 2
              </span>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mt-1">
                Upload greeting card template
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Use an image as the card background
              </p>
            </div>
            <div className="p-5 pt-2">
              <TemplateDropZone />
            </div>
          </section>
        )}

        {/* Step 3: Table — appears after template, scroll target */}
        {hasTemplate && (
          <section
            ref={tableSectionRef}
            aria-label="Recipients and generate"
            className="scroll-mt-24 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-600/80 shadow-sm overflow-hidden"
            style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)' }}
          >
            <div className="px-5 pt-5 pb-1">
              <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                Step 3
              </span>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mt-1">
                Generate image per recipient
              </h2>
            </div>
            <div className="p-5 pt-2 space-y-6">
              {error && (
                <div
                  role="alert"
                  className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 text-sm"
                >
                  {error}
                </div>
              )}
              <RecipientsTable />
              <GeneratedImagePreview ref={previewSectionRef} />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

const GeneratedImagePreview = React.forwardRef<HTMLDivElement, {}>((_props, ref) => {
  const { previewImageUrl, previewRecipientName, previewRowIndex, recipients, selectedTemplate } = useApp();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!previewImageUrl) return;

    // Find the recipient that matches the preview (prefer exact row)
    const recipient =
      (previewRowIndex != null ? recipients[previewRowIndex] : undefined) ??
      recipients.find((r) => r.name === previewRecipientName);
    if (!recipient) return;

    setDownloading(true);
    try {
      const response = await fetch(previewImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Format: templateId_recipientName_occasion.png
      const templateId = recipient.templateId || selectedTemplate?.id || 'template';
      const recipientName = recipient.name.replace(/[^a-zA-Z0-9]/g, '_');
      const occasion = recipient.occasion.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `${templateId}_${recipientName}_${occasion}.png`;
      
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(false);
    }
  };

  if (!previewImageUrl) {
    return null;
  }

  return (
    <div ref={ref} className="rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/40 p-6 scroll-mt-24">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
          Generated Image Preview
        </h3>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          for {previewRecipientName || 'recipient'}
        </span>
      </div>
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <div className="flex-shrink-0 w-full sm:w-auto sm:max-w-md">
          <div className="aspect-[3/4] w-full sm:w-64 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-sm">
            <img
              src={previewImageUrl}
              alt="Generated greeting card"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="flex-1 flex items-center">
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="w-full sm:w-auto sm:min-w-[180px] rounded-lg bg-violet-600 px-6 py-3 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            {downloading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download image
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

GeneratedImagePreview.displayName = 'GeneratedImagePreview';
