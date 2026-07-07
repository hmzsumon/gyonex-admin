"use client";

import { formatUSD } from "@/lib/utilsnew";
import { AdminLoan } from "@/redux/features/loan/adminLoanApi";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, ShieldCheck, Wallet2, X } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   Admin loan approve modal
   High contrast smart modal for loan approval.
────────────────────────────────────────────────────────────── */
export default function AdminLoanApproveModal({
  loan,
  approvedAmount,
  adminNote,
  isLoading,
  onAmountChange,
  onNoteChange,
  onClose,
  onConfirm,
}: {
  loan: AdminLoan | null;
  approvedAmount: string;
  adminNote: string;
  isLoading: boolean;
  onAmountChange: (value: string) => void;
  onNoteChange: (value: string) => void;
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
            className="w-full max-w-xl overflow-hidden rounded-[30px] border border-emerald-400/25 bg-[linear-gradient(180deg,rgba(7,16,32,0.98),rgba(10,18,37,0.98))] shadow-[0_30px_100px_rgba(0,0,0,0.55)]"
          >
            <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(16,217,128,0.14),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-400/12 text-emerald-300 ring-1 ring-emerald-400/20">
                    <ShieldCheck className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">
                      Approve Loan
                    </h3>
                    <p className="mt-1 text-sm text-white/50">
                      Confirm the approved amount and disburse it to the user's
                      wallet.
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

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/45">
                    Requested Amount
                  </p>
                  <p className="mt-2 text-xl font-black text-white">
                    {formatUSD(loan.requestedAmount || 0)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/45">
                    Repayment Period
                  </p>
                  <p className="mt-2 text-xl font-black text-white">
                    {loan.repaymentPeriodDays || 0} days
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div>
                <label className="mb-2 block text-sm font-bold text-white/80">
                  Approved Amount (USDT)
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-black text-white/40">
                    $
                  </span>
                  <input
                    type="number"
                    value={approvedAmount}
                    onChange={(e) => onAmountChange(e.target.value)}
                    min={1}
                    placeholder="Enter approved amount"
                    className="h-14 w-full rounded-2xl border border-white/10 bg-slate-950/70 pl-9 pr-4 text-base font-black text-white outline-none transition placeholder:text-white/25 focus:border-emerald-400/45 focus:bg-slate-950"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-white/80">
                  Admin Note (optional)
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => onNoteChange(e.target.value)}
                  placeholder="Write an internal note for this approval..."
                  rows={4}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm font-medium text-white outline-none transition placeholder:text-white/25 focus:border-emerald-400/45 focus:bg-slate-950"
                />
              </div>

              <div className="rounded-[22px] border border-amber-400/20 bg-amber-400/10 p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-400/12 text-amber-300 ring-1 ring-amber-400/25">
                    <Wallet2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-amber-200">
                      Disbursement Notice
                    </p>
                    <p className="mt-1 text-sm text-amber-100/80">
                      This action will immediately credit{" "}
                      {formatUSD(Number(approvedAmount) || 0)} to the user's
                      wallet.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={
                    isLoading || !approvedAmount || Number(approvedAmount) <= 0
                  }
                  className="inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-blue-500 text-sm font-black text-white shadow-[0_16px_45px_rgba(16,217,128,0.25)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Approve & Disburse
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
