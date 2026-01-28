import { useApp } from '../context/AppContext';

/**
 * Table: templateId, recipientName, senderName, message, occasion, action.
 * Action column has "Generate image" per row.
 */
export function RecipientsTable() {
  const {
    recipients,
    generatingRowIndex,
    generateGreetingForRecipient,
  } = useApp();

  if (recipients.length === 0) return null;

  return (
    <div className="w-full" aria-label="Recipients and actions">
      <div className="rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/90">
                <th className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200 text-left w-24">
                  templateId
                </th>
                <th className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200 text-left min-w-[120px]">
                  recipientName
                </th>
                <th className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200 text-left min-w-[120px]">
                  senderName
                </th>
                <th className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200 text-left min-w-[140px] max-w-[260px]">
                  message
                </th>
                <th className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200 text-left min-w-[100px]">
                  occasion
                </th>
                <th className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200 text-right w-40">
                  action
                </th>
              </tr>
            </thead>
            <tbody>
              {recipients.map((r, i) => (
                <tr
                  key={r.id}
                  className="border-b border-slate-100 dark:border-slate-700/60 hover:bg-slate-50/70 dark:hover:bg-slate-700/20"
                >
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300 align-baseline">
                    {r.templateId || `T${i + 1}`}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100 align-baseline">
                    {r.name}
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300 align-baseline">
                    {r.sender || '—'}
                  </td>
                  <td
                    className="py-3 px-4 text-slate-600 dark:text-slate-400 align-baseline max-w-[260px] truncate"
                    title={r.message || undefined}
                  >
                    {r.message || '—'}
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300 align-baseline">
                    {r.occasion}
                  </td>
                  <td className="py-3 px-4 text-right align-baseline">
                    <button
                      type="button"
                      onClick={() => void generateGreetingForRecipient(i)}
                      disabled={generatingRowIndex !== null}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                    >
                      {generatingRowIndex === i ? (
                        <>
                          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Generating…
                        </>
                      ) : (
                        'Generate image'
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {recipients.some((r) => r.generatedGreeting) && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Generated text is stored for each row.
        </p>
      )}
    </div>
  );
}
