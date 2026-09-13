// /components/admin/dashboard/ActionCenter.tsx
"use client";

/* ────────── "needs attention" quick-action panel — real pending counts ────────── */
import { formatUsdt as usdt } from "@/components/admin/lucky-card/LuckyCardAdminComponents";
import { AlertTriangle, Download, ShieldCheck, Upload } from "lucide-react";
import Link from "next/link";

type ActionItem = {
  label: string;
  count: number;
  detail?: string;
  href: string;
  icon: any;
  tone: "amber" | "rose" | "sky";
};

export default function ActionCenter({
  kycPending,
  withdrawPendingCount,
  withdrawPendingAmount,
  depositPending,
}: {
  kycPending: number;
  withdrawPendingCount: number;
  withdrawPendingAmount: number;
  depositPending: number;
}) {
  const items: ActionItem[] = [
    {
      label: "Pending KYC",
      count: kycPending,
      href: "/kyc",
      icon: ShieldCheck,
      tone: "sky",
    },
    {
      label: "Pending Withdrawals",
      count: withdrawPendingCount,
      detail: withdrawPendingCount ? usdt(withdrawPendingAmount) : undefined,
      href: "/withdrawals/all",
      icon: Upload,
      tone: "rose",
    },
    {
      label: "Pending Deposits",
      count: depositPending,
      href: "/deposits/manual",
      icon: Download,
      tone: "amber",
    },
  ];

  const anyPending = items.some((i) => i.count > 0);

  const toneClasses: Record<ActionItem["tone"], string> = {
    amber: "border-amber-300/30 bg-amber-300/10 text-amber-200",
    rose: "border-rose-400/30 bg-rose-400/10 text-rose-300",
    sky: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-[#0E1014] p-5">
      <div className="mb-3 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-300" />
        <p className="text-sm font-bold text-white">Needs Attention</p>
        {!anyPending && (
          <span className="ml-auto text-[11px] font-bold text-emerald-400">
            All caught up
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {items.map(({ label, count, detail, href, icon: Icon, tone }) => (
          <Link
            key={label}
            href={href}
            className={`flex items-center justify-between gap-3 rounded-xl border p-3.5 transition hover:brightness-110 ${
              count > 0
                ? toneClasses[tone]
                : "border-white/10 bg-white/[0.02] text-white/40"
            }`}
          >
            <div>
              <p className="text-xs font-semibold opacity-80">{label}</p>
              <p className="mt-1 text-xl font-black">{count}</p>
              {detail && <p className="text-[11px] opacity-70">{detail}</p>}
            </div>
            <Icon className="h-5 w-5 opacity-70" />
          </Link>
        ))}
      </div>
    </div>
  );
}
