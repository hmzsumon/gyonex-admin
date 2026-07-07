/* ────────── admin lottery RTK Query imports ────────── */
import { apiSlice } from "../api/apiSlice";
import type {
  LotteryEvent,
  LotteryEventType,
  LotteryPrizeTier,
  LotteryStatus,
} from "./lotteryTypes";

/* ────────── admin lottery create and update payload type ────────── */
export interface LotteryCreatePayload {
  eventType: LotteryEventType;
  title: string;
  description?: string;
  prizeAmount: number;
  prizeAsset?: string;
  prizeTiers?: LotteryPrizeTier[];
  ticketPrice: number;
  maxTickets: number;
  winnerCount?: number;
  startDate: string;
  endDate: string;
  drawDate: string;
  status?: LotteryStatus;
  isAutoDraw?: boolean;
}

/* ────────── admin lottery API endpoints ────────── */
export const adminLotteryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminLotteries: builder.query<
      any,
      { page?: number; status?: string; eventType?: string } | void
    >({
      query: (params) => ({
        url: "/lottery/admin/events",
        params: {
          page: params?.page ?? 1,
          limit: 20,
          status: params?.status,
          eventType: params?.eventType,
        },
      }),
      providesTags: ["Lottery"],
    }),

    getAdminLottery: builder.query<any, string>({
      query: (id) => `/lottery/admin/events/${id}`,
      providesTags: ["Lottery", "LotteryTickets"],
    }),

    createAdminLottery: builder.mutation<
      { success: boolean; data: LotteryEvent },
      LotteryCreatePayload
    >({
      query: (body) => ({ url: "/lottery/admin/events", method: "POST", body }),
      invalidatesTags: ["Lottery"],
    }),

    updateAdminLottery: builder.mutation<
      any,
      { id: string; body: Partial<LotteryCreatePayload> }
    >({
      query: ({ id, body }) => ({
        url: `/lottery/admin/events/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Lottery", "LotteryTickets"],
    }),

    drawAdminLottery: builder.mutation<any, string>({
      query: (id) => ({
        url: `/lottery/admin/events/${id}/draw`,
        method: "POST",
      }),
      invalidatesTags: ["Lottery", "LotteryTickets", "LotteryWinners"],
    }),
  }),
});

/* ────────── admin lottery generated hooks ────────── */
export const {
  useGetAdminLotteriesQuery,
  useGetAdminLotteryQuery,
  useCreateAdminLotteryMutation,
  useUpdateAdminLotteryMutation,
  useDrawAdminLotteryMutation,
} = adminLotteryApi;
