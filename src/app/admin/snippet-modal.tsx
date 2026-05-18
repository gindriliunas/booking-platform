"use client";

import { useState } from "react";
import { Copy, Check, X, Code2 } from "lucide-react";

export function SnippetButton({ siteId }: { siteId: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const snippet = `<script>fetch('https://www.viv-z.com/api/track',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({s:'${siteId}',p:location.pathname,r:document.referrer}),keepalive:true});</script>`;

  function copy() {
    navigator.clipboard.writeText(snippet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 text-xs font-medium text-indigo-700 transition-colors"
      >
        <Code2 className="h-3.5 w-3.5" />
        Get snippet
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Tracking snippet</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Paste before the closing <code className="bg-gray-100 px-1 py-0.5 rounded text-[11px]">&lt;/body&gt;</code> tag
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Snippet text area */}
            <div className="px-6 py-5 space-y-3">
              <textarea
                readOnly
                value={snippet}
                rows={5}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 font-mono text-xs text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
              <p className="text-[11px] text-gray-400">Click the text box to select all, or use the button below.</p>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
              <button
                onClick={copy}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-sm font-medium text-white transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy to clipboard
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
