// redux/features/notifications/notificationApi.ts
import { apiSlice } from "../api/apiSlice";

/* ──────────  notification api slice (real backend endpoints)  ────────── */
export const notificationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /* ──────────  admin: unread notification list  ────────── */
    getAdminNotifications: builder.query<any, void>({
      query: () => "/admin-notifications",
      providesTags: ["AdminNotifications"],
    }),

    /* ──────────  admin: mark notifications read  ────────── */
    updateAdminNotificationIsRead: builder.mutation<
      any,
      { notificationIds: string[] }
    >({
      query: (body) => ({
        url: "/update-admin-notification",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["AdminNotifications"],
    }),

    /* ──────────  self (admin as a user): unread list/count  ────────── */
    getMyUnreadNotifications: builder.query<any, void>({
      query: () => "/my-unread-notifications",
      providesTags: ["MyUnreadNotifications"],
    }),

    getMyUnreadNotificationsCount: builder.query<{ dataCount: number }, void>({
      query: () => "/my-unread-notifications-count",
      providesTags: ["MyUnreadNotificationsCount"],
    }),

    updateNotification: builder.mutation<any, string>({
      query: (id) => ({
        url: `/update-notification/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["MyUnreadNotifications", "MyUnreadNotificationsCount"],
    }),
  }),
});

export const {
  useGetAdminNotificationsQuery,
  useUpdateAdminNotificationIsReadMutation,
  useGetMyUnreadNotificationsQuery,
  useGetMyUnreadNotificationsCountQuery,
  useUpdateNotificationMutation,
} = notificationApi;
