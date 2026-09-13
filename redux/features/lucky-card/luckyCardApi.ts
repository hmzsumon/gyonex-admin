/* ────────── admin lucky card RTK Query ────────── */
import { apiSlice } from "../api/apiSlice";
import type {
  LuckyCardTypeRow,
  LuckyGiftRow,
  LuckyPackageRow,
  LuckyPoolConfigSummary,
  LuckyPoolTotals,
  LuckyPrizePoolRow,
  LuckyPrizeTierRow,
  LuckyRecentPurchase,
  LuckyRecentWin,
  LuckyRtpRow,
} from "./luckyCardTypes";

export const luckyCardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /* ────────── card types ────────── */
    getAdminLuckyCardTypes: builder.query<
      { success: boolean; cardTypes: LuckyCardTypeRow[] },
      void
    >({
      query: () => "/admin/lucky/card-types",
      providesTags: ["LuckyCardTypes"],
    }),

    saveAdminLuckyCardType: builder.mutation<any, Partial<LuckyCardTypeRow>>({
      query: (body) => ({ url: "/admin/lucky/card-types", method: "POST", body }),
      invalidatesTags: ["LuckyCardTypes"],
    }),

    deleteAdminLuckyCardType: builder.mutation<any, string>({
      query: (id) => ({ url: `/admin/lucky/card-types/${id}`, method: "DELETE" }),
      invalidatesTags: ["LuckyCardTypes"],
    }),

    /* ────────── prize tiers (legacy display) ────────── */
    saveAdminLuckyTier: builder.mutation<any, Partial<LuckyPrizeTierRow> & { cardType?: string }>({
      query: (body) => ({ url: "/admin/lucky/prize-tiers", method: "POST", body }),
      invalidatesTags: ["LuckyCardTypes"],
    }),

    deleteAdminLuckyTier: builder.mutation<any, string>({
      query: (id) => ({ url: `/admin/lucky/prize-tiers/${id}`, method: "DELETE" }),
      invalidatesTags: ["LuckyCardTypes"],
    }),

    /* ────────── packages ────────── */
    saveAdminLuckyPackage: builder.mutation<any, Partial<LuckyPackageRow> & { cardType?: string }>({
      query: (body) => ({ url: "/admin/lucky/packages", method: "POST", body }),
      invalidatesTags: ["LuckyCardTypes"],
    }),

    deleteAdminLuckyPackage: builder.mutation<any, string>({
      query: (id) => ({ url: `/admin/lucky/packages/${id}`, method: "DELETE" }),
      invalidatesTags: ["LuckyCardTypes"],
    }),

    /* ────────── global prize pool ────────── */
    getAdminLuckyPrizePools: builder.query<
      {
        success: boolean;
        pools: LuckyPrizePoolRow[];
        config: LuckyPoolConfigSummary;
        totals: LuckyPoolTotals;
      },
      void
    >({
      query: () => "/admin/lucky/prize-pools",
      providesTags: ["LuckyPrizePools"],
    }),

    previewAdminLuckyPrizePools: builder.mutation<
      any,
      { pools: Partial<LuckyPrizePoolRow>[]; companyFundPercent: number; samplePrice?: number }
    >({
      query: (body) => ({ url: "/admin/lucky/prize-pools/preview", method: "POST", body }),
    }),

    saveAdminLuckyPrizePools: builder.mutation<
      any,
      { pools: Partial<LuckyPrizePoolRow>[]; companyFundPercent: number; confirm: true }
    >({
      query: (body) => ({ url: "/admin/lucky/prize-pools", method: "POST", body }),
      invalidatesTags: ["LuckyPrizePools", "LuckyStats"],
    }),

    seedAdminLuckyPrizePools: builder.mutation<any, void>({
      query: () => ({ url: "/admin/lucky/prize-pools/seed", method: "POST" }),
      invalidatesTags: ["LuckyPrizePools", "LuckyStats"],
    }),

    deleteAdminLuckyPrizePool: builder.mutation<any, string>({
      query: (code) => ({ url: `/admin/lucky/prize-pools/${code}`, method: "DELETE" }),
      invalidatesTags: ["LuckyPrizePools", "LuckyStats"],
    }),

    /* ────────── stats ────────── */
    getAdminLuckyStats: builder.query<
      {
        success: boolean;
        summary: {
          totalStaked: number;
          totalPaidOut: number;
          grossRevenue: number;
          liveRtp: number;
        };
        prizePool: any;
        rtp: LuckyRtpRow[];
        recentWins: LuckyRecentWin[];
        recentPurchases: LuckyRecentPurchase[];
      },
      void
    >({
      query: () => "/admin/lucky/stats",
      providesTags: ["LuckyStats"],
    }),

    resetAdminLuckyStats: builder.mutation<any, string>({
      query: (id) => ({
        url: `/admin/lucky/card-types/${id}/reset-stats`,
        method: "POST",
      }),
      invalidatesTags: ["LuckyStats", "LuckyCardTypes"],
    }),

    getAdminLuckyUserDetail: builder.query<any, string>({
      query: (userId) => `/admin/lucky/user/${userId}`,
    }),

    seedAdminLuckyCatalog: builder.mutation<any, void>({
      query: () => ({ url: "/admin/lucky/seed", method: "POST" }),
      invalidatesTags: ["LuckyCardTypes", "LuckyPrizePools"],
    }),

    /* ────────── gift ────────── */
    giftAdminLuckyPackage: builder.mutation<
      any,
      { userId: string; packageId: string; prizeAmount: number; note?: string }
    >({
      query: (body) => ({ url: "/admin/lucky/gift", method: "POST", body }),
      invalidatesTags: ["LuckyGifts", "LuckyStats"],
    }),

    getAdminLuckyGifts: builder.query<
      {
        success: boolean;
        gifts: LuckyGiftRow[];
        pagination: { total: number; page: number; limit: number; totalPages: number };
      },
      { page?: number } | void
    >({
      query: (params) => ({
        url: "/admin/lucky/gifts",
        params: { page: params?.page ?? 1, limit: 20 },
      }),
      providesTags: ["LuckyGifts"],
    }),
  }),
});

export const {
  useGetAdminLuckyCardTypesQuery,
  useSaveAdminLuckyCardTypeMutation,
  useDeleteAdminLuckyCardTypeMutation,
  useSaveAdminLuckyTierMutation,
  useDeleteAdminLuckyTierMutation,
  useSaveAdminLuckyPackageMutation,
  useDeleteAdminLuckyPackageMutation,
  useGetAdminLuckyPrizePoolsQuery,
  usePreviewAdminLuckyPrizePoolsMutation,
  useSaveAdminLuckyPrizePoolsMutation,
  useSeedAdminLuckyPrizePoolsMutation,
  useDeleteAdminLuckyPrizePoolMutation,
  useGetAdminLuckyStatsQuery,
  useResetAdminLuckyStatsMutation,
  useGetAdminLuckyUserDetailQuery,
  useSeedAdminLuckyCatalogMutation,
  useGiftAdminLuckyPackageMutation,
  useGetAdminLuckyGiftsQuery,
} = luckyCardApi;
