"use client";

import { AdminLoanStatus } from "@/redux/features/loan/adminLoanApi";
import { ADMIN_LOAN_TABS } from "./admin-loan.helpers";

/* ─────────────────────────────────────────────────────────────
   Admin loan tabs
   Status wise loan filter করবে।
────────────────────────────────────────────────────────────── */
export default function AdminLoanTabs({
  tab,
  onChange,
}: {
  tab: AdminLoanStatus;
  onChange: (tab: AdminLoanStatus) => void;
}) {
  return (
    <div
      className="flex overflow-x-auto"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
    >
      {ADMIN_LOAN_TABS.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          className={`-mb-px border-b-2 px-4 py-2.5 text-xs font-semibold capitalize transition-colors ${
            tab === item
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-300"
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
