"use client";

import {
  useGetAdminNotificationsQuery,
  useUpdateAdminNotificationIsReadMutation,
} from "@/redux/features/notifications/notificationApi";
import { X } from "lucide-react";

export default function NotificationDrawer({
  open,
  onClose,
  topOffset = 64, // header height
}: {
  open: boolean;
  onClose: () => void;
  topOffset?: number;
}) {
  /* ──────────  data queries  ────────── */
  const { data, isFetching } = useGetAdminNotificationsQuery(undefined, {
    skip: !open,
  });
  const [markRead] = useUpdateAdminNotificationIsReadMutation();

  const notifications = data?.notifications ?? [];

  return (
    <>
      {/* overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{ top: topOffset }}
      />
      {/* panel */}
      <aside
        className={`fixed right-0 z-[61] h-[calc(100dvh-4rem)] w-full max-w-[380px] translate-x-0 border-l border-neutral-900 bg-neutral-950 transition-transform md:max-w-[420px] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ top: topOffset }}
        aria-hidden={!open}
      >
        <div className="flex h-12 items-center justify-between border-b border-neutral-900 px-4">
          <div className="text-sm font-semibold text-white">
            Notifications
            {notifications.length ? (
              <span className="ml-2 rounded bg-neutral-800 px-2 py-0.5 text-xs text-neutral-200">
                {notifications.length}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            {notifications.length ? (
              <button
                onClick={() =>
                  markRead({
                    notificationIds: notifications.map((n: any) => n._id),
                  })
                }
                className="text-xs text-neutral-300 hover:text-white"
              >
                Mark all read
              </button>
            ) : null}
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-neutral-300 hover:bg-neutral-900 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-4 text-sm text-neutral-300">
          {isFetching ? (
            "Loading..."
          ) : notifications.length === 0 ? (
            "You currently have no new notifications."
          ) : (
            <ul className="space-y-2">
              {notifications.map((n: any) => (
                <li
                  key={n._id}
                  className="rounded-lg border border-neutral-900 p-3"
                >
                  <div className="mb-1 text-white">{n.title}</div>
                  <div className="text-neutral-400">{n.message}</div>
                  <div className="mt-2 flex items-center gap-2">
                    {n.url ? (
                      <a
                        href={n.url}
                        className="text-xs text-blue-400 hover:underline"
                      >
                        Open
                      </a>
                    ) : null}
                    <button
                      onClick={() =>
                        markRead({ notificationIds: [n._id] })
                      }
                      className="text-xs text-neutral-300 hover:text-white"
                    >
                      Mark as read
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}
