"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { StakingPlan, StakingSettings, useGetAdminStakingPlansQuery,
  useGetAdminStakingSettingsQuery, useSaveAdminStakingPlanMutation,
  useUpdateAdminStakingSettingsMutation } from "@/redux/features/staking/adminStakingApi";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const inputClass = "mt-1 w-full rounded-lg border border-white/15 bg-neutral-950 p-2 text-white";
const buttonClass = "rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-40";
const errorMessage = (error: unknown) => (error as { data?: { message?: string } })?.data?.message || "Unable to save changes";
const newPlan: StakingPlan = { termDays: 1, dailyProfitPercent: 0, userSharePercent: 1, minAmount: 1, isActive: true };

export default function StakingManagement() {
  const settingsQuery = useGetAdminStakingSettingsQuery();
  const plansQuery = useGetAdminStakingPlansQuery();
  const [settings, setSettings] = useState<StakingSettings | null>(null);
  const [saveSettings, { isLoading: saving }] = useUpdateAdminStakingSettingsMutation();
  useEffect(() => { if (settingsQuery.data) setSettings(settingsQuery.data.settings); }, [settingsQuery.data]);

  async function submitSettings(event: React.FormEvent) {
    event.preventDefault();
    if (!settings) return;
    try { await saveSettings(settings).unwrap(); toast.success("Staking settings saved"); }
    catch (error) { toast.error(errorMessage(error)); }
  }

  return <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
    <div><h1 className="text-2xl font-bold">Staking Management</h1>
      <p className="mt-2 text-sm text-neutral-400">Control subscriptions, profit payouts, cancellation fees and packages.</p></div>
    {settingsQuery.isError ? <div role="alert">Unable to load settings. <button onClick={() => settingsQuery.refetch()}>Retry</button></div> : !settings ? <p>Loading settings...</p> :
      <form onSubmit={submitSettings} className="space-y-5 rounded-2xl border border-white/10 bg-neutral-900 p-5">
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2"><input type="checkbox" checked={settings.stakingEnabled} onChange={e => setSettings({ ...settings, stakingEnabled: e.target.checked })} /> Staking enabled</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={settings.profitEnabled} onChange={e => setSettings({ ...settings, profitEnabled: e.target.checked })} /> Profit payouts enabled</label>
        </div>
        <label className="block max-w-xs text-sm">Cancellation fee (% of principal)
          <input className={inputClass} type="number" min="0" max="100" step="any" required value={settings.cancellationFeePercent} onChange={e => setSettings({ ...settings, cancellationFeePercent: e.target.valueAsNumber })} />
        </label>
        <fieldset><legend className="mb-3 font-semibold">Profit days · {settings.profitDays.length} days per week</legend>
          <div className="flex flex-wrap gap-3">{DAYS.map((day, index) => <label key={day} className="flex items-center gap-2 rounded-lg border border-white/10 p-3 text-sm">
            <input type="checkbox" checked={settings.profitDays.includes(index)} onChange={e => setSettings({ ...settings, profitDays: e.target.checked ? [...settings.profitDays, index] : settings.profitDays.filter(d => d !== index) })} />{day}
          </label>)}</div>
        </fieldset>
        <p className="text-sm text-neutral-400">Days use Bangladesh time (Asia/Dhaka). Changes apply from today. Unchecked or paused days earn no profit and do not extend the package term. Already paid profit is unchanged. Principal is returned at maturity even when profit is paused.</p>
        <button className={buttonClass} disabled={saving}>{saving ? "Saving..." : "Save settings"}</button>
      </form>}
    <section className="space-y-4"><h2 className="text-xl font-semibold">Packages</h2>
      <p className="text-sm text-neutral-400">Rate and user share changes apply to new subscriptions. Existing subscriptions retain their agreed rates. Deactivate a package to stop new subscriptions.</p>
      {plansQuery.isError ? <div role="alert">Unable to load packages. <button onClick={() => plansQuery.refetch()}>Retry</button></div> : plansQuery.isLoading ? <p>Loading packages...</p> : <>
        {plansQuery.data?.items.map(plan => <PlanEditor key={plan._id || plan.termDays} plan={plan} />)}
        {!plansQuery.data?.items.length && <p>No packages yet. Add your first package below.</p>}
        <PlanEditor plan={newPlan} isNew existingDays={plansQuery.data?.items.map(p => p.termDays)} />
      </>}
    </section>
  </div>;
}

function PlanEditor({ plan, isNew = false, existingDays = [] }: { plan: StakingPlan; isNew?: boolean; existingDays?: number[] }) {
  const [draft, setDraft] = useState(plan);
  const [save, { isLoading }] = useSaveAdminStakingPlanMutation();
  useEffect(() => setDraft(plan), [plan]);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (isNew && existingDays.includes(draft.termDays)) { toast.error("A package with this duration already exists. Edit it above."); return; }
    try { await save(draft).unwrap(); toast.success("Package saved"); if (isNew) setDraft({ ...newPlan }); }
    catch (error) { toast.error(errorMessage(error)); }
  }
  return <form onSubmit={submit} className="space-y-4 rounded-2xl border border-white/10 bg-neutral-900 p-5">
    <h3 className="font-semibold">{isNew ? "Add package" : `${plan.termDays}-day package`}</h3>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <label className="text-sm">Duration (days)<input className={inputClass} type="number" required min="1" step="1" disabled={!isNew} value={draft.termDays} onChange={e => setDraft({ ...draft, termDays: e.target.valueAsNumber })} /></label>
      <label className="text-sm">Gross daily profit (%)<input className={inputClass} type="number" required min="0" step="any" value={draft.dailyProfitPercent} onChange={e => setDraft({ ...draft, dailyProfitPercent: e.target.valueAsNumber })} /></label>
      <label className="text-sm">User share of profit (%)<input className={inputClass} type="number" required min="0" max="100" step="any" value={Number((draft.userSharePercent * 100).toFixed(8))} onChange={e => setDraft({ ...draft, userSharePercent: e.target.valueAsNumber / 100 })} /></label>
      <label className="text-sm">Minimum stake (asset units)<input className={inputClass} type="number" required min="0" step="any" value={draft.minAmount} onChange={e => setDraft({ ...draft, minAmount: e.target.valueAsNumber })} /></label>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3"><label className="flex items-center gap-2"><input type="checkbox" checked={draft.isActive} onChange={e => setDraft({ ...draft, isActive: e.target.checked })} /> Active</label>
      <span className="text-sm text-neutral-400">User profit per eligible day: {Number((draft.dailyProfitPercent * draft.userSharePercent).toFixed(8))}%</span>
      <button className={buttonClass} disabled={isLoading}>{isLoading ? "Saving..." : isNew ? "Add package" : "Save package"}</button></div>
  </form>;
}
