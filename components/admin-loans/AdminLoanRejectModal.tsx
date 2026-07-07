"use client";

import { AdminLoan } from "@/redux/features/loan/adminLoanApi";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Loader2, X } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   Admin loan reject modal
   High contrast smart modal for rejection flow.
────────────────────────────────────────────────────────────── */
export default function AdminLoanRejectModal({
  loan,
  reason,
  isLoading,
  onReasonChange,
  onClose,
  onConfirm,
}: {
  loan: AdminLoan | null;
  reason: string;
  isLoading: boolean;
  onReasonChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <AnimatePresence>
      {loan && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            className="w-full max-w-lg overflow-hidden rounded-[30px] border border-red-400/25 bg-[linear-gradient(180deg,rgba(24,8,12,0.98),rgba(16,10,14,0.98))] shadow-[0_30px_100px_rgba(0,0,0,0.55)]"
          >
            <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(240,75,85,0.12),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-red-500/12 text-red-300 ring-1 ring-red-400/20">
                    <AlertTriangle className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">
                      Reject Loan
                    </h3>
                    <p className="mt-1 text-sm text-white/50">
                      Add a clear reason before rejecting this loan request.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-white/60 transition hover:bg-white/[0.07] hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/45">
                  Requested Amount
                </p>
                <p className="mt-2 text-lg font-black text-white">
                  ${Number(loan.requestedAmount || 0).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-white/80">
                  Rejection Reason
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => onReasonChange(e.target.value)}
                  placeholder="Explain why this loan request is being rejected..."
                  rows={5}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm font-medium text-white outline-none transition placeholder:text-white/25 focus:border-red-400/45 focus:bg-slate-950"
                />
              </div>

              <div className="rounded-[22px] border border-red-400/20 bg-red-500/10 p-4">
                <p className="text-sm font-black text-red-200">
                  Before you continue
                </p>
                <p className="mt-1 text-sm text-red-100/80">
                  The user will see the final rejected status. Make sure the
                  reason is accurate and helpful.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isLoading || !reason.trim()}
                  className="inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-500 to-rose-500 text-sm font-black text-white shadow-[0_16px_45px_rgba(240,75,85,0.25)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4" />
                      Reject Loan
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-14 flex-1 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-sm font-black text-white/80 transition hover:bg-white/[0.06]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
