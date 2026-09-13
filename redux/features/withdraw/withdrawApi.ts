import { apiSlice } from "../api/apiSlice";

export type WithdrawSettings = {
  key?: string;
  feePercent: number;
  minAmount: number;
  maxAmount: number;
  quickAmounts: number[];
  dailyLimitCount: number;
  networks: string[];
};

export const withdrawApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /* ────────── withdraw settings (fee/min/max/quick amounts/limit) ────────── */
    getAdminWithdrawSettings: builder.query<
      { success: boolean; settings: WithdrawSettings },
      void
    >({
      query: () => `/admin/withdraw/settings`,
      providesTags: ["WithdrawSettings"],
    }),

    updateAdminWithdrawSettings: builder.mutation<
      { success: boolean; message: string; settings: WithdrawSettings },
      Partial<WithdrawSettings>
    >({
      query: (body) => ({
        url: `/admin/withdraw/settings`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["WithdrawSettings"],
    }),

    // create new withdraw request
    createWithdrawRequest: builder.mutation<any, any>({
      query: (body) => ({
        url: `/new/withdraw`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["User", "Withdraws"],
    }),

    // get  my withdraw requests
    getMyWithdrawRequests: builder.query<any, any>({
      query: () => `/my-withdraws`,
      providesTags: ["Withdraws"],
    }),

    // get all withdraw requests
    getAllWithdrawRequests: builder.query<any, any>({
      query: () => `/get-all-withdraws-for-admin`,
      providesTags: ["Withdraws"],
    }),

    // get single withdraw request
    getSingleWithdrawRequest: builder.query<any, any>({
      query: (id) => `/get-withdraw-by-id/${id}`,
      providesTags: ["Withdraws"],
    }),

    // approve withdraw request
    approveWithdraw: builder.mutation<any, any>({
      query: (body) => ({
        url: `/withdraw/approve`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Withdraws"],
    }),

    // reject withdraw request
    rejectWithdraw: builder.mutation<any, any>({
      query: (body) => ({
        url: `/admin/withdraw/reject`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Withdraws"],
    }),

    // get all pending withdraw requests
    getPendingWithdraws: builder.query<any, any>({
      query: () => `/admin/pending-withdraws`,
      providesTags: ["Withdraws"],
    }),

    // admin approve withdraw request
    adminApproveWithdraw: builder.mutation<any, any>({
      query: (body) => ({
        url: `/admin/withdraw/approve`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Withdraws"],
    }),
  }),
});

export const {
  useCreateWithdrawRequestMutation,
  useGetMyWithdrawRequestsQuery,
  useGetAllWithdrawRequestsQuery,
  useGetSingleWithdrawRequestQuery,
  useApproveWithdrawMutation,
  useRejectWithdrawMutation,
  useGetPendingWithdrawsQuery,
  useAdminApproveWithdrawMutation,
  useGetAdminWithdrawSettingsQuery,
  useUpdateAdminWithdrawSettingsMutation,
} = withdrawApi;
