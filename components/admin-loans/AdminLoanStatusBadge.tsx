"use client";

/* ─────────────────────────────────────────────────────────────
   Admin loan status badge
   Loan status অনুযায়ী color badge দেখাবে।
────────────────────────────────────────────────────────────── */
export default function AdminLoanStatusBadge({ status }: { status: string }) {
  const cls =
    status === "active"
      ? "badge-blue"
      : status === "pending"
        ? "badge-yellow"
        : status === "completed"
          ? "badge-green"
          : "badge-red";

  return <span className={`badge text-[10px] ${cls}`}>{status}</span>;
}
