import { apiSlice } from "../api/apiSlice";

/* ─────────────────────────────────────────────────────────────
   Admin loan API types
   RTK Query দিয়ে admin loan list/review handle হবে।
────────────────────────────────────────────────────────────── */
export type AdminLoanStatus =
  | "pending"
  | "active"
  | "completed"
  | "rejected"
  | "defaulted";

export type AdminLoanUser = {
  _id?: string;
  fullName?: string;
  name?: string;
  email?: string;
  phone?: string;
  kycStatus?: string;
  kyc_verified?: boolean;
};

export type AdminLoan = {
  _id: string;
  userId?: AdminLoanUser | string;
  loanType: string;
  requestedAmount: number;
  approvedAmount?: number;
  disbursedAmount?: number;
  interestRate?: number;
  repaymentPeriodDays: number;
  monthlyInstallment?: number;
  totalRepayable?: number;
  totalPaid?: number;
  status: AdminLoanStatus | string;
  purpose?: string;
  applicantName?: string;
  applicantEmail?: string;
  nidNumber?: string;
  nidPhotoUrl?: string;
  selfieUrl?: string;
  adminNote?: string;
  approvedAt?: string;
  rejectedAt?: string;
  disbursedAt?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt?: string;
};

export type AdminLoanStats = {
  pending?: number;
  active?: number;
  completed?: number;
  rejected?: number;
  defaulted?: number;
  total?: number;
  totalAmountPending?: number;
};

type AdminLoanListResponse = {
  success: boolean;
  data: {
    loans: AdminLoan[];
    total?: number;
    page?: number;
    stats?: AdminLoanStats;
  };
};

type GetAdminLoansArgs = {
  status?: AdminLoanStatus;
  page?: number;
  limit?: number;
};

type ApproveLoanArgs = {
  loanId: string;
  approvedAmount: number;
  adminNote?: string;
};

type RejectLoanArgs = {
  loanId: string;
  reason: string;
};

/* ─────────────────────────────────────────────────────────────
   Admin loan endpoints
   @tanstack/react-query ব্যবহার করা হবে না।
────────────────────────────────────────────────────────────── */
export const adminLoanApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /* ────────── Get admin loans ────────── */
    getAdminLoans: builder.query<
      AdminLoanListResponse,
      GetAdminLoansArgs | void
    >({
      query: (args) => {
        const params = new URLSearchParams();

        if (args?.status) params.set("status", args.status);
        if (args?.page) params.set("page", String(args.page));
        if (args?.limit) params.set("limit", String(args.limit));

        const qs = params.toString();

        return {
          url: `/loans/admin/all${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
      providesTags: ["Loans"],
    }),

    /* ────────── Approve loan ────────── */
    approveAdminLoan: builder.mutation<any, ApproveLoanArgs>({
      query: ({ loanId, approvedAmount, adminNote }) => ({
        url: `/loans/admin/${loanId}/approve`,
        method: "PATCH",
        body: { approvedAmount, adminNote },
      }),
      invalidatesTags: ["Loans"],
    }),

    /* ────────── Reject loan ────────── */
    rejectAdminLoan: builder.mutation<any, RejectLoanArgs>({
      query: ({ loanId, reason }) => ({
        url: `/loans/admin/${loanId}/reject`,
        method: "PATCH",
        body: { reason },
      }),
      invalidatesTags: ["Loans"],
    }),
  }),
});

export const {
  useGetAdminLoansQuery,
  useApproveAdminLoanMutation,
  useRejectAdminLoanMutation,
} = adminLoanApi;
