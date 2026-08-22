/* ────────── WithdrawRulesCard ──────────
   অ্যাডমিন এখান থেকে একজন ইউজারের ওপর team-activation শর্ত
   বসাতে / তুলে নিতে পারে। শর্তটা ডিফল্টে কারো ওপর প্রযোজ্য নয়।
─────────────────────────────────────────── */
"use client";

import {
  AdminUserRow,
  useUpdateWithdrawRulesMutation,
} from "@/redux/features/admin/adminUsersApi";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

/* ────────── small toggle ────────── */
const Toggle = ({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={[
      "relative h-6 w-11 shrink-0 rounded-full transition disabled:cursor-not-allowed disabled:opacity-50",
      checked ? "bg-teal-500" : "bg-white/15",
    ].join(" ")}
  >
    <span
      className={[
        "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all",
        checked ? "left-[22px]" : "left-0.5",
      ].join(" ")}
    />
  </button>
);

export default function WithdrawRulesCard({ user }: { user: AdminUserRow }) {
  const [updateWithdrawRules, { isLoading }] = useUpdateWithdrawRulesMutation();

  const [enabled, setEnabled] = useState(!!user.require_team_activation);
  const [required, setRequired] = useState<number>(
    Number(user.required_team_members ?? 3),
  );
  const [withdrawBlock, setWithdrawBlock] = useState(!!user.is_withdraw_block);

  /* সার্ভার থেকে নতুন ডেটা এলে ফর্ম সিঙ্ক করি */
  useEffect(() => {
    setEnabled(!!user.require_team_activation);
    setRequired(Number(user.required_team_members ?? 3));
    setWithdrawBlock(!!user.is_withdraw_block);
  }, [
    user.require_team_activation,
    user.required_team_members,
    user.is_withdraw_block,
  ]);

  const activated = Number(user.addNewMember ?? 0);

  const dirty =
    enabled !== !!user.require_team_activation ||
    required !== Number(user.required_team_members ?? 3) ||
    withdrawBlock !== !!user.is_withdraw_block;

  const handleSave = async () => {
    if (!Number.isInteger(required) || required < 0 || required > 100) {
      toast.error("Required members must be between 0 and 100");
      return;
    }

    try {
      const res = await updateWithdrawRules({
        id: user._id,
        require_team_activation: enabled,
        required_team_members: required,
        is_withdraw_block: withdrawBlock,
      }).unwrap();
      toast.success(res?.message ?? "Withdraw rules updated");
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to update withdraw rules");
    }
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-[#0E1014] p-6">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white/80">Withdraw Rules</h3>
        {enabled && (
          <span className="rounded-full border border-amber-400/30 bg-amber-400/15 px-2 py-0.5 text-xs text-amber-300">
            team rule active
          </span>
        )}
      </div>
      <p className="mb-5 text-xs text-white/40">
        এই শর্তগুলো শুধু এই ইউজারের ওপর প্রযোজ্য হবে। ডিফল্টে কোনো ইউজারের ওপরই
        team-activation শর্ত থাকে না।
      </p>

      <div className="space-y-5">
        {/* ────────── team activation ────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-white/85">Require team activation</div>
            <div className="mt-0.5 text-xs text-white/45">
              চালু করলে এই ইউজার নির্দিষ্ট সংখ্যক মেম্বার অ্যাক্টিভেট না করা
              পর্যন্ত withdraw করতে পারবে না।
            </div>
          </div>
          <Toggle
            checked={enabled}
            onChange={setEnabled}
            disabled={isLoading}
          />
        </div>

        {/* ────────── required count ────────── */}
        {enabled && (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <label className="mb-2 block text-xs text-white/60">
              Required members
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                max={100}
                value={required}
                disabled={isLoading}
                onChange={(e) => setRequired(Number(e.target.value))}
                className="w-28 rounded-lg border border-white/10 bg-[#0B0D12] px-3 py-2 text-sm text-white/90 outline-none focus:border-teal-400/40"
              />
              <span className="text-xs text-white/50">
                Currently activated: <strong>{activated}</strong>
                {activated >= required ? (
                  <span className="ml-2 text-emerald-400">requirement met</span>
                ) : (
                  <span className="ml-2 text-amber-300">
                    {required - activated} more needed
                  </span>
                )}
              </span>
            </div>
          </div>
        )}

        {/* ────────── withdraw block ────────── */}
        <div className="flex items-start justify-between gap-4 border-t border-white/5 pt-5">
          <div>
            <div className="text-sm text-white/85">Block withdrawals</div>
            <div className="mt-0.5 text-xs text-white/45">
              চালু করলে এই ইউজার একদমই withdraw করতে পারবে না (support contact
              মেসেজ দেখবে)।
            </div>
          </div>
          <Toggle
            checked={withdrawBlock}
            onChange={setWithdrawBlock}
            disabled={isLoading}
          />
        </div>

        {/* ────────── save ────────── */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty || isLoading}
            className="rounded-xl border border-teal-400/30 bg-teal-400/10 px-4 py-2 text-sm text-teal-300 transition hover:bg-teal-400/15 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isLoading ? "Saving…" : "Save changes"}
          </button>
          {dirty && !isLoading && (
            <span className="text-xs text-white/40">Unsaved changes</span>
          )}
        </div>
      </div>
    </section>
  );
}
