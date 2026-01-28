import { useEffect, useRef } from 'react';
import { useApp } from './context/AppContext';
import { CSVUploader } from './components/CSVUploader';
import { TemplateDropZone } from './components/TemplateDropZone';
import { RecipientsTable } from './components/RecipientsTable';

/**
 * Single-page app: CSV upload → template upload → table with per-row Generate.
 * Scrolls to the next step after each action; one coherent visual flow.
 */
export default function App() {
  const { recipients, selectedTemplate, error } = useApp();
  const hasCsv = recipients.length > 0;
  const hasTemplate = selectedTemplate != null;

  const templateSectionRef = useRef<HTMLElement | null>(null);
  const tableSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (hasCsv && templateSectionRef.current) {
      templateSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [hasCsv]);

  useEffect(() => {
    if (hasTemplate && tableSectionRef.current) {
      tableSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [hasTemplate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-5">
          <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
            Greeting Card Generator
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Upload CSV → add a template → generate text per recipient
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-14">
        {error && (
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
            <div className="p-5 pt-2">
              <div className="flex flex-col gap-6 lg:flex-row">
                <div className="flex-1 min-w-0">
                  <RecipientsTable />
                </div>
                <GeneratedImagePreview />
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function GeneratedImagePreview() {
  const { previewImageUrl, previewRecipientName } = useApp();

  if (!previewImageUrl) {
    return (
      <aside className="lg:w-72 xl:w-80 flex-shrink-0 rounded-xl border border-dashed border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-center px-4 py-6 text-xs text-slate-500 dark:text-slate-400">
        Generated image preview will appear here after you click “Generate image”.
      </aside>
    );
  }

  return (
    <aside className="lg:w-72 xl:w-80 flex-shrink-0 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-3">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
        Preview for {previewRecipientName || 'recipient'}
      </p>
      <div className="aspect-[3/4] w-full overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
        <img
          src={previewImageUrl}
          alt="Generated greeting"
          className="w-full h-full object-cover"
        />
      </div>
    </aside>
  );
}
