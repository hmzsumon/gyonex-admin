"use client";

/* ────────── lottery admin component imports ────────── */
import type {
  LotteryEvent,
  LotteryEventType,
  LotteryPrizeTier,
  LotteryStatus,
} from "@/redux/features/lottery/lotteryTypes";
import {
  Ban,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Gift,
  Play,
  Plus,
  RefreshCw,
  Ticket,
  Trash2,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { ReactNode } from "react";

/* ────────── lottery admin shared form state type ────────── */
export type LotteryAdminFormState = {
  eventType: LotteryEventType;
  title: string;
  description: string;
  prizeTiers: LotteryPrizeTier[];
  ticketPrice: string;
  maxTickets: string;
  startDate: string;
  endDate: string;
  drawDate: string;
  status: LotteryStatus;
  isAutoDraw: boolean;
};

/* ────────── lottery admin reusable meta config ────────── */
export const LOTTERY_EVENT_LABEL: Record<LotteryEventType, string> = {
  WEEKLY: "Weekly Draw",
  HALF_MONTHLY: "15 Days Draw",
  MONTHLY: "Monthly Draw",
};

export const LOTTERY_STATUS_LABEL: Record<LotteryStatus, string> = {
  draft: "Draft",
  upcoming: "Upcoming",
  open: "Open",
  drawn: "Drawn",
  cancelled: "Cancelled",
};

/* ────────── lottery admin formatting helpers ────────── */
export const formatMoney = (value?: number, asset = "USDT") =>
  `${Number(value ?? 0).toLocaleString("en-US", { maximumFractionDigits: 2 })} ${asset}`;

export const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

/* ────────── lottery admin shell header component ────────── */
export function LotteryAdminHeader({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="mb-1 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-emerald-400">
          <Gift className="h-4 w-4" /> Lottery Management
        </p>
        <h1 className="text-2xl font-black tracking-tight text-white md:text-3xl">
          Lottery Events
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-white/50">
          Control weekly, 15 days and monthly draw events with tickets, prize
          and winner settings.
        </p>
      </div>

      <button
        onClick={onCreate}
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-black text-black shadow-lg shadow-emerald-400/20 transition hover:bg-emerald-300"
      >
        <Plus className="h-4 w-4" /> Create Event
      </button>
    </div>
  );
}

/* ────────── lottery admin summary cards component ────────── */
export function LotteryStatsGrid({ stats }: { stats?: any }) {
  const items = [
    {
      label: "Total Events",
      value: stats?.total ?? 0,
      icon: Gift,
      color: "text-white",
    },
    {
      label: "Open Events",
      value: stats?.open ?? 0,
      icon: RefreshCw,
      color: "text-emerald-400",
    },
    {
      label: "Drawn Events",
      value: stats?.drawn ?? 0,
      icon: Trophy,
      color: "text-amber-300",
    },
    {
      label: "Tickets Sold",
      value: stats?.totalTicketsSold ?? 0,
      icon: Ticket,
      color: "text-sky-300",
    },
    {
      label: "Revenue",
      value: formatMoney(stats?.totalRevenue),
      icon: Users,
      color: "text-violet-300",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {items.map(({ label, value, icon: Icon, color }) => (
        <div
          key={label}
          className="rounded-2xl border border-white/10 bg-[#0E1014] p-4 shadow-2xl shadow-black/20"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold text-white/50">{label}</p>
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
          <p className="mt-3 text-2xl font-black text-white">{value}</p>
        </div>
      ))}
    </div>
  );
}

/* ────────── lottery admin filters component ────────── */
export function LotteryFilters({
  status,
  eventType,
  onStatusChange,
  onEventTypeChange,
}: {
  status: string;
  eventType: string;
  onStatusChange: (value: string) => void;
  onEventTypeChange: (value: string) => void;
}) {
  const statuses = ["all", "open", "upcoming", "drawn", "cancelled"];
  const eventTypes = ["all", "WEEKLY", "HALF_MONTHLY", "MONTHLY"];

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0E1014] p-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap gap-2">
        {statuses.map((item) => (
          <button
            key={item}
            onClick={() => onStatusChange(item)}
            className={`rounded-xl px-3 py-2 text-xs font-bold capitalize transition ${
              status === item
                ? "bg-emerald-400 text-black"
                : "bg-white/[0.04] text-white/60 hover:bg-white/[0.08] hover:text-white"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <select
        value={eventType}
        onChange={(e) => onEventTypeChange(e.target.value)}
        className="h-10 rounded-xl border border-white/10 bg-[#090B0F] px-3 text-sm font-semibold text-white outline-none focus:border-emerald-400/60"
      >
        {eventTypes.map((item) => (
          <option key={item} value={item} className="bg-[#090B0F] text-white">
            {item === "all"
              ? "All Event Types"
              : LOTTERY_EVENT_LABEL[item as LotteryEventType]}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ────────── lottery admin create modal component ────────── */
export function LotteryCreateModal({
  form,
  loading,
  onClose,
  onChange,
  onSubmit,
}: {
  form: LotteryAdminFormState;
  loading: boolean;
  onClose: () => void;
  onChange: (patch: Partial<LotteryAdminFormState>) => void;
  onSubmit: () => void;
}) {
  const totalPrize = form.prizeTiers.reduce(
    (sum, prize) =>
      sum + Number(prize.quantity || 0) * Number(prize.amount || 0),
    0,
  );
  const totalWinners = form.prizeTiers.reduce(
    (sum, prize) => sum + Number(prize.quantity || 0),
    0,
  );

  /* ────────── lottery admin prize tier add handler ────────── */
  const addPrizeTier = () => {
    onChange({
      prizeTiers: [
        ...form.prizeTiers,
        {
          title: `${form.prizeTiers.length + 1}th Prize`,
          quantity: 1,
          amount: 10,
        },
      ],
    });
  };

  /* ────────── lottery admin prize tier update handler ────────── */
  const updatePrizeTier = (index: number, patch: Partial<LotteryPrizeTier>) => {
    onChange({
      prizeTiers: form.prizeTiers.map((prize, i) =>
        i === index ? { ...prize, ...patch } : prize,
      ),
    });
  };

  /* ────────── lottery admin prize tier delete handler ────────── */
  const deletePrizeTier = (index: number) => {
    if (form.prizeTiers.length <= 1) return;
    onChange({ prizeTiers: form.prizeTiers.filter((_, i) => i !== index) });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#0E1014] shadow-2xl shadow-black/50">
        {/* ────────── lottery admin modal header section ────────── */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
              New lottery event
            </p>
            <h2 className="mt-1 text-xl font-black text-white">
              Create Lottery Event
            </h2>
            <p className="mt-1 text-sm text-white/45">
              Create event, ticket rules and unlimited prize tiers from here.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl bg-white/[0.04] p-2 text-white/60 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ────────── lottery admin event information section ────────── */}
        <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
          <LotteryInput label="Event Type">
            <select
              value={form.eventType}
              onChange={(e) =>
                onChange({ eventType: e.target.value as LotteryEventType })
              }
              className="lottery-input"
            >
              <option value="WEEKLY">Weekly Draw</option>
              <option value="HALF_MONTHLY">15 Days Draw</option>
              <option value="MONTHLY">Monthly Draw</option>
            </select>
          </LotteryInput>

          <LotteryInput label="Title">
            <input
              value={form.title}
              onChange={(e) => onChange({ title: e.target.value })}
              className="lottery-input"
              placeholder="Weekly Mega Draw"
            />
          </LotteryInput>

          <LotteryInput label="Ticket Price">
            <input
              type="number"
              value={form.ticketPrice}
              onChange={(e) => onChange({ ticketPrice: e.target.value })}
              className="lottery-input"
              placeholder="5"
            />
          </LotteryInput>

          <LotteryInput label="Max Tickets">
            <input
              type="number"
              value={form.maxTickets}
              onChange={(e) => onChange({ maxTickets: e.target.value })}
              className="lottery-input"
              placeholder="10000"
            />
          </LotteryInput>

          <LotteryInput label="Start Date">
            <input
              type="datetime-local"
              value={form.startDate}
              onChange={(e) => onChange({ startDate: e.target.value })}
              className="lottery-input"
            />
          </LotteryInput>

          <LotteryInput label="End Date">
            <input
              type="datetime-local"
              value={form.endDate}
              onChange={(e) => onChange({ endDate: e.target.value })}
              className="lottery-input"
            />
          </LotteryInput>

          <LotteryInput label="Draw Date">
            <input
              type="datetime-local"
              value={form.drawDate}
              onChange={(e) => onChange({ drawDate: e.target.value })}
              className="lottery-input"
            />
          </LotteryInput>

          <LotteryInput label="Status">
            <select
              value={form.status}
              onChange={(e) =>
                onChange({ status: e.target.value as LotteryStatus })
              }
              className="lottery-input"
            >
              <option value="open">Open</option>
              <option value="upcoming">Upcoming</option>
              <option value="draft">Draft</option>
            </select>
          </LotteryInput>

          <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div>
              <p className="text-sm font-bold text-white">Auto Draw</p>
              <p className="mt-1 text-xs text-white/45">
                Run draw automatically after draw date.
              </p>
            </div>
            <input
              type="checkbox"
              checked={form.isAutoDraw}
              onChange={(e) => onChange({ isAutoDraw: e.target.checked })}
              className="h-5 w-5 accent-emerald-400"
            />
          </label>

          <div className="md:col-span-2 xl:col-span-3">
            <LotteryInput label="Description">
              <textarea
                value={form.description}
                onChange={(e) => onChange({ description: e.target.value })}
                className="lottery-input min-h-[96px] resize-none"
                placeholder="Short description for users"
              />
            </LotteryInput>
          </div>
        </div>

        {/* ────────── lottery admin dynamic prize tier section ────────── */}
        <div className="border-t border-white/10 p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-black text-white">Prize Setup</h3>
              <p className="mt-1 text-xs text-white/45">
                Add 1st, 2nd, 3rd or unlimited prize rows with custom quantity
                and amount.
              </p>
            </div>
            <button
              onClick={addPrizeTier}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-xs font-black text-emerald-300"
            >
              <Plus className="h-4 w-4" /> Add Prize
            </button>
          </div>

          <div className="space-y-3">
            {form.prizeTiers.map((prize, index) => (
              <div
                key={index}
                className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 md:grid-cols-[1fr_140px_160px_44px]"
              >
                <input
                  value={prize.title}
                  onChange={(e) =>
                    updatePrizeTier(index, { title: e.target.value })
                  }
                  className="lottery-input"
                  placeholder="1st Prize"
                />
                <input
                  type="number"
                  value={prize.quantity}
                  onChange={(e) =>
                    updatePrizeTier(index, { quantity: Number(e.target.value) })
                  }
                  className="lottery-input"
                  placeholder="Quantity"
                />
                <input
                  type="number"
                  value={prize.amount}
                  onChange={(e) =>
                    updatePrizeTier(index, { amount: Number(e.target.value) })
                  }
                  className="lottery-input"
                  placeholder="Amount"
                />
                <button
                  onClick={() => deletePrizeTier(index)}
                  disabled={form.prizeTiers.length <= 1}
                  className="flex h-[46px] items-center justify-center rounded-2xl border border-rose-400/30 bg-rose-400/10 text-rose-300 disabled:opacity-40"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-bold text-white/40">
                Total Winner Quantity
              </p>
              <p className="mt-1 text-2xl font-black text-white">
                {totalWinners}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-bold text-white/40">
                Total Prize Budget
              </p>
              <p className="mt-1 text-2xl font-black text-emerald-300">
                {formatMoney(totalPrize)}
              </p>
            </div>
          </div>
        </div>

        {/* ────────── lottery admin modal action section ────────── */}
        <div className="flex flex-col-reverse gap-3 border-t border-white/10 p-5 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-bold text-white/70 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={loading}
            className="rounded-2xl bg-emerald-400 px-6 py-3 text-sm font-black text-black disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Lottery"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ────────── lottery admin event cards component ────────── */
export function LotteryEventGrid({
  lotteries,
  loading,
  drawLoading,
  onDraw,
  onCancel,
}: {
  lotteries: LotteryEvent[];
  loading: boolean;
  drawLoading: boolean;
  onDraw: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  if (loading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-56 animate-pulse rounded-3xl bg-white/[0.04]"
          />
        ))}
      </div>
    );
  }

  if (!lotteries.length) {
    return (
      <div className="rounded-3xl border border-white/10 bg-[#0E1014] px-6 py-16 text-center">
        <Gift className="mx-auto h-12 w-12 text-white/15" />
        <h3 className="mt-4 text-lg font-black text-white">
          No lottery events found
        </h3>
        <p className="mt-1 text-sm text-white/45">
          Create weekly, 15 days or monthly lottery event.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {lotteries.map((lottery) => (
        <LotteryEventCard
          key={lottery._id}
          lottery={lottery}
          drawLoading={drawLoading}
          onDraw={onDraw}
          onCancel={onCancel}
        />
      ))}
    </div>
  );
}

/* ────────── lottery admin single event card component ────────── */
function LotteryEventCard({
  lottery,
  drawLoading,
  onDraw,
  onCancel,
}: {
  lottery: LotteryEvent;
  drawLoading: boolean;
  onDraw: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  const sold = Number(lottery.soldTickets ?? 0);
  const maxTickets = Number(lottery.maxTickets ?? 0);
  const progress = maxTickets ? Math.min(100, (sold / maxTickets) * 100) : 0;

  return (
    <div className="group overflow-hidden rounded-3xl border border-white/10 bg-[#0E1014] shadow-2xl shadow-black/20 transition hover:border-emerald-400/30">
      <div className="bg-gradient-to-br from-emerald-400/15 via-white/[0.03] to-transparent p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-400">
              {LOTTERY_EVENT_LABEL[lottery.eventType]}
            </p>
            <h2 className="mt-2 truncate text-xl font-black text-white">
              {lottery.title}
            </h2>
            <p className="mt-1 line-clamp-2 text-sm text-white/45">
              {lottery.description || "No description added."}
            </p>
          </div>
          <LotteryStatusBadge status={lottery.status} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <LotteryMiniStat
            icon={<Trophy />}
            label="Prize Budget"
            value={formatMoney(lottery.prizeAmount, lottery.prizeAsset)}
          />
          <LotteryMiniStat
            icon={<Ticket />}
            label="Ticket"
            value={formatMoney(lottery.ticketPrice)}
          />
          <LotteryMiniStat
            icon={<Users />}
            label="Sold"
            value={`${sold}/${maxTickets}`}
          />
          <LotteryMiniStat
            icon={<Calendar />}
            label="Draw"
            value={formatDate(lottery.drawDate)}
          />
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-white/45">Ticket capacity</span>
            <span className="font-bold text-white">{progress.toFixed(1)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs text-white/50">
          <LotteryInfoLine
            label="Start"
            value={formatDate(lottery.startDate)}
          />
          <LotteryInfoLine label="End" value={formatDate(lottery.endDate)} />
          <LotteryInfoLine
            label="Winners"
            value={String(lottery.winnerCount)}
          />
          <LotteryInfoLine
            label="Prizes"
            value={`${lottery.prizeTiers?.length ?? 0} tiers`}
          />
          <LotteryInfoLine
            label="Auto Draw"
            value={lottery.isAutoDraw ? "Enabled" : "Disabled"}
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/35">
            Prize tiers
          </p>
          <div className="space-y-1.5">
            {(lottery.prizeTiers?.length
              ? lottery.prizeTiers
              : [
                  {
                    title: "Prize",
                    quantity: lottery.winnerCount,
                    amount: lottery.prizeAmount,
                  },
                ]
            ).map((prize, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-3 rounded-xl bg-black/20 px-3 py-2 text-xs"
              >
                <span className="font-bold text-white/75">
                  {prize.title} × {prize.quantity}
                </span>
                <span className="font-black text-emerald-300">
                  {formatMoney(prize.amount, lottery.prizeAsset)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <button className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold text-white/70 hover:text-white">
            <Eye className="h-4 w-4" /> Details
          </button>

          {lottery.status === "open" && (
            <button
              onClick={() => onDraw(lottery._id)}
              disabled={drawLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-300 px-4 py-2 text-xs font-black text-black disabled:opacity-60"
            >
              <Play className="h-4 w-4" /> Draw Winner
            </button>
          )}

          {lottery.status !== "cancelled" && lottery.status !== "drawn" && (
            <button
              onClick={() => onCancel(lottery._id)}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-2 text-xs font-black text-rose-300"
            >
              <Ban className="h-4 w-4" /> Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ────────── lottery admin pagination component ────────── */
export function LotteryPagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/60 disabled:opacity-40"
      >
        <ChevronLeft className="inline h-4 w-4" /> Prev
      </button>
      <span className="text-sm font-semibold text-white/60">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/60 disabled:opacity-40"
      >
        Next <ChevronRight className="inline h-4 w-4" />
      </button>
    </div>
  );
}

/* ────────── lottery admin form input wrapper component ────────── */
function LotteryInput({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-bold text-white/60">{label}</span>
      {children}
    </label>
  );
}

/* ────────── lottery admin status badge component ────────── */
function LotteryStatusBadge({ status }: { status: LotteryStatus }) {
  const cls: Record<LotteryStatus, string> = {
    draft: "border-white/10 bg-white/[0.04] text-white/50",
    upcoming: "border-sky-400/30 bg-sky-400/10 text-sky-300",
    open: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    drawn: "border-amber-300/30 bg-amber-300/10 text-amber-200",
    cancelled: "border-rose-400/30 bg-rose-400/10 text-rose-300",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase ${cls[status]}`}
    >
      {LOTTERY_STATUS_LABEL[status]}
    </span>
  );
}

/* ────────── lottery admin mini statistic component ────────── */
function LotteryMiniStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <div className="mb-2 flex items-center gap-1.5 text-white/40 [&>svg]:h-3.5 [&>svg]:w-3.5">
        {icon}
        <span className="text-[10px] font-bold uppercase">{label}</span>
      </div>
      <p className="truncate text-sm font-black text-white">{value}</p>
    </div>
  );
}

/* ────────── lottery admin small info line component ────────── */
function LotteryInfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/[0.03] p-3">
      <p className="text-[10px] font-bold uppercase text-white/35">{label}</p>
      <p className="mt-1 truncate text-xs font-bold text-white/80">{value}</p>
    </div>
  );
}
