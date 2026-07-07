"use client";

import { formatDate, formatUSD } from "@/lib/utilsnew";
import { AdminLoan } from "@/redux/features/loan/adminLoanApi";
import {
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Mail,
  Phone,
  ShieldCheck,
  Wallet,
  XCircle,
} from "lucide-react";
import {
  getLoanApplicantEmail,
  getLoanApplicantName,
  getLoanApplicantPhone,
  getLoanKycStatus,
  LOAN_ICONS,
  LOAN_LABELS,
} from "./admin-loan.helpers";
import AdminLoanStatusBadge from "./AdminLoanStatusBadge";

/* ─────────────────────────────────────────────────────────────
   Admin loan details panel
   Selected loan details with smart action area.
────────────────────────────────────────────────────────────── */
export default function AdminLoanDetails({
  loan,
  onApprove,
  onReject,
}: {
  loan: AdminLoan | null;
  onApprove: (loan: AdminLoan) => void;
  onReject: (loan: AdminLoan) => void;
}) {
  if (!loan) {
    return (
      <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(12,19,38,0.96),rgba(8,12,24,0.96))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] text-center">
          <div className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-blue-500/10 text-blue-300 ring-1 ring-blue-400/20">
            <Wallet className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-black text-white">
            Select a loan to review
          </h3>
          <p className="mt-2 max-w-md text-sm text-white/45">
            Open any loan from the list to view full applicant details, then
            approve or reject it from here.
          </p>
        </div>
      </div>
    );
  }

  const detailCards = [
    { label: "Applicant", value: getLoanApplicantName(loan), icon: Wallet },
    { label: "Email", value: getLoanApplicantEmail(loan), icon: Mail },
    { label: "Phone", value: getLoanApplicantPhone(loan), icon: Phone },
    { label: "KYC Status", value: getLoanKycStatus(loan), icon: ShieldCheck },
    {
      label: "Loan Type",
      value: LOAN_LABELS[loan.loanType] || loan.loanType,
      icon: CircleDollarSign,
    },
    {
      label: "Repayment Period",
      value: `${loan.repaymentPeriodDays || 0} days`,
      icon: Clock3,
    },
    {
      label: "Created",
      value: loan.createdAt ? formatDate(loan.createdAt) : "—",
      icon: CalendarDays,
    },
    {
      label: "Due Date",
      value: loan.dueDate ? formatDate(loan.dueDate) : "—",
      icon: CalendarDays,
    },
    {
      label: "Interest Rate",
      value: `${Math.round((loan.interestRate || 0) * 100)}%`,
      icon: CircleDollarSign,
    },
    {
      label: "Total Paid",
      value: formatUSD(loan.totalPaid || 0),
      icon: CircleDollarSign,
    },
    { label: "Admin Note", value: loan.adminNote || "—", icon: Mail },
  ];

  const topStats = [
    {
      label: "Requested Amount",
      value: formatUSD(loan.requestedAmount || 0),
      tone: "from-blue-500/20 to-cyan-500/10 text-blue-200",
    },
    {
      label: "Approved Amount",
      value: loan.approvedAmount ? formatUSD(loan.approvedAmount) : "Pending",
      tone: "from-emerald-500/20 to-teal-500/10 text-emerald-200",
    },
    {
      label: "Total Repayable",
      value: loan.totalRepayable ? formatUSD(loan.totalRepayable) : "—",
      tone: "from-amber-500/20 to-orange-500/10 text-amber-200",
    },
    {
      label: "Status",
      value: loan.status,
      tone: "from-fuchsia-500/20 to-violet-500/10 text-fuchsia-200",
    },
  ];

  return (
    <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(12,19,38,0.96),rgba(8,12,24,0.96))] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.28)]">
      <div className="rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex items-start gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[22px] bg-gradient-to-br from-blue-500/20 to-emerald-500/10 text-xl font-black text-white ring-1 ring-white/10">
              {LOAN_ICONS[loan.loanType] || "L"}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-black text-white">Loan Details</h3>
                <AdminLoanStatusBadge status={loan.status} />
              </div>
              <p className="mt-1 text-sm text-white/50">
                Review the applicant details carefully before taking action.
              </p>
              <p className="mt-3 text-base font-bold text-white/90">
                {getLoanApplicantName(loan)}
              </p>
              <p className="text-sm text-white/45">
                {LOAN_LABELS[loan.loanType] || loan.loanType}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/10 px-4 py-3 text-right">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-300">
              Quick Summary
            </p>
            <p className="mt-1 text-lg font-black text-white">
              {formatUSD(loan.requestedAmount || 0)}
            </p>
            <p className="text-xs text-emerald-200/80">
              {loan.repaymentPeriodDays || 0} days repayment period
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {topStats.map((stat) => (
            <div
              key={stat.label}
              className={`rounded-[22px] border border-white/10 bg-gradient-to-br ${stat.tone} p-4`}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/55">
                {stat.label}
              </p>
              <p className="mt-2 break-words text-lg font-black text-white">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {detailCards.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
          >
            <div className="flex items-center gap-2 text-white/45">
              <Icon className="h-4 w-4" />
              <p className="text-[11px] font-bold uppercase tracking-[0.14em]">
                {label}
              </p>
            </div>
            <p className="mt-3 break-words text-sm font-bold text-white/95">
              {value}
            </p>
          </div>
        ))}
      </div>

      {loan.status === "pending" && (
        <div className="mt-5 rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-black text-white">Review Action</p>
              <p className="mt-1 text-xs text-white/45">
                Approve to disburse the amount to the user wallet, or reject the
                request with a note.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => onReject(loan)}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 text-sm font-black text-red-200 transition hover:bg-red-500/15"
              >
                <XCircle className="h-4 w-4" />
                Reject Loan
              </button>

              <button
                type="button"
                onClick={() => onApprove(loan)}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-blue-500 px-5 text-sm font-black text-white shadow-[0_14px_45px_rgba(16,217,128,0.20)] transition hover:opacity-95"
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve & Disburse
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
