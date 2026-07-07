"use client";

/* ────────── lottery admin page imports ────────── */
import {
  LotteryAdminFormState,
  LotteryAdminHeader,
  LotteryCreateModal,
  LotteryEventGrid,
  LotteryFilters,
  LotteryPagination,
  LotteryStatsGrid,
} from "@/components/admin/lottery/LotteryAdminComponents";
import {
  useCreateAdminLotteryMutation,
  useDrawAdminLotteryMutation,
  useGetAdminLotteriesQuery,
  useUpdateAdminLotteryMutation,
} from "@/redux/features/lottery/lotteryApi";
import { useState } from "react";
import toast from "react-hot-toast";

/* ────────── lottery admin default form helper ────────── */
const createDefaultForm = (): LotteryAdminFormState => {
  const now = new Date();
  const draw = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return {
    eventType: "WEEKLY",
    title: "Weekly Mega Draw",
    description: "Weekly lottery event for all users.",
    prizeTiers: [
      { title: "1st Prize", quantity: 1, amount: 100 },
      { title: "2nd Prize", quantity: 2, amount: 50 },
      { title: "3rd Prize", quantity: 5, amount: 20 },
    ],
    ticketPrice: "5",
    maxTickets: "10000",
    startDate: now.toISOString().slice(0, 16),
    endDate: draw.toISOString().slice(0, 16),
    drawDate: draw.toISOString().slice(0, 16),
    status: "open",
    isAutoDraw: true,
  };
};

/* ────────── lottery admin datetime normalizer helper ────────── */
const toIsoDate = (value: string) => new Date(value).toISOString();

/* ────────── lottery admin api message resolver helper ────────── */
const getApiMessage = (error: any, fallback: string) =>
  error?.data?.error ||
  error?.data?.message ||
  error?.error ||
  error?.message ||
  fallback;

/* ────────── lottery admin main page component ────────── */
export default function AdminLotteryPage() {
  /* ────────── lottery admin ui state ────────── */
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [eventType, setEventType] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<LotteryAdminFormState>(createDefaultForm);

  /* ────────── lottery admin rtk query hooks ────────── */
  const { data, isLoading } = useGetAdminLotteriesQuery({
    page,
    status: status === "all" ? undefined : status,
    eventType: eventType === "all" ? undefined : eventType,
  });
  const [createLottery, createState] = useCreateAdminLotteryMutation();
  const [updateLottery] = useUpdateAdminLotteryMutation();
  const [drawLottery, drawState] = useDrawAdminLotteryMutation();

  /* ────────── lottery admin response data mapping ────────── */
  const lotteries = data?.data?.lotteries ?? [];
  const stats = data?.data?.stats;
  const totalPages = data?.data?.pagination?.pages ?? 1;

  /* ────────── lottery admin create handler ────────── */
  const handleCreate = async () => {
    try {
      const res = await createLottery({
        eventType: form.eventType,
        title: form.title,
        description: form.description,
        prizeAmount: form.prizeTiers.reduce(
          (sum, prize) =>
            sum + Number(prize.quantity || 0) * Number(prize.amount || 0),
          0,
        ),
        prizeAsset: "USDT",
        prizeTiers: form.prizeTiers,
        ticketPrice: Number(form.ticketPrice),
        maxTickets: Number(form.maxTickets),
        winnerCount: form.prizeTiers.reduce(
          (sum, prize) => sum + Number(prize.quantity || 0),
          0,
        ),
        startDate: toIsoDate(form.startDate),
        endDate: toIsoDate(form.endDate),
        drawDate: toIsoDate(form.drawDate),
        status: form.status,
        isAutoDraw: form.isAutoDraw,
      }).unwrap();

      toast.success(res?.message || "Lottery event created successfully");
      setShowCreate(false);
      setForm(createDefaultForm());
    } catch (error: any) {
      toast.error(getApiMessage(error, "Failed to create lottery event"));
    }
  };

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
      <style jsx global>{`
        .lottery-input {
          height: 46px;
          width: 100%;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: #090b0f;
          padding: 0 14px;
          color: #fff;
          outline: none;
        }
        .lottery-input::placeholder {
          color: rgba(255, 255, 255, 0.28);
        }
        .lottery-input:focus {
          border-color: rgba(52, 211, 153, 0.65);
          box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.08);
        }
        textarea.lottery-input {
          height: auto;
          padding-top: 12px;
          padding-bottom: 12px;
        }
      `}</style>

      <div className="mx-auto max-w-7xl space-y-5 p-4 md:p-6 lg:p-8">
        {/* ────────── lottery admin header section ────────── */}
        <LotteryAdminHeader onCreate={() => setShowCreate(true)} />

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

      {/* ────────── lottery admin create modal section ────────── */}
      {showCreate && (
        <LotteryCreateModal
          form={form}
          loading={createState.isLoading}
          onClose={() => setShowCreate(false)}
          onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
          onSubmit={handleCreate}
        />
      )}
    </main>
  );
}
