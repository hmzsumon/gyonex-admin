'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { loansApi } from '@/services/api';
import { formatUSD, formatDate } from '@/lib/utilsnew';
import { CreditCard, CheckCircle, XCircle, Eye, DollarSign, AlertTriangle, X } from 'lucide-react';

const LOAN_ICONS: Record<string, string> = { trading:'T', house:'H', business:'B', study:'S', land:'L', emergency:'E', other:'O' };
const LOAN_LABELS: Record<string, string> = { trading:'Trading Loan', house:'Home Loan', business:'Business Loan', study:'Student Loan', land:'Land Loan', emergency:'Emergency' };

export default function AdminLoansPage() {
  const qc = useQueryClient();
  const [tab, setTab]         = useState<'pending'|'active'|'completed'|'rejected'>('pending');
  const [detail, setDetail]   = useState<string | null>(null);
  const [approveId, setAppId] = useState<string | null>(null);
  const [rejectId, setRjId]   = useState<string | null>(null);
  const [approvedAmt, setAmt] = useState('');
  const [adminNote, setNote]  = useState('');
  const [reason, setReason]   = useState('');
  const [toast, setToast]     = useState<{ msg: string; ok: boolean } | null>(null);
  const show = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); };

  const { data, isLoading } = useQuery({ queryKey: ['admin-loans', tab], queryFn: () => loansApi.getAll({ status: tab, limit: 50 }), refetchInterval: 20000 });
  const items = data?.data?.data?.loans || [];
  const stats = data?.data?.data?.stats || {};
  const detailItem = items.find((l: { _id: string }) => l._id === detail);

  const approveMutation = useMutation({ mutationFn: () => loansApi.approve(approveId!, { approvedAmount: parseFloat(approvedAmt), adminNote }), onSuccess: () => { show('Loan approved & disbursed!'); setAppId(null); setAmt(''); setNote(''); qc.invalidateQueries({ queryKey: ['admin-loans'] }); }, onError: (e: { response?: { data?: { message?: string } } }) => show(e.response?.data?.message || 'Failed', false) });
  const rejectMutation  = useMutation({ mutationFn: () => loansApi.reject(rejectId!, reason), onSuccess: () => { show('Loan rejected'); setRjId(null); setReason(''); qc.invalidateQueries({ queryKey: ['admin-loans'] }); } });

  return (
   
      <div className="p-5 space-y-4 max-w-6xl mx-auto">
        <AnimatePresence>{toast && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed top-14 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xl" style={{ background: '#0D1320', border: `1px solid ${toast.ok ? 'rgba(16,217,128,0.4)' : 'rgba(240,75,85,0.4)'}`, color: toast.ok ? '#10D980' : '#F04B55' }}>{toast.ok ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}{toast.msg}</motion.div>}</AnimatePresence>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-base font-black flex items-center gap-2" style={{ color: '#ECF0F8' }}><CreditCard className="w-5 h-5" style={{ color: '#3B82F6' }} />Loan Management</h1>
          <div className="flex gap-3 text-xs">
            {[['Pending', stats.pending || 0, '#F5B731'], ['Active', stats.active || 0, '#3B82F6'], ['Total', stats.total || 0, '#8B95A8']].map(([l, v, c]) => (
              <div key={l as string} className="text-center"><p className="text-lg font-black font-num" style={{ color: c as string }}>{v as number}</p><p style={{ color: '#5A6478' }}>{l as string}</p></div>
            ))}
          </div>
        </div>

        <div className="flex" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          {(['pending', 'active', 'completed', 'rejected'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-xs font-semibold capitalize border-b-2 -mb-px transition-colors ${tab === t ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-500'}`}>{t}</button>
          ))}
        </div>

        <div className="card overflow-hidden">
          <div className="grid gap-2 px-5 py-3 text-[10px] font-semibold" style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr auto', color: '#5A6478', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <span>Applicant</span><span>Type</span><span>Amount</span><span>Status</span><span>Date</span><span>Actions</span>
          </div>
          {isLoading ? [...Array(5)].map((_, i) => <div key={i} className="h-12 skeleton mx-4 my-2 rounded-xl" />) :
           items.length === 0 ? <div className="py-10 text-center text-xs" style={{ color: '#5A6478' }}>No {tab} loans</div> :
           items.map((l: { _id: string; applicantName: string; applicantEmail: string; loanType: string; requestedAmount: number; approvedAmount?: number; status: string; createdAt: string }) => (
            <div key={l._id} className="grid gap-2 items-center px-5 py-3.5 trow tdiv" style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr auto' }}>
              <div><p className="text-xs font-semibold" style={{ color: '#ECF0F8' }}>{l.applicantName}</p><p className="text-[10px]" style={{ color: '#5A6478' }}>{l.applicantEmail}</p></div>
              <div className="flex items-center gap-1.5"><span>{LOAN_ICONS[l.loanType] || ''}</span><span className="text-[10px]" style={{ color: '#8B95A8' }}>{LOAN_LABELS[l.loanType] || l.loanType}</span></div>
              <div><p className="text-xs font-num font-semibold" style={{ color: '#ECF0F8' }}>{formatUSD(l.requestedAmount)}</p>{l.approvedAmount && <p className="text-[10px] font-num" style={{ color: '#10D980' }}>{formatUSD(l.approvedAmount)}</p>}</div>
              <span className={`badge text-[10px] ${l.status === 'active' ? 'badge-blue' : l.status === 'pending' ? 'badge-yellow' : l.status === 'completed' ? 'badge-green' : 'badge-red'}`}>{l.status}</span>
              <p className="text-[10px]" style={{ color: '#5A6478' }}>{formatDate(l.createdAt)}</p>
              <div className="flex gap-1">
                <button onClick={() => setDetail(l._id === detail ? null : l._id)} className="p-1.5 rounded-lg hover:bg-white/5" style={{ color: '#3B82F6' }}><Eye className="w-3.5 h-3.5" /></button>
                {l.status === 'pending' && <>
                  <button onClick={() => { setAppId(l._id); setAmt(String(l.requestedAmount)); }} className="p-1.5 rounded-lg hover:bg-green-500/10" style={{ color: '#10D980' }}><CheckCircle className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setRjId(l._id)} className="p-1.5 rounded-lg hover:bg-red-500/10" style={{ color: '#F04B55' }}><XCircle className="w-3.5 h-3.5" /></button>
                </>}
              </div>
            </div>
          ))}
        </div>

        {/* Approve modal */}
        <AnimatePresence>
          {approveId && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={e => e.target === e.currentTarget && setAppId(null)}>
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-sm rounded-2xl p-5 space-y-4" style={{ background: '#0D1320', border: '1px solid rgba(16,217,128,0.3)' }}>
                <div className="flex items-center justify-between"><h3 className="text-sm font-bold" style={{ color: '#ECF0F8' }}>Approve Loan</h3><button onClick={() => setAppId(null)} style={{ color: '#5A6478' }}><X className="w-4 h-4" /></button></div>
                <div>
                  <label className="text-[11px] font-semibold mb-1.5 block" style={{ color: '#8B95A8' }}>Approved Amount (USDT)</label>
                  <input type="number" value={approvedAmt} onChange={e => setAmt(e.target.value)} min={1} className="input py-2.5 px-3 text-sm" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold mb-1.5 block" style={{ color: '#8B95A8' }}>Admin Note (optional)</label>
                  <input value={adminNote} onChange={e => setNote(e.target.value)} placeholder="Internal note..." className="input py-2.5 px-3 text-sm" />
                </div>
                <div className="p-3 rounded-xl text-xs" style={{ background: 'rgba(245,183,49,0.06)', border: '1px solid rgba(245,183,49,0.15)' }}>
                  <p style={{ color: '#F5B731' }}>Warning: This will immediately credit ${approvedAmt || '0'} to the user's wallet.</p>
                </div>
                <div className="flex gap-2"><button onClick={() => setAppId(null)} className="btn-ghost flex-1 py-2.5">Cancel</button><button onClick={() => approveMutation.mutate()} disabled={approveMutation.isPending || !approvedAmt} className="btn-primary flex-1 py-2.5 disabled:opacity-40"><CheckCircle className="w-3.5 h-3.5" />Approve & Disburse</button></div>
              </motion.div>
            </motion.div>
          )}
          {rejectId && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={e => e.target === e.currentTarget && setRjId(null)}>
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-sm rounded-2xl p-5 space-y-4" style={{ background: '#0D1320', border: '1px solid rgba(240,75,85,0.3)' }}>
                <div className="flex items-center justify-between"><h3 className="text-sm font-bold" style={{ color: '#ECF0F8' }}>Reject Loan</h3><button onClick={() => setRjId(null)} style={{ color: '#5A6478' }}><X className="w-4 h-4" /></button></div>
                <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Rejection reason..." rows={3} className="input py-2.5 px-3 text-sm w-full resize-none" />
                <div className="flex gap-2"><button onClick={() => setRjId(null)} className="btn-ghost flex-1 py-2.5">Cancel</button><button onClick={() => rejectMutation.mutate()} disabled={!reason} className="btn-danger flex-1 py-2.5 disabled:opacity-40">Reject</button></div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
   
  );
}
