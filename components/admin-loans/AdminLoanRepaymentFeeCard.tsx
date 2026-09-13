"use client";

/* ─────────────────────────────────────────────────────────────
   Admin loan repayment fee card
   ইউজার লোন রিপে করার সময় admin-configured % fee যোগ হয়ে তার main
   balance থেকে কাটা হয় (fee লোনের দেনা কমায় না, প্ল্যাটফর্মের আলাদা চার্জ)।
────────────────────────────────────────────────────────────── */
import {
  useGetAdminLoanRepaymentSettingsQuery,
  useUpdateAdminLoanRepaymentSettingsMutation,
} from "@/redux/features/loan/adminLoanApi";
import { Percent } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AdminLoanRepaymentFeeCard() {
  const { data, isLoading } = useGetAdminLoanRepaymentSettingsQuery();
  const [updateFee, { isLoading: saving }] =
    useUpdateAdminLoanRepaymentSettingsMutation();

  const [feePercent, setFeePercent] = useState("8");

  useEffect(() => {
    if (data?.settings) setFeePercent(String(data.settings.repaymentFeePercent));
  }, [data]);

  const handleSave = async () => {
    const n = Number(feePercent);
    if (!Number.isFinite(n) || n < 0 || n > 100) {
      toast.error("Fee must be between 0 and 100");
      return;
    }
    try {
      const res = await updateFee({ repaymentFeePercent: n }).unwrap();
      toast.success(res?.message || "Repayment fee updated");
    } catch (e: any) {
      toast.error(e?.data?.error || e?.data?.message || "Failed to update fee");
    }
  };

  const previewAmount = 10;
  const previewFee = Number(((previewAmount * Number(feePercent || 0)) / 100).toFixed(2));

  return (
    <div className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3
            className="flex items-center gap-2 text-sm font-black"
            style={{ color: "#ECF0F8" }}
          >
            <Percent className="h-4 w-4" style={{ color: "#F5B731" }} />
            Loan Repayment Fee
          </h3>
          <p className="mt-1 text-xs" style={{ color: "#5A6478" }}>
            Charged on top of every repayment, deducted from the user&apos;s
            main balance. Example: paying $10 with {feePercent}% fee charges $
            {(previewAmount + previewFee).toFixed(2)} total.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="number"
              min={0}
              max={100}
              disabled={isLoading}
              value={feePercent}
              onChange={(e) => setFeePercent(e.target.value)}
              className="h-10 w-24 rounded-xl border border-white/10 bg-black/30 px-3 pr-7 text-sm font-bold text-white outline-none focus:border-blue-400/50"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40">
              %
            </span>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || isLoading}
            className="h-10 rounded-xl bg-blue-500 px-4 text-xs font-black text-white transition hover:bg-blue-400 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
