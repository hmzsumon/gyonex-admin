'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ranksApi } from '@/services/api';
import { formatUSD, formatDate } from '@/lib/utilsnew';
import { Trophy, Users, Star, Upload } from 'lucide-react';

export default function AdminRanksPage() {
  const [tab, setTab] = useState<'leaderboard'|'claims'>('leaderboard');
  const { data: lbData } = useQuery({ queryKey: ['admin-leaderboard'], queryFn: ranksApi.getLeaderboard });
  const lb = lbData?.data?.data?.slice(0, 20) || [];
  const RANK_NAMES = ['','Ambassador','Regional Dir','National Dir','Continental Dir','Global Director','Freedom Icon','Infinity Legend'];
  const RANK_COLORS = ['','#94A3B8','#22C55E','#8B5CF6','#F59E0B','#F97316','#EC4899','#6366F1'];

  return (
   
      <div className="p-5 space-y-4 max-w-5xl mx-auto">
        <h1 className="text-base font-black flex items-center gap-2" style={{ color: '#ECF0F8' }}><Trophy className="w-5 h-5" style={{ color: '#F5B731' }} />Rank Management</h1>
        <div className="flex" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          {(['leaderboard', 'claims'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-5 py-2.5 text-xs font-semibold capitalize border-b-2 -mb-px transition-colors ${tab === t ? 'border-yellow-500 text-yellow-400' : 'border-transparent text-gray-500'}`}>{t}</button>
          ))}
        </div>
        {tab === 'leaderboard' && (
          <div className="card overflow-hidden">
            <div className="grid gap-3 px-5 py-3 text-[10px] font-semibold" style={{ gridTemplateColumns: '0.5fr 2fr 1fr 1fr 1fr', color: '#5A6478', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <span>#</span><span>User</span><span>Rank</span><span>Team</span><span>Salary</span>
            </div>
            {lb.length === 0 ? <div className="py-10 text-center text-xs" style={{ color: '#5A6478' }}>No leaderboard data</div> :
             lb.map((u: { userId: { fullName: string; email: string }; currentRank: number; teamSize: number; monthlySalary: number }, i: number) => (
              <div key={i} className="grid gap-3 items-center px-5 py-3.5 trow tdiv" style={{ gridTemplateColumns: '0.5fr 2fr 1fr 1fr 1fr' }}>
                <span className="text-sm font-black font-num" style={{ color: i < 3 ? ['#FFD700','#C0C0C0','#CD7F32'][i] : '#5A6478' }}>#{i + 1}</span>
                <div><p className="text-xs font-semibold" style={{ color: '#ECF0F8' }}>{u.userId?.fullName}</p><p className="text-[10px]" style={{ color: '#5A6478' }}>{u.userId?.email}</p></div>
                <span className="badge text-[10px]" style={{ background: `${RANK_COLORS[u.currentRank] || '#8B95A8'}15`, color: RANK_COLORS[u.currentRank] || '#8B95A8' }}>{RANK_NAMES[u.currentRank] || 'Unranked'}</span>
                <span className="text-xs font-num" style={{ color: '#8B95A8' }}>{u.teamSize || 0}</span>
                <span className="text-xs font-num" style={{ color: '#10D980' }}>{formatUSD(u.monthlySalary || 0)}</span>
              </div>
            ))}
          </div>
        )}
        {tab === 'claims' && (
          <div className="card p-8 text-center">
            <Upload className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color: '#3B82F6' }} />
            <p className="text-xs font-semibold" style={{ color: '#ECF0F8' }}>Rank Certificate Upload</p>
            <p className="text-[10px] mt-1" style={{ color: '#5A6478' }}>Upload rank certificates for qualified users</p>
            <button className="btn-primary mt-4 text-xs"><Upload className="w-3.5 h-3.5" />Upload Certificate</button>
          </div>
        )}
      </div>
    
  );
}
