"use client";

import { formatDate, formatUSD } from "@/lib/utilsnew";
import { AdminLoan } from "@/redux/features/loan/adminLoanApi";
import { Eye } from "lucide-react";
import {
  getLoanApplicantEmail,
  getLoanApplicantName,
  LOAN_ICONS,
  LOAN_LABELS,
} from "./admin-loan.helpers";
import AdminLoanStatusBadge from "./AdminLoanStatusBadge";

/* ─────────────────────────────────────────────────────────────
   Admin loan table
   Smart list view. Approval and rejection actions are handled from the details panel.
────────────────────────────────────────────────────────────── */
export default function AdminLoanTable({
  items,
  tab,
  isLoading,
  detailId,
  onToggleDetail,
}: {
  items: AdminLoan[];
  tab: string;
  isLoading: boolean;
  detailId: string | null;
  onToggleDetail: (id: string) => void;
  onApprove: (loan: AdminLoan) => void;
  onReject: (loan: AdminLoan) => void;
}) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(12,19,38,0.96),rgba(8,12,24,0.96))] shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
      <div
        className="hidden gap-3 px-5 py-4 text-[11px] font-bold uppercase tracking-[0.16em] md:grid"
        style={{
          gridTemplateColumns: "1.7fr 1fr 1fr 1fr 1fr auto",
          color: "rgba(255,255,255,0.45)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <span>Applicant</span>
        <span>Loan Type</span>
        <span>Amount</span>
        <span>Status</span>
        <span>Date</span>
        <span>Open</span>
      </div>

      {isLoading ? (
        [...Array(5)].map((_, i) => (
          <div
            key={i}
            className="mx-4 my-3 h-16 animate-pulse rounded-2xl bg-white/[0.04]"
          />
        ))
      ) : items.length === 0 ? (
        <div className="px-5 py-16 text-center">
          <p className="text-base font-black text-white/85">
            No {tab} loans found
          </p>
          <p className="mt-2 text-sm text-white/40">
            There are no loan requests in this status right now.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {items.map((loan) => {
            const selected = detailId === loan._id;

            return (
              <div
                key={loan._id}
                className={`px-5 py-4 transition ${selected ? "bg-blue-500/[0.06]" : "hover:bg-white/[0.02]"}`}
              >
                <div
                  className="grid gap-3 md:items-center"
                  style={{
                    gridTemplateColumns:
                      "minmax(0,1.7fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) auto",
                  }}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-white">
                      {getLoanApplicantName(loan)}
                    </p>
                    <p className="mt-1 truncate text-xs text-white/45">
                      {getLoanApplicantEmail(loan)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-500/10 text-sm font-black text-blue-200 ring-1 ring-blue-400/20">
                      {LOAN_ICONS[loan.loanType] || "L"}
                    </span>
                    <span className="text-xs font-bold text-white/80">
                      {LOAN_LABELS[loan.loanType] || loan.loanType}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-black text-white">
                      {formatUSD(loan.requestedAmount || 0)}
                    </p>
                    {!!loan.approvedAmount && (
                      <p className="mt-1 text-[11px] font-bold text-emerald-300">
                        Approved {formatUSD(loan.approvedAmount)}
                      </p>
                    )}
                  </div>

                  <AdminLoanStatusBadge status={loan.status} />

                  <p className="text-xs font-semibold text-white/45">
                    {loan.createdAt ? formatDate(loan.createdAt) : "—"}
                  </p>

                  <button
                    type="button"
                    onClick={() => onToggleDetail(loan._id)}
                    className={`inline-flex h-11 items-center justify-center gap-2 rounded-2xl px-4 text-xs font-black transition ${
                      selected
                        ? "bg-blue-500 text-white shadow-[0_10px_30px_rgba(59,130,246,0.22)]"
                        : "border border-white/10 bg-white/[0.03] text-white/80 hover:bg-white/[0.06]"
                    }`}
                    title="View loan details"
                  >
                    <Eye className="h-4 w-4" />
                    {selected ? "Opened" : "Open"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
