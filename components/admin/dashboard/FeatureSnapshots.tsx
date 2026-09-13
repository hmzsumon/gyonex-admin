// /components/admin/dashboard/FeatureSnapshots.tsx
"use client";

/* ────────── quick per-feature real-data snapshot cards ────────── */
import { formatUsdt } from "@/components/admin/lucky-card/LuckyCardAdminComponents";
import { Landmark, Sparkles, TicketMinus } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

function SnapshotCard({
  title,
  href,
  icon,
  accent,
  rows,
}: {
  title: string;
  href: string;
  icon: ReactNode;
  accent: string;
  rows: { label: string; value: string }[];
}) {
  return (
    <Link
      href={href}
      className="block rounded-2xl border border-white/5 bg-[#0E1014] p-5 transition hover:border-white/15"
    >
      <div className="mb-3 flex items-center gap-2">
        <span className={accent}>{icon}</span>
        <p className="text-sm font-bold text-white">{title}</p>
      </div>
      <div className="space-y-1.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between text-xs">
            <span className="text-white/45">{r.label}</span>
            <span className="font-bold text-white/85">{r.value}</span>
          </div>
        ))}
      </div>
    </Link>
  );
}

export default function FeatureSnapshots({
  lucky,
  lottery,
  loans,
}: {
  lucky?: { staked: number; paidOut: number; cardsIssued: number; liveRtp: number };
  lottery?: { total: number; open: number; totalTicketsSold: number; totalRevenue: number };
  loans?: { pending: number; active: number; total: number; totalAmountPending: number };
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <SnapshotCard
        title="Lucky Card"
        href="/lucky-cards"
        icon={<Sparkles className="h-4 w-4" />}
        accent="text-emerald-400"
        rows={[
          { label: "Cards issued", value: String(lucky?.cardsIssued ?? 0) },
          { label: "Staked", value: formatUsdt(lucky?.staked) },
          { label: "Paid out", value: formatUsdt(lucky?.paidOut) },
          { label: "Live RTP", value: `${lucky?.liveRtp ?? 0}%` },
        ]}
      />
      <SnapshotCard
        title="Lottery"
        href="/lottary"
        icon={<TicketMinus className="h-4 w-4" />}
        accent="text-violet-300"
        rows={[
          { label: "Events", value: String(lottery?.total ?? 0) },
          { label: "Open now", value: String(lottery?.open ?? 0) },
          { label: "Tickets sold", value: String(lottery?.totalTicketsSold ?? 0) },
          { label: "Revenue", value: formatUsdt(lottery?.totalRevenue) },
        ]}
      />
      <SnapshotCard
        title="Loans"
        href="/loans"
        icon={<Landmark className="h-4 w-4" />}
        accent="text-amber-300"
        rows={[
          { label: "Pending", value: String(loans?.pending ?? 0) },
          { label: "Active", value: String(loans?.active ?? 0) },
          { label: "Total applications", value: String(loans?.total ?? 0) },
          { label: "Pending amount", value: formatUsdt(loans?.totalAmountPending) },
        ]}
      />
    </div>
  );
}
