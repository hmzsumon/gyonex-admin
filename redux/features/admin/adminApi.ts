import { apiSlice } from "../api/apiSlice";

export interface IUser {
  user: any;
  token: string;
  success: boolean;
  data: {
    _id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
}

/* ────────── admin dashboard summary shape (real, live data) ────────── */
export type AdminRecentUser = {
  _id: string;
  name: string;
  customerId: string;
  email: string;
  m_balance: number;
  createdAt: string;
};

export type AdminRecentTransaction = {
  _id: string;
  user: string;
  customerId: string;
  amount: number;
  transactionType: "cashIn" | "cashOut";
  purpose: string;
  description?: string;
  createdAt: string;
};

export type AdminDashboardData = {
  totalUsers: number;
  todayNewUsers: number;
  totalActiveUsers: number;
  todayActiveUsers: number;
  kycVerifiedUsers: number;
  kycPending: number;

  totalDeposits: number;
  todayDeposits: number;
  depositPending: number;

  totalWithdraw: number;
  todayWithdraw: number;
  totalNetWithdraw: number;
  totalWithdrawFee: number;
  withdrawPendingCount: number;
  withdrawPendingAmount: number;

  totalIncome: number;
  totalCost: number;
  netProfit: number;

  totalLiveTradeBalance: number;
  totalAiTradeBalance: number;
  totalAiTradeCommission: number;
  totalAiTradeProfit: number;
  todayAiTradeProfit: number;

  luckyCardsIssued: number;
  luckyCardStaked: number;
  luckyCardPaidOut: number;

  stakingSystemCutTotal: number;

  recentUsers: AdminRecentUser[];
  recentTransactions: AdminRecentTransaction[];
};

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // get users from api with typescript
    getUsers: builder.query<any, void>({
      query: () => "/admin/users",
      providesTags: ["Users"],
    }),

    /* ────────── Admin Login Mutations ────────── */
    loginAdmin: builder.mutation<IUser, any>({
      query: (body) => ({
        url: "/admin/login",
        method: "POST",
        body,
      }),
    }),
    /* ────────── Get admin dashboard data ────────── */
    getAdminDashboard: builder.query<
      { success: boolean; dashboardData: AdminDashboardData },
      void
    >({
      query: () => "/admin/dashboard-summary",
    }),

    /* ────────── End Admin Login Mutations ────────── */
  }),
});

export const {
  useGetUsersQuery,
  useLoginAdminMutation,
  useGetAdminDashboardQuery,
} = adminApi;
