"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useGetAdminLoanRepaymentSettingsQuery, useUpdateAdminLoanRepaymentSettingsMutation } from "@/redux/features/loan/adminLoanApi";

export default function AdminLoanRepaymentFeeCard() {
  const { data, isLoading, isError } = useGetAdminLoanRepaymentSettingsQuery();
  const [update, { isLoading: saving }] = useUpdateAdminLoanRepaymentSettingsMutation();
  const [fee, setFee] = useState("");
  const [interest, setInterest] = useState("");
  useEffect(() => {
    if (data) { setFee(String(data.settings.repaymentFeePercent)); setInterest(String(data.settings.monthlyInterestPercent)); }
  }, [data]);
  return <form className="rounded-2xl border border-white/10 bg-white/[0.025] p-5" onSubmit={async event => {
    event.preventDefault();
    try {
      await update({ repaymentFeePercent: Number(fee), monthlyInterestPercent: Number(interest) }).unwrap();
      toast.success("Loan settings saved");
    } catch { toast.error("Could not save loan settings"); }
  }}>
    <h3 className="font-bold text-white">Loan interest & repayment settings</h3>
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      <label className="text-sm text-white/70">Monthly interest (%)
        <input aria-label="Monthly loan interest" required type="number" min="0" max="100" step="0.01" value={interest} onChange={event => setInterest(event.target.value)} disabled={isLoading || isError} className="mt-2 block w-full rounded-xl border border-white/10 bg-black/30 p-3 text-white" />
        <span className="mt-2 block text-xs text-white/45">New applications use this rate. Existing loan agreements keep their saved interest rate.</span>
      </label>
      <label className="text-sm text-white/70">Repayment service fee (%)
        <input aria-label="Loan repayment service fee" required type="number" min="0" max="100" step="0.01" value={fee} onChange={event => setFee(event.target.value)} disabled={isLoading || isError} className="mt-2 block w-full rounded-xl border border-white/10 bg-black/30 p-3 text-white" />
        <span className="mt-2 block text-xs text-white/45">Charged in addition to each repayment from the main balance.</span>
      </label>
    </div>
    {data && <p className="mt-4 rounded-xl bg-emerald-400/5 p-3 text-xs text-emerald-200">Example: $1,000 for 50 days → ${(1000 * Number(interest || 0) / 100 * 50 / 30).toFixed(2)} interest. A $100 repayment deducts ${(100 + Number(fee || 0)).toFixed(2)} including the service fee.</p>}
    {isError && <p role="alert" className="mt-3 text-red-300">Could not load current loan settings. Please refresh.</p>}
    <button disabled={isLoading || isError || saving} className="mt-4 rounded-xl bg-emerald-500 px-5 py-2.5 font-bold text-black disabled:opacity-50">{saving ? "Saving…" : "Save loan settings"}</button>
  </form>;
}
