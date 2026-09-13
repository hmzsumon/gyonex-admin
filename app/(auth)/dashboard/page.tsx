"use client";

/* ────────── admin smart dashboard — real, live data end to end ────────── */
import ActionCenter from "@/components/admin/dashboard/ActionCenter";
import FeatureSnapshots from "@/components/admin/dashboard/FeatureSnapshots";
import RecentUsersList from "@/components/admin/dashboard/RecentUsersList";
import CommissionBarChart from "@/components/admin/CommissionBarChart";
import LatestTransactionsTable, { Txn } from "@/components/admin/LatestTransactionsTable";
import MetricCard from "@/components/admin/MetricCard";
import { formatCurrency, formatNumber } from "@/lib/format";
import { useGetAdminDashboardQuery } from "@/redux/features/admin/adminApi";
import { useGetAdminLoansQuery } from "@/redux/features/loan/adminLoanApi";
import { useGetAdminLotteriesQuery } from "@/redux/features/lottery/lotteryApi";
import { useGetAdminLuckyStatsQuery } from "@/redux/features/lucky-card/luckyCardApi";
import {
  ArrowDownToLine,
  Banknote,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { data, isLoading } = useGetAdminDashboardQuery(undefined, {
    pollingInterval: 30000,
  });
  const d = data?.dashboardData;

  const { data: luckyStats } = useGetAdminLuckyStatsQuery();
  const { data: lotteryData } = useGetAdminLotteriesQuery({});
  const { data: loanData } = useGetAdminLoansQuery({ limit: 1 });

  const txns: Txn[] = (d?.recentTransactions ?? []).map((t) => ({
    id: t._id,
    name: t.user || t.customerId || "Unknown",
    amount: t.transactionType === "cashIn" ? t.amount : -t.amount,
    date: t.createdAt,
  }));

  const financialBars = [
    { month: "Deposits", value: Math.round(d?.totalDeposits || 0) },
    { month: "Withdrawals", value: Math.round(d?.totalWithdraw || 0) },
    { month: "Income", value: Math.round(d?.totalIncome || 0) },
    { month: "Cost", value: Math.round(d?.totalCost || 0) },
  ];

  return (
    <main className="min-h-screen bg-[#0B0D12] text-white">
      <div className="mx-auto w-full max-w-7xl space-y-6 p-6 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <p className="mt-1 text-sm text-white/45">
              Live overview of users, money flow and every feature — at a glance.
            </p>
          </div>
          {isLoading && (
            <span className="text-xs text-white/40">Refreshing…</span>
          )}
        </div>

        {/* ────────── needs-attention action center ────────── */}
        <ActionCenter
          kycPending={d?.kycPending ?? 0}
          withdrawPendingCount={d?.withdrawPendingCount ?? 0}
          withdrawPendingAmount={d?.withdrawPendingAmount ?? 0}
          depositPending={d?.depositPending ?? 0}
        />

        {/* ────────── top metrics ────────── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Users"
            value={formatNumber(d?.totalUsers || 0)}
            subtitle={d?.todayNewUsers ? `+${d.todayNewUsers} today` : undefined}
            accent={<Users className="h-5 w-5 text-white/50" />}
          />
          <MetricCard
            title="Total Deposits"
            value={formatCurrency(d?.totalDeposits || 0)}
            subtitle={d?.todayDeposits ? `+${formatCurrency(d.todayDeposits)} today` : undefined}
            accent={<Banknote className="h-5 w-5 text-white/50" />}
          />
          <MetricCard
            title="Total Withdrawal (net)"
            value={formatCurrency(d?.totalNetWithdraw || 0)}
            accent={<ArrowDownToLine className="h-5 w-5 text-white/50" />}
          />
          <MetricCard
            title="Net Profit"
            value={formatCurrency(d?.netProfit || 0)}
            accent={
              (d?.netProfit ?? 0) >= 0 ? (
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              ) : (
                <TrendingDown className="h-5 w-5 text-rose-400" />
              )
            }
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="KYC Verified Users"
            value={formatNumber(d?.kycVerifiedUsers || 0)}
            accent={<ShieldCheck className="h-5 w-5 text-sky-300" />}
          />
          <MetricCard
            title="Active Users"
            value={formatNumber(d?.totalActiveUsers || 0)}
            accent={<Users className="h-5 w-5 text-white/50" />}
          />
          <MetricCard
            title="AI Trade Profit"
            value={formatCurrency(d?.totalAiTradeProfit || 0)}
            subtitle={d?.todayAiTradeProfit ? `+${formatCurrency(d.todayAiTradeProfit)} today` : undefined}
            accent={<TrendingUp className="h-5 w-5 text-emerald-400" />}
          />
          <MetricCard
            title="AI Trade Commission"
            value={formatCurrency(d?.totalAiTradeCommission || 0)}
            accent={<TrendingUp className="h-5 w-5 text-emerald-400" />}
          />
        </div>

        {/* ────────── per-feature snapshots ────────── */}
        <FeatureSnapshots
          lucky={{
            staked: luckyStats?.summary.totalStaked ?? d?.luckyCardStaked ?? 0,
            paidOut: luckyStats?.summary.totalPaidOut ?? d?.luckyCardPaidOut ?? 0,
            cardsIssued: d?.luckyCardsIssued ?? 0,
            liveRtp: luckyStats?.summary.liveRtp ?? 0,
          }}
          lottery={{
            total: lotteryData?.data?.stats?.total ?? 0,
            open: lotteryData?.data?.stats?.open ?? 0,
            totalTicketsSold: lotteryData?.data?.stats?.totalTicketsSold ?? 0,
            totalRevenue: lotteryData?.data?.stats?.totalRevenue ?? 0,
          }}
          loans={{
            pending: loanData?.data?.stats?.pending ?? 0,
            active: loanData?.data?.stats?.active ?? 0,
            total: loanData?.data?.stats?.total ?? 0,
            totalAmountPending: loanData?.data?.stats?.totalAmountPending ?? 0,
          }}
        />

        {/* ────────── financial overview + recent activity ────────── */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <LatestTransactionsTable rows={txns} />
          </div>
          <div>
            <RecentUsersList users={d?.recentUsers ?? []} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CommissionBarChart data={financialBars} />
          </div>
          <div className="rounded-2xl border border-white/5 bg-[#0E1014] p-5">
            <p className="mb-3 text-sm text-white/60">Other totals</p>
            <div className="space-y-2.5 text-sm">
              <Row label="Live trade balance" value={formatCurrency(d?.totalLiveTradeBalance || 0)} />
              <Row label="AI trade balance" value={formatCurrency(d?.totalAiTradeBalance || 0)} />
              <Row label="Staking system cut" value={formatCurrency(d?.stakingSystemCutTotal || 0)} />
              <Row label="Withdrawal fees collected" value={formatCurrency(d?.totalWithdrawFee || 0)} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/45">{label}</span>
      <span className="font-bold text-white/85">{value}</span>
    </div>
  );
}
