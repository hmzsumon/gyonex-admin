"use client";
import { useEffect, useState } from "react";
import { apiSlice } from "@/redux/features/api/apiSlice";
import toast from "react-hot-toast";

const settingsApi = apiSlice.injectEndpoints({ endpoints: builder => ({
  getSmartTradeSettings: builder.query<{ settings: { cancellationFeePercent: number } }, void>({
    query: () => "/smart-trade/settings", providesTags: ["AiPlans"],
  }),
  saveSmartTradeSettings: builder.mutation<any, { cancellationFeePercent: number }>({
    query: body => ({ url: "/admin/smart-trade/settings", method: "PUT", body }), invalidatesTags: ["AiPlans"],
  }),
}) });

export default function SmartTradeSettingsCard() {
  const { data, isLoading, isError } = settingsApi.useGetSmartTradeSettingsQuery();
  const [save, { isLoading: saving }] = settingsApi.useSaveSmartTradeSettingsMutation();
  const [fee, setFee] = useState("");
  useEffect(() => { if (data) setFee(String(data.settings.cancellationFeePercent)); }, [data]);
  return <form className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-5" onSubmit={async event => {
    event.preventDefault();
    try { await save({ cancellationFeePercent: Number(fee) }).unwrap(); toast.success("Smart Trade cancellation fee saved"); }
    catch (error: any) { toast.error(error?.data?.message || "Could not save cancellation fee"); }
  }}>
    <h2 className="font-semibold">Smart Trade cancellation & expiry</h2>
    <label className="mt-4 block text-sm text-neutral-300">Cancellation fee (%)
      <input aria-label="Smart Trade cancellation fee" className="ml-3 w-28 rounded-lg border border-neutral-700 bg-neutral-950 p-2 text-white" type="number" min="0" max="100" step="0.01" required value={fee} onChange={event => setFee(event.target.value)} disabled={isLoading || isError} />
    </label>
    <p className="mt-3 text-sm text-neutral-400">Users can cancel only within the first calendar month. The fee is deducted from the original trade amount; the remainder goes to the main wallet.</p>
    <p className="mt-2 text-sm text-neutral-400">The user's 60% profit share expires an account at 2.5× for 50–10,000 USDT, or 3.5× above 10,000 USDT. Expired accounts cannot receive profit or qualify for generation earnings. A new account renews eligibility.</p>
    {isError && <p role="alert" className="mt-2 text-red-400">Could not load settings. Try refreshing.</p>}
    <button disabled={isLoading || isError || saving} className="mt-4 rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-black disabled:opacity-50">{saving ? "Saving…" : "Save cancellation fee"}</button>
  </form>;
}
