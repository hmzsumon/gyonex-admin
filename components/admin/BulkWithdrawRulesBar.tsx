/* ────────── BulkWithdrawRulesBar ──────────
   ইউজার লিস্ট থেকে একাধিক ইউজার সিলেক্ট করে একসাথে
   team-activation শর্ত বসানো / তুলে নেওয়া যায়।
─────────────────────────────────────────────── */
"use client";

import { useBulkUpdateWithdrawRulesMutation } from "@/redux/features/admin/adminUsersApi";
import { useState } from "react";
import toast from "react-hot-toast";

export default function BulkWithdrawRulesBar({
  selectedIds,
  onDone,
}: {
  selectedIds: string[];
  onDone: () => void;
}) {
  const [bulkUpdate, { isLoading }] = useBulkUpdateWithdrawRulesMutation();
  const [required, setRequired] = useState<number>(3);

  const count = selectedIds.length;
  if (count === 0) return null;

  const run = async (enable: boolean) => {
    if (
      enable &&
      (!Number.isInteger(required) || required < 0 || required > 100)
    ) {
      toast.error("Required members must be between 0 and 100");
      return;
    }

    try {
      const res = await bulkUpdate({
        userIds: selectedIds,
        require_team_activation: enable,
        ...(enable ? { required_team_members: required } : {}),
      }).unwrap();
      toast.success(res?.message ?? "Updated");
      onDone();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to update withdraw rules");
    }
  };

  return (
    <div className="mb-3 flex flex-col gap-3 rounded-2xl border border-teal-400/20 bg-teal-400/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-white/80">
        <strong className="text-teal-300">{count}</strong> user
        {count > 1 ? "s" : ""} selected
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-white/60">
          Required members
          <input
            type="number"
            min={0}
            max={100}
            value={required}
            disabled={isLoading}
            onChange={(e) => setRequired(Number(e.target.value))}
            className="w-20 rounded-lg border border-white/10 bg-[#0B0D12] px-2 py-1.5 text-sm text-white/90 outline-none focus:border-teal-400/40"
          />
        </label>

        <button
          type="button"
          onClick={() => run(true)}
          disabled={isLoading}
          className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-sm text-amber-300 transition hover:bg-amber-400/15 disabled:opacity-40"
        >
          {isLoading ? "Applying…" : "Apply team rule"}
        </button>

        <button
          type="button"
          onClick={() => run(false)}
          disabled={isLoading}
          className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white/70 transition hover:bg-white/10 disabled:opacity-40"
        >
          Remove team rule
        </button>

        <button
          type="button"
          onClick={onDone}
          disabled={isLoading}
          className="text-xs text-white/40 hover:text-white/70"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
