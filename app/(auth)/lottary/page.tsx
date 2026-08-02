"use client";

/* ────────── lottery admin page imports ────────── */
import {
  LotteryAdminHeader,
  LotteryEventGrid,
  LotteryFilters,
  LotteryPagination,
  LotteryStatsGrid,
} from "@/components/admin/lottery/LotteryAdminComponents";
import {
  useDrawAdminLotteryMutation,
  useGetAdminLotteriesQuery,
  useUpdateAdminLotteryMutation,
} from "@/redux/features/lottery/lotteryApi";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

/* ────────── lottery admin api message resolver helper ────────── */
const getApiMessage = (error: any, fallback: string) =>
  error?.data?.error ||
  error?.data?.message ||
  error?.error ||
  error?.message ||
  fallback;

/* ────────── lottery admin main page component ────────── */
export default function AdminLotteryPage() {
  const router = useRouter();

  /* ────────── lottery admin ui state ────────── */
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [eventType, setEventType] = useState("all");

  /* ────────── lottery admin rtk query hooks ────────── */
  const { data, isLoading } = useGetAdminLotteriesQuery({
    page,
    status: status === "all" ? undefined : status,
    eventType: eventType === "all" ? undefined : eventType,
  });
  const [updateLottery] = useUpdateAdminLotteryMutation();
  const [drawLottery, drawState] = useDrawAdminLotteryMutation();

  /* ────────── lottery admin response data mapping ────────── */
  const lotteries = data?.data?.lotteries ?? [];
  const stats = data?.data?.stats;
  const totalPages = data?.data?.pagination?.pages ?? 1;

  /* ────────── lottery admin cancel handler ────────── */
  const handleCancel = async (id: string) => {
    try {
      const res = await updateLottery({
        id,
        body: { status: "cancelled" },
      }).unwrap();
      toast.success(res?.message || "Lottery event cancelled successfully");
    } catch (error: any) {
      toast.error(getApiMessage(error, "Failed to cancel lottery event"));
    }
  };

  /* ────────── lottery admin draw handler ────────── */
  const handleDraw = async (id: string) => {
    try {
      const res = await drawLottery(id).unwrap();
      toast.success(res?.message || "Lottery draw completed successfully");
    } catch (error: any) {
      toast.error(getApiMessage(error, "Failed to draw lottery event"));
    }
  };

  return (
    <main className="min-h-screen bg-[#0B0D12] text-[#E6E6E6]">
      <div className="mx-auto max-w-7xl space-y-5 p-4 md:p-6 lg:p-8">
        {/* ────────── lottery admin header section ────────── */}
        <LotteryAdminHeader
          onCreate={() => router.push("/lottary/create-event")}
        />

        {/* ────────── lottery admin stats section ────────── */}
        <LotteryStatsGrid stats={stats} />

        {/* ────────── lottery admin filter section ────────── */}
        <LotteryFilters
          status={status}
          eventType={eventType}
          onStatusChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
          onEventTypeChange={(value) => {
            setEventType(value);
            setPage(1);
          }}
        />

        {/* ────────── lottery admin event list section ────────── */}
        <LotteryEventGrid
          lotteries={lotteries}
          loading={isLoading}
          drawLoading={drawState.isLoading}
          onDraw={handleDraw}
          onCancel={handleCancel}
        />

        {/* ────────── lottery admin pagination section ────────── */}
        <LotteryPagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </main>
  );
}
