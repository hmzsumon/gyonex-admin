"use client";

import { AdminLoanStats } from "@/redux/features/loan/adminLoanApi";
import { CreditCard } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   Admin loan header
   Page title এবং quick stats দেখাবে।
────────────────────────────────────────────────────────────── */
export default function AdminLoanHeader({ stats }: { stats?: AdminLoanStats }) {
  const cards = [
    ["Pending", stats?.pending || 0, "#F5B731"],
    ["Active", stats?.active || 0, "#3B82F6"],
    ["Total", stats?.total || 0, "#8B95A8"],
  ] as const;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1
          className="flex items-center gap-2 text-base font-black"
          style={{ color: "#ECF0F8" }}
        >
          <CreditCard className="h-5 w-5" style={{ color: "#3B82F6" }} />
          Loan Management
        </h1>
        <p className="mt-1 text-xs" style={{ color: "#5A6478" }}>
          Review loan applications, edit approved amount and approve or reject.
        </p>
      </div>

      <div className="flex gap-3 text-xs">
        {cards.map(([label, value, color]) => (
          <div
            key={label}
            className="min-w-16 rounded-xl bg-white/[0.03] px-3 py-2 text-center ring-1 ring-white/10"
          >
            <p className="font-num text-lg font-black" style={{ color }}>
              {value}
            </p>
            <p style={{ color: "#5A6478" }}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
