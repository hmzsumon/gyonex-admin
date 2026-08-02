"use client";

/* ────────── lottery admin create page imports ────────── */
import {
  LotteryAdminFormState,
  LotteryCreateForm,
} from "@/components/admin/lottery/LotteryAdminComponents";
import { useCreateAdminLotteryMutation } from "@/redux/features/lottery/lotteryApi";
import { useRouter } from "next/navigation";
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

/* ────────── lottery admin create page component ────────── */
export default function AdminLotteryCreateEventPage() {
  const router = useRouter();
  const [form, setForm] = useState<LotteryAdminFormState>(createDefaultForm);
  const [createLottery, createState] = useCreateAdminLotteryMutation();

  /* ────────── lottery admin create handler ────────── */
  const handleCreate = async () => {
    try {
      await createLottery({
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

      toast.success("Lottery event created successfully");
      router.replace("/lottary");
    } catch (error: any) {
      toast.error(getApiMessage(error, "Failed to create lottery event"));
    }
  };

  return (
    <main className="min-h-screen bg-[#0B0D12] text-[#E6E6E6]">
      <div className="mx-auto max-w-5xl  py-4 md:p-6 lg:p-8">
        <LotteryCreateForm
          form={form}
          loading={createState.isLoading}
          onCancel={() => router.push("/lottary")}
          onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
          onSubmit={handleCreate}
        />
      </div>
    </main>
  );
}
