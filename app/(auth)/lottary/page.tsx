'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

import { lotteryApi } from '@/services/loterry.api';
import { formatUSD } from '@/lib/formatNew';
import {
  Trophy, Plus, Ticket, Users, DollarSign, Play,
  X, CheckCircle, AlertTriangle, ChevronLeft,
  ChevronRight, Eye, Ban, RefreshCw, Gift,
  TrendingUp, Calendar, Hash,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────
   Constants
───────────────────────────────────────────────────────────────────────── */
const TICKET_PRICE = 5;

/* ─────────────────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────────────────── */
interface ILottery {
  _id:         string;
  title:       string;
  description: string;
  prizeAmount: number;
  prizeAsset:  string;
  ticketPrice: number;
  maxTickets:  number;
  drawDate:    string;
  status:      'upcoming' | 'open' | 'drawn' | 'cancelled';
  tickets:     { userId: string; quantity: number; purchasedAt: string }[];
  winner?:     { userId: string; ticketIndex: number; drawnAt: string };
  winnerInfo?: { name: string; country: string; maskedName: string };
  createdBy:   { fullName: string } | string;
  createdAt:   string;
}

interface IStats {
  total:            number;
  open:             number;
  drawn:            number;
  cancelled:        number;
  totalTicketsSold: number;
  totalRevenue:     number;
}

interface CreateForm {
  title:       string;
  description: string;
  prizeAmount: string;
  prizeAsset:  string;
  drawDate:    string;
  maxTickets:  string;
}

/* ─────────────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────────── */
function sumTickets(tickets: { quantity: number }[]): number {
  return tickets.reduce((s, t) => s + t.quantity, 0);
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function fmtDateInput(d: Date): string {
  return d.toISOString().slice(0, 16);
}

/** Returns the next two 1st/15th draw dates as ISO strings for the date picker default */
function nextDrawOptions(): { label: string; value: string }[] {
  const now = new Date();
  const yr  = now.getFullYear();
  const mo  = now.getMonth();
  const candidates = [
    new Date(yr, mo,      15, 20, 0, 0),
    new Date(yr, mo + 1,   1, 20, 0, 0),
    new Date(yr, mo + 1,  15, 20, 0, 0),
    new Date(yr, mo + 2,   1, 20, 0, 0),
  ];
  return candidates
    .filter(d => d > now)
    .slice(0, 4)
    .map(d => ({
      label: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' · 20:00',
      value: fmtDateInput(d),
    }));
}

const STATUS_META: Record<string, { label: string; cls: string }> = {
  open:      { label: 'Open',      cls: 'badge-brand'    },
  upcoming:  { label: 'Upcoming',  cls: 'badge-warning'  },
  drawn:     { label: 'Drawn',     cls: 'badge-muted'    },
  cancelled: { label: 'Cancelled', cls: 'badge-danger'   },
};

/* ─────────────────────────────────────────────────────────────────────────
   Toast
───────────────────────────────────────────────────────────────────────── */
function Toast({ msg, ok, onDone }: { msg: string; ok: boolean; onDone: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8 }}
      onAnimationComplete={() => setTimeout(onDone, 3_000)}
      className="fixed top-14 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-semibold shadow-2xl"
      style={{
        background: 'var(--bg-elevated)',
        border: `1px solid ${ok ? 'rgba(9,212,125,0.4)' : 'rgba(240,80,75,0.4)'}`,
        color: ok ? 'var(--profit)' : 'var(--loss)',
      }}
    >
      {ok
        ? <CheckCircle className="w-4 h-4 shrink-0" />
        : <AlertTriangle className="w-4 h-4 shrink-0" />}
      {msg}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Confirm Dialog
───────────────────────────────────────────────────────────────────────── */
function ConfirmDialog({
  title, message, confirmLabel, danger,
  onConfirm, onCancel, loading,
}: {
  title:        string;
  message:      string;
  confirmLabel: string;
  danger?:      boolean;
  onConfirm:    () => void;
  onCancel:     () => void;
  loading:      boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.94, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94, y: 8 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl p-6 space-y-4"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-1)' }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>{title}</p>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-3)' }}>{message}</p>
          </div>
          <button onClick={onCancel} className="btn btn-ghost btn-xs shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="btn btn-ghost flex-1">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="btn flex-1"
            style={{
              background: danger ? 'var(--loss)' : 'var(--brand)',
              color: 'white',
            }}
          >
            {loading
              ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing…</>
              : confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Create Lottery Modal
───────────────────────────────────────────────────────────────────────── */
function CreateModal({
  onClose,
  onSuccess,
}: {
  onClose:   () => void;
  onSuccess: (msg: string) => void;
}) {
  const qc      = useQueryClient();
  const options = nextDrawOptions();

  const [form, setForm] = useState<CreateForm>({
    title:       '',
    description: '',
    prizeAmount: '1000',
    prizeAsset:  'USDT',
    drawDate:    options[0]?.value ?? '',
    maxTickets:  '10000',
  });
  const [errors, setErrors] = useState<Partial<CreateForm>>({});

  const mutation = useMutation({
    mutationFn: () =>
      lotteryApi.adminCreate({
        ...form,
        prizeAmount: parseFloat(form.prizeAmount),
        maxTickets:  parseInt(form.maxTickets),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-lotteries'] });
      onSuccess('Lottery created successfully!');
      onClose();
    },
    onError: (e: { response?: { data?: { message?: string } } }) => {
      setErrors({ title: e.response?.data?.message ?? 'Failed to create lottery' });
    },
  });

  const set = (k: keyof CreateForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    setErrors(er => ({ ...er, [k]: undefined }));
  };

  const validate = (): boolean => {
    const e: Partial<CreateForm> = {};
    if (!form.title.trim())               e.title       = 'Title is required';
    if (!form.prizeAmount || parseFloat(form.prizeAmount) < 1) e.prizeAmount = 'Prize must be ≥ $1';
    if (!form.drawDate)                   e.drawDate    = 'Draw date is required';
    if (parseInt(form.maxTickets) < 1)    e.maxTickets  = 'Must be at least 1';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => { if (validate()) mutation.mutate(); };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.93, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.93, y: 12 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl my-8"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-1)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--border-1)' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--warning-dim)' }}
            >
              <Gift className="w-4 h-4" style={{ color: 'var(--warning)' }} />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>Create Lottery</p>
              <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>Ticket price fixed at $5 USDT</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="text-[11px] font-semibold mb-1.5 block" style={{ color: 'var(--text-2)' }}>
              Title <span style={{ color: 'var(--loss)' }}>*</span>
            </label>
            <input
              className="input-field w-full"
              placeholder="e.g. June 2025 Grand Draw"
              value={form.title}
              onChange={set('title')}
            />
            {errors.title && (
              <p className="text-[10px] mt-1" style={{ color: 'var(--loss)' }}>{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] font-semibold mb-1.5 block" style={{ color: 'var(--text-2)' }}>
              Description <span style={{ color: 'var(--text-3)' }}>(optional)</span>
            </label>
            <textarea
              className="input-field w-full resize-none"
              rows={2}
              placeholder="Brief description shown to users"
              value={form.description}
              onChange={set('description')}
            />
          </div>

          {/* Prize amount + asset */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold mb-1.5 block" style={{ color: 'var(--text-2)' }}>
                Prize Amount <span style={{ color: 'var(--loss)' }}>*</span>
              </label>
              <div className="relative">
                <span
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold"
                  style={{ color: 'var(--text-3)' }}
                >
                  $
                </span>
                <input
                  type="number"
                  className="input-field w-full pl-7"
                  placeholder="1000"
                  value={form.prizeAmount}
                  onChange={set('prizeAmount')}
                  min={1}
                />
              </div>
              {errors.prizeAmount && (
                <p className="text-[10px] mt-1" style={{ color: 'var(--loss)' }}>{errors.prizeAmount}</p>
              )}
            </div>
            <div>
              <label className="text-[11px] font-semibold mb-1.5 block" style={{ color: 'var(--text-2)' }}>
                Asset
              </label>
              <select
                className="input-field w-full"
                value={form.prizeAsset}
                onChange={set('prizeAsset')}
              >
                <option value="USDT">USDT</option>
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
              </select>
            </div>
          </div>

          {/* Draw date — quick picker */}
          <div>
            <label className="text-[11px] font-semibold mb-1.5 block" style={{ color: 'var(--text-2)' }}>
              Draw Date <span style={{ color: 'var(--loss)' }}>*</span>
              <span className="font-normal ml-1" style={{ color: 'var(--text-3)' }}>— must be 1st or 15th</span>
            </label>
            {/* Quick-select pills */}
            <div className="flex gap-2 flex-wrap mb-2">
              {options.map(o => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, drawDate: o.value }))}
                  className="px-3 py-1.5 rounded-xl text-[10px] font-semibold transition-all"
                  style={{
                    background: form.drawDate === o.value ? 'var(--warning)' : 'var(--bg-elevated)',
                    color:      form.drawDate === o.value ? '#0D0A00'        : 'var(--text-2)',
                    border:     `1px solid ${form.drawDate === o.value ? 'var(--warning)' : 'var(--border-1)'}`,
                  }}
                >
                  <Calendar className="w-3 h-3 inline mr-1" />
                  {o.label}
                </button>
              ))}
            </div>
            <input
              type="datetime-local"
              className="input-field w-full"
              value={form.drawDate}
              onChange={set('drawDate')}
            />
            {errors.drawDate && (
              <p className="text-[10px] mt-1" style={{ color: 'var(--loss)' }}>{errors.drawDate}</p>
            )}
          </div>

          {/* Max tickets */}
          <div>
            <label className="text-[11px] font-semibold mb-1.5 block" style={{ color: 'var(--text-2)' }}>
              Max Tickets
            </label>
            <input
              type="number"
              className="input-field w-full"
              placeholder="10000"
              value={form.maxTickets}
              onChange={set('maxTickets')}
              min={1}
            />
            {errors.maxTickets && (
              <p className="text-[10px] mt-1" style={{ color: 'var(--loss)' }}>{errors.maxTickets}</p>
            )}
          </div>

          {/* Ticket price note */}
          <div
            className="rounded-xl px-4 py-3 flex items-center gap-3"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-1)' }}
          >
            <Ticket className="w-4 h-4 shrink-0" style={{ color: 'var(--warning)' }} />
            <p className="text-xs" style={{ color: 'var(--text-2)' }}>
              Ticket price is fixed at{' '}
              <strong style={{ color: 'var(--text-1)' }}>$5 USDT</strong> platform-wide and cannot be changed.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex gap-3 px-6 py-4"
          style={{ borderTop: '1px solid var(--border-1)' }}
        >
          <button onClick={onClose} className="btn btn-ghost flex-1">Cancel</button>
          <button
            onClick={submit}
            disabled={mutation.isPending}
            className="btn flex-1"
            style={{
              background: 'linear-gradient(135deg, var(--warning), #F97316)',
              color: '#0D0A00',
            }}
          >
            {mutation.isPending ? (
              <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Creating…</>
            ) : (
              <><Plus className="w-4 h-4" /> Create Lottery</>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Detail Drawer — slide-in panel for a single lottery
───────────────────────────────────────────────────────────────────────── */
function DetailDrawer({
  lottery,
  onClose,
  onDraw,
  onCancel,
  drawLoading,
  cancelLoading,
}: {
  lottery:       ILottery;
  onClose:       () => void;
  onDraw:        (id: string) => void;
  onCancel:      (id: string) => void;
  drawLoading:   boolean;
  cancelLoading: boolean;
}) {
  const totalTickets = sumTickets(lottery.tickets);
  const revenue      = totalTickets * TICKET_PRICE;
  const uniqueUsers  = new Set(lottery.tickets.map(t =>
    typeof t.userId === 'string' ? t.userId : (t.userId as unknown as { _id: string })?._id,
  )).size;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex justify-end"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
        onClick={e => e.stopPropagation()}
        className="h-full w-full max-w-md overflow-y-auto"
        style={{ background: 'var(--bg-card)', borderLeft: '1px solid var(--border-1)' }}
      >
        {/* Drawer header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-5 py-4"
          style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-1)' }}
        >
          <div>
            <p className="text-sm font-bold truncate max-w-[240px]" style={{ color: 'var(--text-1)' }}>
              {lottery.title}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`badge pill text-[10px] ${STATUS_META[lottery.status]?.cls}`}>
                {STATUS_META[lottery.status]?.label}
              </span>
              <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>
                {fmtDate(lottery.drawDate)}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Stat grid */}
          <div className="grid grid-cols-2 gap-3">
            {([
              [DollarSign, 'Prize',         formatUSD(lottery.prizeAmount), 'var(--warning)'],
              [Ticket,     'Tickets Sold',  String(totalTickets),           'var(--brand)'],
              [Users,      'Participants',  String(uniqueUsers),            'var(--profit)'],
              [TrendingUp, 'Revenue',       formatUSD(revenue),             'var(--text-1)'],
            ] as [React.ElementType, string, string, string][]).map(([Icon, label, value, color]) => (
              <div
                key={label}
                className="rounded-xl p-3.5"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-1)' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                  <p className="text-[10px] font-medium" style={{ color: 'var(--text-3)' }}>{label}</p>
                </div>
                <p className="text-base font-black font-num" style={{ color: 'var(--text-1)' }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Progress bar — tickets sold vs max */}
          {lottery.maxTickets && (
            <div
              className="rounded-xl p-4"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-1)' }}
            >
              <div className="flex justify-between text-[11px] mb-2">
                <span style={{ color: 'var(--text-2)' }}>Tickets sold</span>
                <span className="font-semibold" style={{ color: 'var(--text-1)' }}>
                  {totalTickets} / {lottery.maxTickets}
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-1)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (totalTickets / lottery.maxTickets) * 100)}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, var(--brand), var(--warning))' }}
                />
              </div>
              <p className="text-[10px] mt-1.5" style={{ color: 'var(--text-3)' }}>
                {((totalTickets / lottery.maxTickets) * 100).toFixed(1)}% capacity · $5 per ticket
              </p>
            </div>
          )}

          {/* Draw details */}
          <div
            className="rounded-xl p-4 space-y-2.5"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-1)' }}
          >
            <p className="text-xs font-bold mb-3" style={{ color: 'var(--text-1)' }}>Draw Details</p>
            {([
              ['Draw Date',     fmtDate(lottery.drawDate)],
              ['Ticket Price',  '$5 USDT'],
              ['Max Tickets',   lottery.maxTickets?.toLocaleString() ?? '—'],
              ['Created By',
                typeof lottery.createdBy === 'object'
                  ? (lottery.createdBy as { fullName: string }).fullName
                  : lottery.createdBy],
              ['Created',       fmtDate(lottery.createdAt)],
            ] as [string, string][]).map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs">
                <span style={{ color: 'var(--text-3)' }}>{k}</span>
                <span className="font-semibold" style={{ color: 'var(--text-1)' }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Description */}
          {lottery.description && (
            <div
              className="rounded-xl p-4"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-1)' }}
            >
              <p className="text-[11px] font-semibold mb-1" style={{ color: 'var(--text-2)' }}>Description</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-3)' }}>{lottery.description}</p>
            </div>
          )}

          {/* Winner info (drawn) */}
          {lottery.status === 'drawn' && lottery.winnerInfo && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-4"
              style={{
                background: 'color-mix(in srgb, var(--warning) 8%, var(--bg-elevated))',
                border: '1px solid rgba(245,183,49,0.3)',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-4 h-4" style={{ color: 'var(--warning)' }} />
                <p className="text-xs font-bold" style={{ color: 'var(--text-1)' }}>Winner</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{lottery.winnerInfo.country}</span>
                <div>
                  <p className="text-sm font-black font-mono" style={{ color: 'var(--text-1)' }}>
                    {lottery.winnerInfo.maskedName}
                  </p>
                  {lottery.winner?.drawnAt && (
                    <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>
                      Drawn {fmtDate(lottery.winner.drawnAt)}
                    </p>
                  )}
                </div>
                <div className="ml-auto">
                  <p className="text-sm font-black font-num" style={{ color: 'var(--warning)' }}>
                    {formatUSD(lottery.prizeAmount)}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Actions */}
          {lottery.status === 'open' && (
            <div className="space-y-2">
              <button
                onClick={() => onDraw(lottery._id)}
                disabled={drawLoading || totalTickets === 0}
                className="btn w-full"
                style={{
                  background: totalTickets === 0
                    ? 'var(--bg-elevated)'
                    : 'linear-gradient(135deg, var(--warning), #F97316)',
                  color: totalTickets === 0 ? 'var(--text-3)' : '#0D0A00',
                  cursor: totalTickets === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                {drawLoading ? (
                  <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Drawing…</>
                ) : (
                  <><Play className="w-4 h-4" /> Draw Winner Now</>
                )}
              </button>
              {totalTickets === 0 && (
                <p className="text-center text-[10px]" style={{ color: 'var(--text-3)' }}>
                  No tickets sold yet — cannot draw
                </p>
              )}
              <button
                onClick={() => onCancel(lottery._id)}
                disabled={cancelLoading}
                className="btn btn-ghost w-full"
                style={{ color: 'var(--loss)', border: '1px solid rgba(240,80,75,0.25)' }}
              >
                {cancelLoading ? (
                  <><div className="w-3.5 h-3.5 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" /> Cancelling…</>
                ) : (
                  <><Ban className="w-4 h-4" /> Cancel Lottery</>
                )}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Main Admin Page
───────────────────────────────────────────────────────────────────────── */
export default function AdminLotteryPage() {
  const qc = useQueryClient();

  const [page,         setPage]        = useState(1);
  const [statusFilter, setFilter]      = useState<string>('all');
  const [showCreate,   setShowCreate]  = useState(false);
  const [selected,     setSelected]    = useState<ILottery | null>(null);
  const [confirm,      setConfirm]     = useState<{ type: 'draw' | 'cancel'; id: string } | null>(null);
  const [toast,        setToast]       = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => setToast({ msg, ok });

  /* ── Queries ── */
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-lotteries', page, statusFilter],
    queryFn: () =>
      lotteryApi.adminGetAll({ page, limit: 15, status: statusFilter === 'all' ? undefined : statusFilter }),
  });

  const lotteries: ILottery[] = data?.data?.data?.lotteries ?? [];
  const stats: IStats         = data?.data?.data?.stats     ?? {
    total: 0, open: 0, drawn: 0, cancelled: 0, totalTicketsSold: 0, totalRevenue: 0,
  };
  const pagination            = data?.data?.data?.pagination ?? { pages: 1, total: 0 };

  /* ── Draw winner mutation ── */
  const drawMutation = useMutation({
    mutationFn: (id: string) => lotteryApi.adminDraw(id),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['admin-lotteries'] });
      const winner = res.data?.data?.winner ?? 'drawn';
      showToast(`🎉 Winner drawn: ${winner}`);
      setConfirm(null);
      setSelected(null);
    },
    onError: (e: { response?: { data?: { message?: string } } }) => {
      showToast(e.response?.data?.message ?? 'Draw failed', false);
      setConfirm(null);
    },
  });

  /* ── Cancel mutation ── */
  const cancelMutation = useMutation({
    mutationFn: (id: string) => lotteryApi.adminUpdate(id, { status: 'cancelled' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-lotteries'] });
      showToast('Lottery cancelled');
      setConfirm(null);
      setSelected(null);
    },
    onError: (e: { response?: { data?: { message?: string } } }) => {
      showToast(e.response?.data?.message ?? 'Cancel failed', false);
      setConfirm(null);
    },
  });

  const handleDraw   = (id: string) => setConfirm({ type: 'draw',   id });
  const handleCancel = (id: string) => setConfirm({ type: 'cancel', id });

  const confirmAction = () => {
    if (!confirm) return;
    if (confirm.type === 'draw')   drawMutation.mutate(confirm.id);
    if (confirm.type === 'cancel') cancelMutation.mutate(confirm.id);
  };

  const FILTERS = ['all', 'open', 'upcoming', 'drawn', 'cancelled'] as const;

  /* ─────────────────────────────────────────────────────────────────────
     Render
  ───────────────────────────────────────────────────────────────────── */
  return (
    
      <div className="p-5 space-y-5 max-w-5xl mx-auto">

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <Toast msg={toast.msg} ok={toast.ok} onDone={() => setToast(null)} />
          )}
        </AnimatePresence>

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-base font-black flex items-center gap-2" style={{ color: 'var(--text-1)' }}>
              <Trophy className="w-5 h-5" style={{ color: 'var(--warning)' }} />
              Lottery Management
            </h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
              Create, monitor and draw lotteries · $5 per ticket · 1st &amp; 15th draws
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="btn btn-ghost btn-sm"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="btn btn-sm"
              style={{
                background: 'linear-gradient(135deg, var(--warning), #F97316)',
                color: '#0D0A00',
              }}
            >
              <Plus className="w-4 h-4" /> New Lottery
            </button>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {([
            ['Total',        String(stats.total),                     'var(--text-1)',  Hash],
            ['Open',         String(stats.open),                      'var(--brand)',   Gift],
            ['Drawn',        String(stats.drawn),                     'var(--profit)',  Trophy],
            ['Cancelled',    String(stats.cancelled),                 'var(--loss)',    Ban],
            ['Tickets Sold', stats.totalTicketsSold.toLocaleString(), 'var(--warning)', Ticket],
            ['Revenue',      formatUSD(stats.totalRevenue),           'var(--warning)', DollarSign],
          ] as [string, string, string, React.ElementType][]).map(([label, value, color, Icon]) => (
            <div
              key={label}
              className="rounded-xl p-3 text-center"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-1)' }}
            >
              <Icon className="w-4 h-4 mx-auto mb-1.5" style={{ color }} />
              <p className="text-[10px] font-medium mb-0.5" style={{ color: 'var(--text-3)' }}>{label}</p>
              <p className="text-sm font-black font-num" style={{ color: 'var(--text-1)' }}>{value}</p>
            </div>
          ))}
        </div>

        {/* ── Filter tabs ── */}
        <div className="flex items-center gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all"
              style={{
                background: statusFilter === f ? 'var(--brand)'       : 'var(--bg-elevated)',
                color:      statusFilter === f ? 'white'              : 'var(--text-2)',
                border:     `1px solid ${statusFilter === f ? 'var(--brand)' : 'var(--border-1)'}`,
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* ── Table ── */}
        <div className="card overflow-hidden">
          {/* Column headers */}
          <div
            className="grid px-5 py-2.5 text-[10px] font-semibold"
            style={{
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 80px',
              color: 'var(--text-3)',
              borderBottom: '1px solid var(--border-1)',
            }}
          >
            <span>Lottery</span>
            <span>Prize</span>
            <span>Sold / Max</span>
            <span>Revenue</span>
            <span>Draw Date</span>
            <span>Actions</span>
          </div>

          {/* Rows */}
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 skeleton mx-5 my-2 rounded-xl" />
            ))
          ) : lotteries.length === 0 ? (
            <div className="py-16 text-center">
              <Gift className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: 'var(--warning)' }} />
              <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-1)' }}>No lotteries found</p>
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                {statusFilter !== 'all' ? `No ${statusFilter} lotteries` : 'Create your first lottery'}
              </p>
            </div>
          ) : (
            lotteries.map((l, i) => {
              const sold    = sumTickets(l.tickets);
              const revenue = sold * TICKET_PRICE;
              const pct     = l.maxTickets ? Math.min(100, (sold / l.maxTickets) * 100) : 0;

              return (
                <motion.div
                  key={l._id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="grid items-center px-5 py-3.5 trow tdiv"
                  style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 80px' }}
                >
                  {/* Title + status */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-1)' }}>
                        {l.title}
                      </p>
                      <span className={`badge pill text-[10px] shrink-0 ${STATUS_META[l.status]?.cls}`}>
                        {STATUS_META[l.status]?.label}
                      </span>
                    </div>
                    {l.description && (
                      <p className="text-[10px] truncate" style={{ color: 'var(--text-3)' }}>
                        {l.description}
                      </p>
                    )}
                  </div>

                  {/* Prize */}
                  <p className="text-xs font-black font-num" style={{ color: 'var(--warning)' }}>
                    {formatUSD(l.prizeAmount)}
                  </p>

                  {/* Tickets progress */}
                  <div>
                    <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-1)' }}>
                      {sold.toLocaleString()} / {l.maxTickets?.toLocaleString() ?? '∞'}
                    </p>
                    {l.maxTickets && (
                      <div
                        className="h-1.5 rounded-full overflow-hidden w-24"
                        style={{ background: 'var(--border-1)' }}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            background: pct > 90 ? 'var(--loss)' : pct > 60 ? 'var(--warning)' : 'var(--brand)',
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Revenue */}
                  <p className="text-xs font-semibold font-num" style={{ color: 'var(--text-2)' }}>
                    {formatUSD(revenue)}
                  </p>

                  {/* Draw date */}
                  <p className="text-[11px]" style={{ color: 'var(--text-3)' }}>
                    {fmtDate(l.drawDate)}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelected(l)}
                      className="btn btn-ghost btn-xs"
                      title="View details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {l.status === 'open' && (
                      <>
                        <button
                          onClick={() => handleDraw(l._id)}
                          className="btn btn-xs"
                          title="Draw winner"
                          style={{ background: 'var(--warning-dim)', color: 'var(--warning)' }}
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleCancel(l._id)}
                          className="btn btn-ghost btn-xs"
                          title="Cancel lottery"
                          style={{ color: 'var(--loss)' }}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* ── Pagination ── */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs" style={{ color: 'var(--text-3)' }}>
              Page {page} of {pagination.pages} · {pagination.total} lotteries
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-ghost btn-sm disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const p = page <= 3 ? i + 1 : page + i - 2;
                  if (p < 1 || p > pagination.pages) return null;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className="w-8 h-8 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: p === page ? 'var(--brand)' : 'var(--bg-elevated)',
                        color:      p === page ? 'white'        : 'var(--text-2)',
                        border:     '1px solid var(--border-1)',
                      }}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="btn btn-ghost btn-sm disabled:opacity-40"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ── Modals & Drawers ── */}
        <AnimatePresence>
          {showCreate && (
            <CreateModal
              onClose={() => setShowCreate(false)}
              onSuccess={showToast}
            />
          )}

          {selected && (
            <DetailDrawer
              lottery={selected}
              onClose={() => setSelected(null)}
              onDraw={handleDraw}
              onCancel={handleCancel}
              drawLoading={drawMutation.isPending}
              cancelLoading={cancelMutation.isPending}
            />
          )}

          {confirm && (
            <ConfirmDialog
              title={confirm.type === 'draw' ? 'Draw Winner?' : 'Cancel Lottery?'}
              message={
                confirm.type === 'draw'
                  ? 'This will randomly select a winner from all purchased tickets, credit their wallet, and close the lottery. This cannot be undone.'
                  : 'This will permanently cancel the lottery. Ticket holders will NOT be automatically refunded — handle refunds manually if needed.'
              }
              confirmLabel={confirm.type === 'draw' ? '🎲 Draw Winner' : 'Cancel Lottery'}
              danger={confirm.type === 'cancel'}
              onConfirm={confirmAction}
              onCancel={() => setConfirm(null)}
              loading={drawMutation.isPending || cancelMutation.isPending}
            />
          )}
        </AnimatePresence>

      </div>
    
  );
}