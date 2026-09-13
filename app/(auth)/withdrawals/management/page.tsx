"use client";

/* ────────── Withdraw Management — fee / min / max / quick amounts / limit ────────── */
import Card from "@/components/new-ui/Card";
import {
  useGetAdminWithdrawSettingsQuery,
  useUpdateAdminWithdrawSettingsMutation,
} from "@/redux/features/withdraw/withdrawApi";
import { Plus, Settings2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const INPUT_CLASS =
  "h-[46px] w-full rounded-xl border border-white/10 bg-[#090B0F] px-3.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-emerald-400/60 focus:ring-[3px] focus:ring-emerald-400/10";

export default function WithdrawManagementPage() {
  const { data, isLoading } = useGetAdminWithdrawSettingsQuery();
  const [updateSettings, { isLoading: saving }] =
    useUpdateAdminWithdrawSettingsMutation();

  const [feePercent, setFeePercent] = useState("8");
  const [minAmount, setMinAmount] = useState("50");
  const [maxAmount, setMaxAmount] = useState("0");
  const [dailyLimitCount, setDailyLimitCount] = useState("1");
  const [quickAmounts, setQuickAmounts] = useState<string[]>([]);
  const [networks, setNetworks] = useState<string[]>([]);
  const [newQuickAmount, setNewQuickAmount] = useState("");
  const [newNetwork, setNewNetwork] = useState("");

  useEffect(() => {
    const s = data?.settings;
    if (!s) return;
    setFeePercent(String(s.feePercent));
    setMinAmount(String(s.minAmount));
    setMaxAmount(String(s.maxAmount));
    setDailyLimitCount(String(s.dailyLimitCount));
    setQuickAmounts(s.quickAmounts.map(String));
    setNetworks(s.networks);
  }, [data]);

  const addQuickAmount = () => {
    const n = Number(newQuickAmount);
    if (!n || n <= 0) return;
    if (quickAmounts.includes(String(n))) return;
    setQuickAmounts(
      [...quickAmounts, String(n)].sort((a, b) => Number(a) - Number(b)),
    );
    setNewQuickAmount("");
  };

  const addNetwork = () => {
    const n = newNetwork.trim().toUpperCase();
    if (!n || networks.includes(n)) return;
    setNetworks([...networks, n]);
    setNewNetwork("");
  };

  const handleSave = async () => {
    const min = Number(minAmount);
    const max = Number(maxAmount);
    if (max > 0 && max < min) {
      toast.error("Maximum amount cannot be less than minimum amount");
      return;
    }
    if (!networks.length) {
      toast.error("Add at least one network");
      return;
    }
    try {
      const res = await updateSettings({
        feePercent: Number(feePercent),
        minAmount: min,
        maxAmount: max,
        dailyLimitCount: Number(dailyLimitCount),
        quickAmounts: quickAmounts.map(Number),
        networks,
      }).unwrap();
      toast.success(res?.message || "Withdraw settings updated");
    } catch (e: any) {
      toast.error(
        e?.data?.error || e?.data?.message || "Failed to update settings",
      );
    }
  };

  /* ────────── live preview using current form values ────────── */
  const previewAmount = Number(quickAmounts[0] || minAmount || 100);
  const previewFee = Number(
    ((previewAmount * Number(feePercent || 0)) / 100).toFixed(2),
  );
  const previewReceive = Number((previewAmount - previewFee).toFixed(2));

  return (
    <main className="min-h-screen bg-[#0B0D12] text-[#E6E6E6]">
      <div className="mx-auto max-w-4xl space-y-5 py-4 md:p-8">
        <div>
          <p className="mb-1 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-emerald-400">
            <Settings2 className="h-4 w-4" /> Withdraw Configuration
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Withdraw Management
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-white/50">
            Control everything about user withdrawals from here — fee, minimum
            &amp; maximum amount, quick-amount presets, daily request limit and
            allowed networks. Changes apply immediately to the user withdraw
            page.
          </p>
        </div>

        {isLoading ? (
          <div className="h-64 animate-pulse rounded-2xl bg-white/[0.04]" />
        ) : (
          <>
            {/* ────────── fee / min / max / daily limit ────────── */}
            <Card title="Core rules">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Withdrawal fee (%)">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={feePercent}
                    onChange={(e) => setFeePercent(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </Field>
                <Field label="Daily request limit (per user)">
                  <input
                    type="number"
                    min={1}
                    value={dailyLimitCount}
                    onChange={(e) => setDailyLimitCount(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </Field>
                <Field label="Minimum amount (USDT)">
                  <input
                    type="number"
                    min={0}
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </Field>
                <Field label="Maximum amount (USDT, 0 = no limit)">
                  <input
                    type="number"
                    min={0}
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </Field>
              </div>
            </Card>

            {/* ────────── quick amounts ────────── */}
            <Card title="Quick amount presets">
              <p className="mb-3 text-xs text-white/40">
                Shown as one-tap buttons on the user withdraw page.
              </p>
              <div className="mb-3 flex flex-wrap gap-2">
                {quickAmounts.map((q) => (
                  <span
                    key={q}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-white/80"
                  >
                    {q} USDT
                    <button
                      onClick={() =>
                        setQuickAmounts(quickAmounts.filter((x) => x !== q))
                      }
                      className="text-white/40 hover:text-rose-300"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {!quickAmounts.length && (
                  <span className="text-xs text-white/35">No presets yet.</span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  placeholder="Add amount (e.g. 750)"
                  value={newQuickAmount}
                  onChange={(e) => setNewQuickAmount(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addQuickAmount()}
                  className={INPUT_CLASS}
                />
                <button
                  onClick={addQuickAmount}
                  className="flex shrink-0 items-center gap-1 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 text-xs font-black text-emerald-300"
                >
                  <Plus className="h-4 w-4" /> Add
                </button>
              </div>
            </Card>

            {/* ────────── networks ────────── */}
            <Card title="Allowed networks">
              <p className="mb-3 text-xs text-white/40">
                Users can only withdraw to one of these networks.
              </p>
              <div className="mb-3 flex flex-wrap gap-2">
                {networks.map((n) => (
                  <span
                    key={n}
                    className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1.5 text-xs font-bold text-sky-200"
                  >
                    {n}
                    <button
                      onClick={() => setNetworks(networks.filter((x) => x !== n))}
                      className="text-sky-200/60 hover:text-rose-300"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {!networks.length && (
                  <span className="text-xs text-white/35">No networks yet.</span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  placeholder="Add network (e.g. TRC20)"
                  value={newNetwork}
                  onChange={(e) => setNewNetwork(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addNetwork()}
                  className={INPUT_CLASS}
                />
                <button
                  onClick={addNetwork}
                  className="flex shrink-0 items-center gap-1 rounded-xl border border-sky-400/30 bg-sky-400/10 px-4 text-xs font-black text-sky-200"
                >
                  <Plus className="h-4 w-4" /> Add
                </button>
              </div>
            </Card>

            {/* ────────── live preview ────────── */}
            <Card title="Preview">
              <div className="grid grid-cols-3 gap-3 text-center text-sm">
                <div className="rounded-xl bg-black/20 p-3">
                  <p className="text-[11px] text-white/40">Withdraw</p>
                  <p className="mt-1 font-black text-white">{previewAmount} USDT</p>
                </div>
                <div className="rounded-xl bg-black/20 p-3">
                  <p className="text-[11px] text-white/40">Fee ({feePercent}%)</p>
                  <p className="mt-1 font-black text-rose-300">{previewFee} USDT</p>
                </div>
                <div className="rounded-xl bg-black/20 p-3">
                  <p className="text-[11px] text-white/40">User receives</p>
                  <p className="mt-1 font-black text-emerald-300">
                    {previewReceive} USDT
                  </p>
                </div>
              </div>
            </Card>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full rounded-xl bg-[#21D3B3] px-4 py-3 text-sm font-semibold text-[#0B0D12] transition hover:bg-[#1EC6A7] disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save withdraw settings"}
            </button>
          </>
        )}
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-bold text-white/60">{label}</span>
      {children}
    </label>
  );
}
