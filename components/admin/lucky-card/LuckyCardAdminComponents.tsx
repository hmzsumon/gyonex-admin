"use client";

/* ────────── lucky card admin component imports ────────── */
import type {
  LuckyCardTypeRow,
  LuckyGiftRow,
  LuckyPackageRow,
  LuckyPrizePoolRow,
  LuckyPrizeTierRow,
  LuckyRecentPurchase,
  LuckyRecentWin,
  LuckyRtpRow,
} from "@/redux/features/lucky-card/luckyCardTypes";
import {
  ChevronDown,
  ChevronUp,
  Gift,
  Layers,
  Package,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  Trophy,
  Wallet,
} from "lucide-react";
import { ReactNode, useState } from "react";

/* ────────── shared style + format helpers ────────── */
export const LUCKY_INPUT_CLASS =
  "h-[44px] w-full rounded-[14px] border border-white/10 bg-[#090B0F] px-[14px] text-sm text-white outline-none placeholder:text-white/30 focus:border-emerald-400/60 focus:ring-[3px] focus:ring-emerald-400/10";

export const formatUsdt = (value?: number) =>
  `${Number(value ?? 0).toLocaleString("en-US", { maximumFractionDigits: 2 })} USDT`;

export const formatDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

/* ────────── header ────────── */
export function LuckyAdminHeader({
  active,
  onTabChange,
}: {
  active: "catalog" | "prize-pool" | "stats" | "gift";
  onTabChange: (tab: "catalog" | "prize-pool" | "stats" | "gift") => void;
}) {
  const tabs: { key: typeof active; label: string; icon: any }[] = [
    { key: "catalog", label: "Card Types & Packages", icon: Layers },
    { key: "prize-pool", label: "Prize Pool", icon: Trophy },
    { key: "stats", label: "Stats & History", icon: RefreshCw },
    { key: "gift", label: "Gift a Package", icon: Gift },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-1 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-emerald-400">
          <Sparkles className="h-4 w-4" /> Lucky Card Management
        </p>
        <h1 className="text-2xl font-black tracking-tight text-white md:text-3xl">
          Lucky Card
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-white/50">
          Scratch-card packages backed by a shared global prize pool (USDT).
          Control card types, packages, prize pool distribution and gift
          packages to any user.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-[#0E1014] p-2">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition ${
              active === key
                ? "bg-emerald-400 text-black"
                : "text-white/60 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ────────── stats grid ────────── */
export function LuckyStatsGrid({
  summary,
}: {
  summary?: {
    totalStaked: number;
    totalPaidOut: number;
    grossRevenue: number;
    liveRtp: number;
  };
}) {
  const items = [
    { label: "Total Staked", value: formatUsdt(summary?.totalStaked), icon: Wallet, color: "text-sky-300" },
    { label: "Total Paid Out", value: formatUsdt(summary?.totalPaidOut), icon: Trophy, color: "text-amber-300" },
    { label: "Gross Revenue", value: formatUsdt(summary?.grossRevenue), icon: Sparkles, color: "text-emerald-400" },
    { label: "Live RTP", value: `${summary?.liveRtp ?? 0}%`, icon: RefreshCw, color: "text-violet-300" },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="rounded-2xl border border-white/10 bg-[#0E1014] p-4 shadow-2xl shadow-black/20">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold text-white/50">{label}</p>
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
          <p className="mt-3 text-xl font-black text-white">{value}</p>
        </div>
      ))}
    </div>
  );
}

/* ────────── generic form field wrapper ────────── */
export function LuckyField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-bold text-white/60">{label}</span>
      {children}
    </label>
  );
}

/* ────────── card type editor row (packages + tiers inline) ────────── */
export function LuckyCardTypeCard({
  cardType,
  onSaveType,
  onDeleteType,
  onSavePackage,
  onDeletePackage,
  onSaveTier,
  onDeleteTier,
  savingType,
}: {
  cardType: LuckyCardTypeRow;
  onSaveType: (patch: Partial<LuckyCardTypeRow>) => void;
  onDeleteType: () => void;
  onSavePackage: (pkg: Partial<LuckyPackageRow>) => void;
  onDeletePackage: (id: string) => void;
  onSaveTier: (tier: Partial<LuckyPrizeTierRow>) => void;
  onDeleteTier: (id: string) => void;
  savingType: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({
    name: cardType.name,
    price: String(cardType.price),
    accent: cardType.accent,
    targetRtp: String(cardType.targetRtp),
    displayTopPrize: String(cardType.displayTopPrize || 0),
    isActive: cardType.isActive,
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0E1014] shadow-2xl shadow-black/20">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3">
          <span
            className="h-8 w-8 rounded-xl"
            style={{ background: cardType.accent }}
            aria-hidden
          />
          <div>
            <p className="text-sm font-black text-white">{cardType.name}</p>
            <p className="text-xs text-white/45">
              key: {cardType.key} · price {formatUsdt(cardType.price)} · issued{" "}
              {cardType.cardsIssued}
            </p>
          </div>
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase ${
              cardType.isActive
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                : "border-white/10 bg-white/[0.04] text-white/40"
            }`}
          >
            {cardType.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-white/50">
          <span>Theoretical RTP: {cardType.theoreticalRtp}%</span>
          <button
            onClick={() => setEdit((v) => !v)}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 font-bold text-white/70 hover:text-white"
          >
            Edit
          </button>
          <button
            onClick={onDeleteType}
            className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-1.5 font-bold text-rose-300"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="rounded-xl border border-white/10 bg-white/[0.04] p-1.5 text-white/70 hover:text-white"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {edit && (
        <div className="grid gap-3 border-t border-white/10 bg-white/[0.02] p-4 md:grid-cols-3">
          <LuckyField label="Name">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={LUCKY_INPUT_CLASS}
            />
          </LuckyField>
          <LuckyField label="Price (USDT)">
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className={LUCKY_INPUT_CLASS}
            />
          </LuckyField>
          <LuckyField label="Accent color">
            <input
              value={form.accent}
              onChange={(e) => setForm({ ...form, accent: e.target.value })}
              className={LUCKY_INPUT_CLASS}
            />
          </LuckyField>
          <LuckyField label="Target RTP (%)">
            <input
              type="number"
              value={form.targetRtp}
              onChange={(e) => setForm({ ...form, targetRtp: e.target.value })}
              className={LUCKY_INPUT_CLASS}
            />
          </LuckyField>
          <LuckyField label="Display top prize (marketing only, 0 = auto)">
            <input
              type="number"
              value={form.displayTopPrize}
              onChange={(e) => setForm({ ...form, displayTopPrize: e.target.value })}
              className={LUCKY_INPUT_CLASS}
            />
          </LuckyField>
          <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <span className="text-xs font-bold text-white">Active in shop</span>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="h-5 w-5 accent-emerald-400"
            />
          </label>
          <div className="md:col-span-3">
            <button
              disabled={savingType}
              onClick={() =>
                onSaveType({
                  _id: cardType._id,
                  name: form.name,
                  price: Number(form.price),
                  accent: form.accent,
                  targetRtp: Number(form.targetRtp),
                  displayTopPrize: Number(form.displayTopPrize),
                  isActive: form.isActive,
                } as any)
              }
              className="rounded-2xl bg-emerald-400 px-5 py-2.5 text-xs font-black text-black disabled:opacity-60"
            >
              {savingType ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      )}

      {expanded && (
        <div className="grid gap-4 border-t border-white/10 p-4 lg:grid-cols-2">
          <LuckyPackagesEditor
            packages={cardType.packages}
            onSave={(pkg) => onSavePackage({ ...pkg, cardType: cardType._id } as any)}
            onDelete={onDeletePackage}
          />
          <LuckyTiersEditor
            tiers={cardType.prizeTiers}
            onSave={(tier) => onSaveTier({ ...tier, cardType: cardType._id } as any)}
            onDelete={onDeleteTier}
          />
        </div>
      )}
    </div>
  );
}

/* ────────── packages sub-editor ────────── */
function LuckyPackagesEditor({
  packages,
  onSave,
  onDelete,
}: {
  packages: LuckyPackageRow[];
  onSave: (pkg: Partial<LuckyPackageRow>) => void;
  onDelete: (id: string) => void;
}) {
  const empty = { name: "", cardCount: "3", bonusCards: "0", regularPrice: "0", price: "0" };
  const [form, setForm] = useState(empty);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-black text-white">
        <Package className="h-4 w-4 text-emerald-400" /> Packages
      </div>

      <div className="space-y-2">
        {packages.map((p) => (
          <div
            key={p._id}
            className="flex items-center justify-between gap-2 rounded-xl bg-black/20 px-3 py-2 text-xs"
          >
            <div>
              <p className="font-bold text-white">
                {p.name} · {p.cardCount + p.bonusCards} cards
              </p>
              <p className="text-white/45">
                {formatUsdt(p.price)}
                {p.regularPrice > p.price ? ` (was ${formatUsdt(p.regularPrice)})` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSave({ _id: p._id, isActive: !p.isActive })}
                className={`rounded-lg border px-2 py-1 font-bold ${
                  p.isActive
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                    : "border-white/10 bg-white/[0.04] text-white/40"
                }`}
              >
                {p.isActive ? "Active" : "Off"}
              </button>
              <button
                onClick={() => onDelete(p._id)}
                className="rounded-lg border border-rose-400/30 bg-rose-400/10 p-1.5 text-rose-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
        {!packages.length && (
          <p className="text-xs text-white/40">No packages yet — add one below.</p>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <input
          placeholder="Name (e.g. 5 Cards)"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={`${LUCKY_INPUT_CLASS} col-span-2`}
        />
        <input
          type="number"
          placeholder="Card count"
          value={form.cardCount}
          onChange={(e) => setForm({ ...form, cardCount: e.target.value })}
          className={LUCKY_INPUT_CLASS}
        />
        <input
          type="number"
          placeholder="Bonus cards"
          value={form.bonusCards}
          onChange={(e) => setForm({ ...form, bonusCards: e.target.value })}
          className={LUCKY_INPUT_CLASS}
        />
        <input
          type="number"
          placeholder="Regular price"
          value={form.regularPrice}
          onChange={(e) => setForm({ ...form, regularPrice: e.target.value })}
          className={LUCKY_INPUT_CLASS}
        />
        <input
          type="number"
          placeholder="Offer price (USDT)"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className={LUCKY_INPUT_CLASS}
        />
      </div>
      <button
        onClick={() => {
          if (!form.name || !form.cardCount || !form.price) return;
          onSave({
            name: form.name,
            cardCount: Number(form.cardCount),
            bonusCards: Number(form.bonusCards || 0),
            regularPrice: Number(form.regularPrice || 0),
            price: Number(form.price),
          });
          setForm(empty);
        }}
        className="mt-3 inline-flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-xs font-black text-emerald-300"
      >
        <Plus className="h-4 w-4" /> Add package
      </button>
    </div>
  );
}

/* ────────── prize tiers sub-editor (legacy / display only) ────────── */
function LuckyTiersEditor({
  tiers,
  onSave,
  onDelete,
}: {
  tiers: LuckyPrizeTierRow[];
  onSave: (tier: Partial<LuckyPrizeTierRow>) => void;
  onDelete: (id: string) => void;
}) {
  const empty = { label: "", symbol: "💰", amount: "0", weight: "1" };
  const [form, setForm] = useState(empty);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="mb-1 flex items-center gap-2 text-sm font-black text-white">
        <Trophy className="h-4 w-4 text-amber-300" /> Prize Tiers (display / theoretical RTP)
      </div>
      <p className="mb-3 text-[11px] text-white/40">
        Actual outcomes come from the global prize pool below — these tiers only
        drive the &quot;theoretical RTP&quot; number shown here and in the shop.
      </p>

      <div className="space-y-2">
        {tiers.map((t) => (
          <div
            key={t._id}
            className="flex items-center justify-between gap-2 rounded-xl bg-black/20 px-3 py-2 text-xs"
          >
            <span className="font-bold text-white">
              {t.symbol} {t.label} — {formatUsdt(t.amount)} (weight {t.weight})
            </span>
            <button
              onClick={() => onDelete(t._id)}
              className="rounded-lg border border-rose-400/30 bg-rose-400/10 p-1.5 text-rose-300"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {!tiers.length && <p className="text-xs text-white/40">No tiers yet.</p>}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <input
          placeholder="Label"
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
          className={LUCKY_INPUT_CLASS}
        />
        <input
          placeholder="Symbol"
          value={form.symbol}
          onChange={(e) => setForm({ ...form, symbol: e.target.value })}
          className={LUCKY_INPUT_CLASS}
        />
        <input
          type="number"
          placeholder="Amount (USDT)"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          className={LUCKY_INPUT_CLASS}
        />
        <input
          type="number"
          placeholder="Weight"
          value={form.weight}
          onChange={(e) => setForm({ ...form, weight: e.target.value })}
          className={LUCKY_INPUT_CLASS}
        />
      </div>
      <button
        onClick={() => {
          if (!form.label) return;
          onSave({
            label: form.label,
            symbol: form.symbol,
            amount: Number(form.amount || 0),
            weight: Number(form.weight || 1),
          });
          setForm(empty);
        }}
        className="mt-3 inline-flex items-center gap-2 rounded-xl border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-xs font-black text-amber-200"
      >
        <Plus className="h-4 w-4" /> Add tier
      </button>
    </div>
  );
}

/* ────────── new card type form ────────── */
export function LuckyNewCardTypeForm({
  onCreate,
  loading,
}: {
  onCreate: (payload: any) => void;
  loading: boolean;
}) {
  const [form, setForm] = useState({
    key: "",
    name: "",
    price: "50",
    accent: "#7C5CFC",
    targetRtp: "80",
    displayTopPrize: "0",
  });

  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-4">
      <p className="mb-3 text-sm font-black text-white">Add new card type</p>
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
        <input
          placeholder="key (e.g. lucky-mini)"
          value={form.key}
          onChange={(e) => setForm({ ...form, key: e.target.value })}
          className={LUCKY_INPUT_CLASS}
        />
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={LUCKY_INPUT_CLASS}
        />
        <input
          type="number"
          placeholder="Price (USDT)"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className={LUCKY_INPUT_CLASS}
        />
        <input
          placeholder="Accent color"
          value={form.accent}
          onChange={(e) => setForm({ ...form, accent: e.target.value })}
          className={LUCKY_INPUT_CLASS}
        />
        <input
          type="number"
          placeholder="Target RTP %"
          value={form.targetRtp}
          onChange={(e) => setForm({ ...form, targetRtp: e.target.value })}
          className={LUCKY_INPUT_CLASS}
        />
      </div>
      <button
        disabled={loading || !form.key || !form.name}
        onClick={() =>
          onCreate({
            key: form.key.trim(),
            name: form.name.trim(),
            price: Number(form.price),
            accent: form.accent,
            targetRtp: Number(form.targetRtp),
            displayTopPrize: Number(form.displayTopPrize || 0),
          })
        }
        className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-emerald-400 px-5 py-2.5 text-xs font-black text-black disabled:opacity-60"
      >
        <Plus className="h-4 w-4" /> {loading ? "Creating..." : "Create card type"}
      </button>
    </div>
  );
}

/* ────────── prize pool row editor ────────── */
export type PrizePoolFormRow = {
  code: string;
  label: string;
  symbol: string;
  amount: string;
  percent: string;
  isActive: boolean;
};

export function LuckyPrizePoolEditor({
  rows,
  companyFundPercent,
  onChangeRows,
  onChangeCompanyFundPercent,
  onAddRow,
  onRemoveRow,
  preview,
  onPreview,
  onSave,
  saving,
  previewing,
}: {
  rows: PrizePoolFormRow[];
  companyFundPercent: string;
  onChangeRows: (rows: PrizePoolFormRow[]) => void;
  onChangeCompanyFundPercent: (value: string) => void;
  onAddRow: () => void;
  onRemoveRow: (index: number) => void;
  preview: any;
  onPreview: () => void;
  onSave: () => void;
  saving: boolean;
  previewing: boolean;
}) {
  const update = (index: number, patch: Partial<PrizePoolFormRow>) => {
    onChangeRows(rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0E1014] p-4">
      <div className="mb-1 flex items-center gap-2 text-sm font-black text-white">
        <Trophy className="h-4 w-4 text-amber-300" /> Global Prize Pool Distribution
      </div>
      <p className="mb-4 text-xs text-white/45">
        Every scratch spreads that card&apos;s USDT price across these pools by
        percent. When a pool&apos;s balance reaches its target amount, the next
        scratch wins it. All percentages (prizes + company fund) must total 100%
        or less.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-xs">
          <thead>
            <tr className="text-white/40">
              <th className="py-2 pr-2">Code</th>
              <th className="py-2 pr-2">Label</th>
              <th className="py-2 pr-2">Symbol</th>
              <th className="py-2 pr-2">Target amount (USDT)</th>
              <th className="py-2 pr-2">Percent (%)</th>
              <th className="py-2 pr-2">Active</th>
              <th className="py-2 pr-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-white/5">
                <td className="py-2 pr-2">
                  <input
                    value={r.code}
                    onChange={(e) => update(i, { code: e.target.value.toUpperCase() })}
                    className={`${LUCKY_INPUT_CLASS} h-9 w-16`}
                  />
                </td>
                <td className="py-2 pr-2">
                  <input
                    value={r.label}
                    onChange={(e) => update(i, { label: e.target.value })}
                    className={`${LUCKY_INPUT_CLASS} h-9 w-32`}
                  />
                </td>
                <td className="py-2 pr-2">
                  <input
                    value={r.symbol}
                    onChange={(e) => update(i, { symbol: e.target.value })}
                    className={`${LUCKY_INPUT_CLASS} h-9 w-16`}
                  />
                </td>
                <td className="py-2 pr-2">
                  <input
                    type="number"
                    value={r.amount}
                    onChange={(e) => update(i, { amount: e.target.value })}
                    className={`${LUCKY_INPUT_CLASS} h-9 w-28`}
                  />
                </td>
                <td className="py-2 pr-2">
                  <input
                    type="number"
                    value={r.percent}
                    onChange={(e) => update(i, { percent: e.target.value })}
                    className={`${LUCKY_INPUT_CLASS} h-9 w-24`}
                  />
                </td>
                <td className="py-2 pr-2">
                  <input
                    type="checkbox"
                    checked={r.isActive}
                    onChange={(e) => update(i, { isActive: e.target.checked })}
                    className="h-4 w-4 accent-emerald-400"
                  />
                </td>
                <td className="py-2 pr-2">
                  <button
                    onClick={() => onRemoveRow(i)}
                    className="rounded-lg border border-rose-400/30 bg-rose-400/10 p-1.5 text-rose-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={onAddRow}
        className="mt-3 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-white/70 hover:text-white"
      >
        <Plus className="h-4 w-4" /> Add pool row
      </button>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <LuckyField label="Company fund percent (%)">
          <input
            type="number"
            value={companyFundPercent}
            onChange={(e) => onChangeCompanyFundPercent(e.target.value)}
            className={LUCKY_INPUT_CLASS}
          />
        </LuckyField>
      </div>

      {preview && (
        <div
          className={`mt-4 rounded-2xl border p-4 text-xs ${
            preview.over100
              ? "border-rose-400/30 bg-rose-400/10 text-rose-200"
              : "border-emerald-400/20 bg-emerald-400/5 text-emerald-200"
          }`}
        >
          <p className="font-black">
            Total: {preview.grandTotalPercent}%{" "}
            {preview.exactly100 ? "(exactly 100%)" : preview.over100 ? "(over 100% — invalid)" : "(under 100%)"}
          </p>
          {preview.warning && <p className="mt-1 text-white/70">{preview.warning}</p>}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={onPreview}
          disabled={previewing}
          className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-xs font-black text-white/80 disabled:opacity-60"
        >
          {previewing ? "Previewing..." : "Preview"}
        </button>
        <button
          onClick={onSave}
          disabled={saving || !preview || preview.over100}
          className="rounded-2xl bg-emerald-400 px-5 py-2.5 text-xs font-black text-black disabled:opacity-60"
        >
          {saving ? "Saving..." : "Confirm & Save"}
        </button>
      </div>
    </div>
  );
}

/* ────────── live pools status grid ────────── */
export function LuckyPrizePoolStatusGrid({ pools }: { pools: LuckyPrizePoolRow[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
      {pools.map((p) => (
        <div key={p._id} className="rounded-2xl border border-white/10 bg-[#0E1014] p-3">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-black text-white">
              {p.symbol} {p.code}
            </span>
            <span className="text-white/40">{p.percent}%</span>
          </div>
          <p className="text-sm font-black text-emerald-300">{formatUsdt(p.amount)}</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300"
              style={{ width: `${p.fillPercent}%` }}
            />
          </div>
          <p className="mt-1 text-[10px] text-white/40">
            {formatUsdt(p.balance)} filled ({p.fillPercent}%) · won {p.timesWon}×
          </p>
        </div>
      ))}
    </div>
  );
}

/* ────────── RTP table ────────── */
export function LuckyRtpTable({
  rows,
  onReset,
}: {
  rows: LuckyRtpRow[];
  onReset: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0E1014] p-4">
      <table className="w-full min-w-[720px] text-left text-xs">
        <thead>
          <tr className="text-white/40">
            <th className="py-2 pr-2">Card type</th>
            <th className="py-2 pr-2">Price</th>
            <th className="py-2 pr-2">Opened</th>
            <th className="py-2 pr-2">Staked</th>
            <th className="py-2 pr-2">Paid out</th>
            <th className="py-2 pr-2">Actual RTP</th>
            <th className="py-2 pr-2">Theoretical RTP</th>
            <th className="py-2 pr-2" />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r._id} className="border-t border-white/5">
              <td className="py-2 pr-2 font-bold text-white">{r.name}</td>
              <td className="py-2 pr-2 text-white/70">{formatUsdt(r.price)}</td>
              <td className="py-2 pr-2 text-white/70">{r.cardsOpened}</td>
              <td className="py-2 pr-2 text-white/70">{formatUsdt(r.staked)}</td>
              <td className="py-2 pr-2 text-white/70">{formatUsdt(r.paidOut)}</td>
              <td className="py-2 pr-2 font-bold text-emerald-300">{r.actualRtp}%</td>
              <td className="py-2 pr-2 text-white/50">{r.theoreticalRtp}%</td>
              <td className="py-2 pr-2">
                <button
                  onClick={() => onReset(r._id)}
                  className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-bold text-white/60 hover:text-white"
                >
                  Reset stats
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ────────── recent wins / purchases list ────────── */
export function LuckyRecentLists({
  wins,
  purchases,
}: {
  wins: LuckyRecentWin[];
  purchases: LuckyRecentPurchase[];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-[#0E1014] p-4">
        <p className="mb-3 text-sm font-black text-white">Recent wins</p>
        <div className="space-y-2">
          {wins.map((w) => (
            <div key={w._id} className="rounded-xl bg-black/20 px-3 py-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{w.user || "—"}</span>
                <span className="font-black text-emerald-300">{formatUsdt(w.prizeAmount)}</span>
              </div>
              <p className="mt-1 text-white/45">
                {w.cardType} · {w.prizeLabel} {w.source === "gift" ? "· 🎁 gift" : ""} ·{" "}
                {formatDateTime(w.openedAt)}
              </p>
            </div>
          ))}
          {!wins.length && <p className="text-xs text-white/40">No wins yet.</p>}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0E1014] p-4">
        <p className="mb-3 text-sm font-black text-white">Recent purchases</p>
        <div className="space-y-2">
          {purchases.map((p) => (
            <div key={p._id} className="rounded-xl bg-black/20 px-3 py-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{p.user || "—"}</span>
                <span className="font-black text-white/80">
                  {p.source === "gift" ? "🎁 Gift" : formatUsdt(p.totalPrice)}
                </span>
              </div>
              <p className="mt-1 text-white/45">
                {p.cardType} · {p.quantity} cards · {formatDateTime(p.createdAt)}
              </p>
            </div>
          ))}
          {!purchases.length && <p className="text-xs text-white/40">No purchases yet.</p>}
        </div>
      </div>
    </div>
  );
}

/* ────────── gift history table ────────── */
export function LuckyGiftHistoryTable({ gifts }: { gifts: LuckyGiftRow[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0E1014] p-4">
      <p className="mb-3 text-sm font-black text-white">Gift history</p>
      <table className="w-full min-w-[640px] text-left text-xs">
        <thead>
          <tr className="text-white/40">
            <th className="py-2 pr-2">User</th>
            <th className="py-2 pr-2">Card type</th>
            <th className="py-2 pr-2">Cards</th>
            <th className="py-2 pr-2">Prize amount</th>
            <th className="py-2 pr-2">Gifted by</th>
            <th className="py-2 pr-2">Note</th>
            <th className="py-2 pr-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {gifts.map((g) => (
            <tr key={g._id} className="border-t border-white/5">
              <td className="py-2 pr-2 font-bold text-white">
                {g.user?.name || "—"}{" "}
                <span className="text-white/40">({g.user?.customerId})</span>
              </td>
              <td className="py-2 pr-2 text-white/70">{g.cardType}</td>
              <td className="py-2 pr-2 text-white/70">{g.quantity}</td>
              <td className="py-2 pr-2 font-black text-emerald-300">
                {formatUsdt(g.prizeAmount)}
              </td>
              <td className="py-2 pr-2 text-white/50">{g.giftedBy?.name || "—"}</td>
              <td className="py-2 pr-2 text-white/50">{g.note || "-"}</td>
              <td className="py-2 pr-2 text-white/40">{formatDateTime(g.createdAt)}</td>
            </tr>
          ))}
          {!gifts.length && (
            <tr>
              <td colSpan={7} className="py-4 text-center text-white/40">
                No gifts sent yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
