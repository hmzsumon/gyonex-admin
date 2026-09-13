// /components/admin/dashboard/RecentUsersList.tsx
"use client";

/* ────────── latest signups — real data ────────── */
import { formatUsdt } from "@/components/admin/lucky-card/LuckyCardAdminComponents";
import type { AdminRecentUser } from "@/redux/features/admin/adminApi";
import Link from "next/link";

export default function RecentUsersList({ users }: { users: AdminRecentUser[] }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#0E1014] p-5">
      <p className="mb-3 text-sm text-white/60">Newest Users</p>
      {!users.length && <p className="text-xs text-white/35">No users yet.</p>}
      <ul className="space-y-2.5 text-sm">
        {users.map((u) => (
          <li key={u._id} className="flex items-center justify-between gap-3">
            <Link
              href={`/users/${u._id}`}
              className="min-w-0 flex-1 truncate text-white/80 hover:text-white"
            >
              {u.name}{" "}
              <span className="text-xs text-white/35">({u.customerId})</span>
            </Link>
            <span className="shrink-0 text-xs font-bold text-white/60">
              {formatUsdt(u.m_balance)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
