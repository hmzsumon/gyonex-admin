"use client";

import { Dialog, DialogPanel, DialogTitle, Description } from "@headlessui/react";
import { useMemo, useState } from "react";
import { Trophy, Ticket, CheckCircle2 } from "lucide-react";
import type { LotteryDrawPreview as Preview } from "@/redux/features/lottery/lotteryApi";

export default function LotteryDrawPreview({ preview, busy, onClose, onConfirm }: {
  preview: Preview;
  busy: boolean;
  onClose: () => void;
  onConfirm: (ticketIds: string[]) => Promise<void>;
}) {
  const [ticketIds, setTicketIds] = useState(preview.winners.map(w => w.ticketId));
  const [search, setSearch] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const candidatesById = useMemo(() => new Map(preview.candidates.map(c => [c.ticketId, c])), [preview]);
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return preview.candidates.filter(c => [c.name, c.customerId, c.ticketNo].some(v => v.toLowerCase().includes(term)));
  }, [preview, search]);
  const valid = ticketIds.length === preview.winners.length && new Set(ticketIds).size === ticketIds.length && ticketIds.every(id => candidatesById.has(id));
  const total = preview.winners.reduce((sum, w) => sum + w.prizeAmount, 0);
  const chooseTicket = (index: number, ticketId: string) => {
    setTicketIds(ids => {
      const next = [...ids];
      const previousSlot = ids.indexOf(ticketId);
      if (previousSlot !== -1 && previousSlot !== index) next[previousSlot] = ids[index];
      next[index] = ticketId;
      return next;
    });
  };
  return (
    <Dialog open onClose={() => { if (!busy) onClose(); }} className="relative z-50">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 overflow-y-auto p-3 sm:p-6">
        <div className="flex min-h-full items-center justify-center">
          <DialogPanel className="w-full max-w-3xl rounded-3xl border border-white/10 bg-[#10131B] p-5 text-white shadow-2xl sm:p-7">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-amber-300/10 p-3 text-amber-200"><Trophy className="h-6 w-6" /></div>
              <div><p className="text-xs font-bold uppercase tracking-widest text-amber-200">{reviewing ? "Final review" : "Draw preview"}</p>
                <DialogTitle className="text-xl font-bold">{preview.title}</DialogTitle></div>
            </div>
            <Description className="text-sm text-white/60">Review each prize and choose its winning ticket. Results are published and wallets credited only after you confirm.</Description>
            <p className="mt-3 rounded-xl border border-amber-300/20 bg-amber-300/5 p-3 text-xs text-amber-100/80">Auto draw has been turned off for this event. If you close this preview, no result is published. You can reopen the preview or re-enable auto draw in event settings.</p>
            <div className="my-5 grid grid-cols-3 gap-2 rounded-2xl bg-white/5 p-4 text-center">
              <div><p className="text-lg font-bold">{preview.totalPool}</p><p className="text-xs text-white/50">Eligible tickets</p></div>
              <div><p className="text-lg font-bold">{preview.winners.length}</p><p className="text-xs text-white/50">Winning tickets</p></div>
              <div><p className="text-lg font-bold text-amber-200">{total.toLocaleString()} <span className="text-xs">{preview.prizeAsset}</span></p><p className="text-xs text-white/50">Total payout</p></div>
            </div>
            {!reviewing && <label className="mb-4 block text-sm text-white/60">Find a participant
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, customer ID or ticket number" className="mt-2 w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2.5 text-white" />
              <span className="mt-2 block text-xs text-white/40">Choosing a ticket assigned to another prize swaps the two winning tickets.</span>
            </label>}
            <div className="max-h-[45vh] space-y-3 overflow-y-auto pr-1">
              {preview.winners.map((winner, index) => {
                const selected = candidatesById.get(ticketIds[index]);
                const options = filtered.some(c => c.ticketId === selected?.ticketId) || !selected ? filtered : [selected, ...filtered];
                return <div key={index} className="rounded-2xl border border-white/10 bg-black/15 p-4">
                  <div className="mb-3 flex items-center justify-between gap-2"><p className="font-bold"><span className="mr-2 text-amber-200">#{winner.prizeRank}</span>{winner.prizeTitle}</p><p className="text-sm font-bold text-amber-200">{winner.prizeAmount.toLocaleString()} {preview.prizeAsset}</p></div>
                  {reviewing ? <div><p className="font-semibold">{selected?.name} <span className="text-xs text-white/40">{selected?.customerId}</span></p><p className="mt-1 flex items-center gap-2 font-mono text-sm text-white/60"><Ticket className="h-4 w-4" />{selected?.ticketNo}</p></div> : <label className="block text-xs text-white/50">Winner · slot {index + 1}
                    <select aria-label={`Winning ticket for ${winner.prizeTitle}, slot ${index + 1}`} value={ticketIds[index]} onChange={e => chooseTicket(index, e.target.value)} className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#171C27] px-3 py-3 text-sm text-white">
                      {options.map(c => <option key={c.ticketId} value={c.ticketId}>{c.name} · {c.customerId || c.userId} · {c.ticketNo}</option>)}
                    </select>
                  </label>}
                </div>;
              })}
            </div>
            {!valid && <p role="alert" className="mt-3 text-sm text-red-300">Select a different eligible ticket for every prize slot.</p>}
            <div className="mt-5 flex flex-wrap justify-end gap-3">
              <button disabled={busy} onClick={reviewing ? () => setReviewing(false) : onClose} className="rounded-xl border border-white/15 px-5 py-3 text-sm font-bold disabled:opacity-50">{reviewing ? "Back to edit" : "Close preview"}</button>
              <button disabled={!valid || busy} onClick={() => reviewing ? void onConfirm(ticketIds) : setReviewing(true)} className="flex items-center gap-2 rounded-xl bg-amber-300 px-5 py-3 text-sm font-black text-black disabled:opacity-50"><CheckCircle2 className="h-4 w-4" />{busy ? "Publishing results…" : reviewing ? "Confirm & publish draw" : "Review final results"}</button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
