"use client";

/* ────────── admin lucky card gift page imports ────────── */
import { LuckyField, LUCKY_INPUT_CLASS, formatUsdt } from "@/components/admin/lucky-card/LuckyCardAdminComponents";
import { useGetAllUsersQuery } from "@/redux/features/admin/adminUsersApi";
import {
  useGetAdminLuckyCardTypesQuery,
  useGiftAdminLuckyPackageMutation,
} from "@/redux/features/lucky-card/luckyCardApi";
import { Gift, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

const getApiMessage = (error: any, fallback: string) =>
  error?.data?.error ||
  error?.data?.message ||
  error?.error ||
  error?.message ||
  fallback;

export default function AdminGiftLuckyCardPage() {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<{
    _id: string;
    name: string;
    customerId: string;
  } | null>(null);
  const [packageId, setPackageId] = useState("");
  const [prizeAmount, setPrizeAmount] = useState("0");
  const [note, setNote] = useState("");

  const { data: usersData, isFetching: usersLoading } = useGetAllUsersQuery(
    { search, limit: 10 },
    { skip: search.trim().length < 2 },
  );
  const { data: catalogData } = useGetAdminLuckyCardTypesQuery();
  const [giftPackage, giftState] = useGiftAdminLuckyPackageMutation();

  const packageOptions = useMemo(() => {
    const rows: { _id: string; label: string; cardTypeName: string }[] = [];
    for (const ct of catalogData?.cardTypes ?? []) {
      for (const p of ct.packages) {
        if (!p.isActive) continue;
        rows.push({
          _id: p._id,
          cardTypeName: ct.name,
          label: `${ct.name} — ${p.name} (${p.cardCount + p.bonusCards} cards, normally ${formatUsdt(p.price)})`,
        });
      }
    }
    return rows;
  }, [catalogData]);

  const canSubmit = !!selectedUser && !!packageId;

  const handleSubmit = async () => {
    if (!selectedUser || !packageId) return;
    try {
      const res = await giftPackage({
        userId: selectedUser._id,
        packageId,
        prizeAmount: Number(prizeAmount || 0),
        note: note.trim() || undefined,
      }).unwrap();
      toast.success(res?.message || "Package gifted successfully");
      setSelectedUser(null);
      setSearch("");
      setPackageId("");
      setPrizeAmount("0");
      setNote("");
    } catch (e) {
      toast.error(getApiMessage(e, "Failed to gift package"));
    }
  };

  return (
    <main className="min-h-screen bg-[#0B0D12] text-[#E6E6E6]">
      <div className="mx-auto max-w-3xl space-y-5 p-4 md:p-6 lg:p-8">
        <div>
          <p className="mb-1 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-emerald-400">
            <Sparkles className="h-4 w-4" /> Lucky Card Management
          </p>
          <h1 className="text-2xl font-black tracking-tight text-white md:text-3xl">
            Gift a Package
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-white/50">
            Send any lucky card package to any user for free, and set the exact
            prize amount (USDT) they will win when they scratch it. No balance
            is deducted and the gift never touches the global prize pool.
          </p>
        </div>

        <div className="space-y-4 rounded-3xl border border-white/10 bg-[#0E1014] p-5 shadow-2xl shadow-black/40">
          {/* ────────── user picker ────────── */}
          <LuckyField label="Find user (name / email / phone / customer ID)">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedUser(null);
                }}
                placeholder="Type at least 2 characters..."
                className={`${LUCKY_INPUT_CLASS} pl-9`}
              />
            </div>
          </LuckyField>

          {selectedUser ? (
            <div className="flex items-center justify-between rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm">
              <span className="font-bold text-emerald-200">
                {selectedUser.name} <span className="text-emerald-300/70">({selectedUser.customerId})</span>
              </span>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-xs font-bold text-emerald-300/80 underline"
              >
                Change
              </button>
            </div>
          ) : (
            search.trim().length >= 2 && (
              <div className="max-h-56 space-y-1 overflow-y-auto rounded-2xl border border-white/10 bg-black/20 p-2">
                {usersLoading && <p className="p-2 text-xs text-white/40">Searching...</p>}
                {!usersLoading && !usersData?.users.length && (
                  <p className="p-2 text-xs text-white/40">No users found.</p>
                )}
                {usersData?.users.map((u) => (
                  <button
                    key={u._id}
                    onClick={() =>
                      setSelectedUser({ _id: u._id, name: u.name, customerId: u.customerId })
                    }
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs hover:bg-white/[0.06]"
                  >
                    <span className="font-bold text-white">{u.name}</span>
                    <span className="text-white/40">{u.customerId} · {u.email}</span>
                  </button>
                ))}
              </div>
            )
          )}

          {/* ────────── package picker ────────── */}
          <LuckyField label="Package">
            <select
              value={packageId}
              onChange={(e) => setPackageId(e.target.value)}
              className={LUCKY_INPUT_CLASS}
            >
              <option value="">Select a package...</option>
              {packageOptions.map((p) => (
                <option key={p._id} value={p._id} className="bg-[#090B0F]">
                  {p.label}
                </option>
              ))}
            </select>
          </LuckyField>

          {/* ────────── prize amount ────────── */}
          <LuckyField label="Prize amount to gift (USDT) — 0 = free cards with no guaranteed win">
            <input
              type="number"
              min={0}
              value={prizeAmount}
              onChange={(e) => setPrizeAmount(e.target.value)}
              className={LUCKY_INPUT_CLASS}
            />
          </LuckyField>

          <LuckyField label="Note (optional, admin-only)">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={`${LUCKY_INPUT_CLASS} min-h-[80px] resize-none py-3`}
              placeholder="Reason for this gift..."
            />
          </LuckyField>

          <button
            disabled={!canSubmit || giftState.isLoading}
            onClick={handleSubmit}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-black text-black shadow-lg shadow-emerald-400/20 transition hover:bg-emerald-300 disabled:opacity-50"
          >
            <Gift className="h-4 w-4" />
            {giftState.isLoading ? "Gifting..." : "Gift package"}
          </button>
        </div>
      </div>
    </main>
  );
}
