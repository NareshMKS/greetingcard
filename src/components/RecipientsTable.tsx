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
      <div className="rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden bg-white dark:bg-slate-800 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/90">
                <th className="py-4 px-6 font-semibold text-slate-800 dark:text-slate-200 text-left text-sm w-28">
                  templateId
                </th>
                <th className="py-4 px-6 font-semibold text-slate-800 dark:text-slate-200 text-left text-sm min-w-[140px]">
                  recipientName
                </th>
                <th className="py-4 px-6 font-semibold text-slate-800 dark:text-slate-200 text-left text-sm min-w-[130px]">
                  senderName
                </th>
                <th className="py-4 px-6 font-semibold text-slate-800 dark:text-slate-200 text-left text-sm min-w-[200px]">
                  message
                </th>
                <th className="py-4 px-6 font-semibold text-slate-800 dark:text-slate-200 text-left text-sm min-w-[120px]">
                  occasion
                </th>
                <th className="py-4 px-6 font-semibold text-slate-800 dark:text-slate-200 text-right text-sm w-44">
                  action
                </th>
              </tr>
            </thead>
            <tbody>
              {recipients.map((r, i) => (
                <tr
                  key={r.id}
                  className="border-b border-slate-100 dark:border-slate-700/60 hover:bg-slate-50/70 dark:hover:bg-slate-700/20 transition-colors"
                >
                  <td className="py-4 px-6 text-slate-700 dark:text-slate-300 text-sm align-top">
                    {r.templateId || `T${i + 1}`}
                  </td>
                  <td className="py-4 px-6 font-medium text-slate-900 dark:text-slate-100 text-sm align-top">
                    {r.name}
                  </td>
                  <td className="py-4 px-6 text-slate-700 dark:text-slate-300 text-sm align-top">
                    {r.sender || '—'}
                  </td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-400 text-sm break-words align-top max-w-md">
                    {r.message || '—'}
                  </td>
                  <td className="py-4 px-6 text-slate-700 dark:text-slate-300 text-sm align-top">
                    {r.occasion}
                  </td>
                  <td className="py-4 px-6 text-right align-top">
                    <button
                      type="button"
                      onClick={() => void generateGreetingForRecipient(i)}
                      disabled={generatingRowIndex !== null}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
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
    </div>
  );
}
