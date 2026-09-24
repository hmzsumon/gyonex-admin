import { apiSlice } from "../api/apiSlice";

export type StakingSettings = {
  stakingEnabled: boolean;
  profitEnabled: boolean;
  cancellationFeePercent: number;
  profitDays: number[];
  timezone?: string;
};
export type StakingPlan = {
  _id?: string;
  termDays: number;
  dailyProfitPercent: number;
  userSharePercent: number;
  minAmount: number;
  isActive: boolean;
};
const stakingApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminStakingSettings: builder.query<{ settings: StakingSettings }, void>({
      query: () => "/admin/staking/settings",
      providesTags: ["StakingSettings"],
    }),
    updateAdminStakingSettings: builder.mutation<{ settings: StakingSettings }, StakingSettings>({
      query: (body) => ({ url: "/admin/staking/settings", method: "PUT", body }),
      invalidatesTags: ["StakingSettings"],
    }),
    getAdminStakingPlans: builder.query<{ items: StakingPlan[] }, void>({
      query: () => "/admin/staking/plans",
      providesTags: ["StakingPlans"],
    }),
    saveAdminStakingPlan: builder.mutation<unknown, StakingPlan>({
      query: (body) => ({ url: "/admin/staking/plan", method: "POST", body }),
      invalidatesTags: ["StakingPlans"],
    }),
  }),
});
export const { useGetAdminStakingSettingsQuery, useUpdateAdminStakingSettingsMutation,
  useGetAdminStakingPlansQuery, useSaveAdminStakingPlanMutation } = stakingApi;
