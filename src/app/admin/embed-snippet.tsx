"use client";

import { useState } from "react";
import { Copy, Check, X, Code2 } from "lucide-react";

const SNIPPET = `<!-- Partner ads — paste before </body> -->
<div id="vz-partners" style="padding:48px 24px;background:#f9fafb"></div>
<script>
(function(){
  fetch('https://www.viv-z.com/api/ads')
    .then(function(r){return r.json()})
    .then(function(ads){
      var el=document.getElementById('vz-partners');
      if(!el||!ads.length)return;
      var grid=document.createElement('div');
      grid.style.cssText='display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;max-width:1100px;margin:0 auto';
      ads.forEach(function(a){
        var card=document.createElement('div');
        card.style.cssText='background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:24px;display:flex;flex-direction:column;gap:12px';
        card.innerHTML=(a.logoUrl
          ?'<img src="'+a.logoUrl+'" style="height:48px;object-fit:contain" alt="'+a.businessName+'">'
          :'<p style="font-weight:700;font-size:16px;margin:0">'+a.businessName+'</p>')
          +'<p style="color:#6b7280;font-size:14px;line-height:1.5;flex:1;margin:0">'+a.description+'</p>'
          +'<a href="'+a.visitUrl+'" target="_blank" rel="noopener"'
          +' onclick="fetch(\'https://www.viv-z.com/api/ads/click\',{method:\'POST\',headers:{\'Content-Type\':\'application/json\'},body:JSON.stringify({id:\''+a.id+'\'}),keepalive:true})"'
          +' style="display:inline-flex;align-items:center;gap:6px;border-radius:8px;background:#4f46e5;color:#fff;font-size:13px;font-weight:600;padding:8px 16px;text-decoration:none;align-self:flex-start">Visit ↗</a>';
        grid.appendChild(card);
      });
      el.appendChild(grid);
    });
})();
<\/script>`;

export function EmbedSnippetButton() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(SNIPPET).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-sm font-medium text-white transition-colors shadow-sm"
      >
        <Code2 className="h-4 w-4" />
        Copy embed code
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Partner ads embed code</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Paste before <code className="bg-gray-100 px-1 rounded">&lt;/body&gt;</code> — tracks pageviews and ad clicks automatically
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 py-5">
              <textarea
                readOnly
                value={SNIPPET}
                rows={16}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 font-mono text-xs text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
              <p className="text-[11px] text-gray-400 mt-2">Click the box to select all.</p>
            </div>

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
                  <><Check className="h-4 w-4" /> Copied!</>
                ) : (
                  <><Copy className="h-4 w-4" /> Copy to clipboard</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
