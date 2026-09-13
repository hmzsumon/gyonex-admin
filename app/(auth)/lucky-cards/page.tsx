"use client";

/* ────────── lucky card admin page imports ────────── */
import {
  LuckyAdminHeader,
  LuckyCardTypeCard,
  LuckyGiftHistoryTable,
  LuckyNewCardTypeForm,
  LuckyPrizePoolEditor,
  LuckyPrizePoolStatusGrid,
  LuckyRecentLists,
  LuckyRtpTable,
  LuckyStatsGrid,
  type PrizePoolFormRow,
} from "@/components/admin/lucky-card/LuckyCardAdminComponents";
import {
  useDeleteAdminLuckyCardTypeMutation,
  useDeleteAdminLuckyPackageMutation,
  useDeleteAdminLuckyTierMutation,
  useGetAdminLuckyCardTypesQuery,
  useGetAdminLuckyGiftsQuery,
  useGetAdminLuckyPrizePoolsQuery,
  useGetAdminLuckyStatsQuery,
  usePreviewAdminLuckyPrizePoolsMutation,
  useResetAdminLuckyStatsMutation,
  useSaveAdminLuckyCardTypeMutation,
  useSaveAdminLuckyPackageMutation,
  useSaveAdminLuckyPrizePoolsMutation,
  useSaveAdminLuckyTierMutation,
  useSeedAdminLuckyCatalogMutation,
  useSeedAdminLuckyPrizePoolsMutation,
} from "@/redux/features/lucky-card/luckyCardApi";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const getApiMessage = (error: any, fallback: string) =>
  error?.data?.error ||
  error?.data?.message ||
  error?.error ||
  error?.message ||
  fallback;

export default function AdminLuckyCardPage() {
  const [tab, setTab] = useState<"catalog" | "prize-pool" | "stats" | "gift">("catalog");

  /* ────────── catalog data ────────── */
  const { data: catalogData, isLoading: catalogLoading } = useGetAdminLuckyCardTypesQuery();
  const [saveCardType, saveCardTypeState] = useSaveAdminLuckyCardTypeMutation();
  const [deleteCardType] = useDeleteAdminLuckyCardTypeMutation();
  const [savePackage] = useSaveAdminLuckyPackageMutation();
  const [deletePackage] = useDeleteAdminLuckyPackageMutation();
  const [saveTier] = useSaveAdminLuckyTierMutation();
  const [deleteTier] = useDeleteAdminLuckyTierMutation();
  const [seedCatalog, seedCatalogState] = useSeedAdminLuckyCatalogMutation();

  /* ────────── prize pool data ────────── */
  const { data: poolData } = useGetAdminLuckyPrizePoolsQuery();
  const [previewPools, previewState] = usePreviewAdminLuckyPrizePoolsMutation();
  const [savePools, saveState] = useSaveAdminLuckyPrizePoolsMutation();
  const [seedPools, seedPoolState] = useSeedAdminLuckyPrizePoolsMutation();
  const [poolRows, setPoolRows] = useState<PrizePoolFormRow[]>([]);
  const [companyFundPercent, setCompanyFundPercent] = useState("3.999");
  const [preview, setPreview] = useState<any>(null);

  useEffect(() => {
    if (!poolData) return;
    setPoolRows(
      poolData.pools.map((p) => ({
        code: p.code,
        label: p.label,
        symbol: p.symbol,
        amount: String(p.amount),
        percent: String(p.percent),
        isActive: p.isActive,
      })),
    );
    setCompanyFundPercent(String(poolData.config.companyFundPercent));
  }, [poolData]);

  /* ────────── stats + gifts data ────────── */
  const { data: statsData } = useGetAdminLuckyStatsQuery();
  const [resetStats] = useResetAdminLuckyStatsMutation();
  const { data: giftsData } = useGetAdminLuckyGiftsQuery({ page: 1 });

  return (
    <main className="min-h-screen bg-[#0B0D12] text-[#E6E6E6]">
      <div className="mx-auto max-w-7xl space-y-5 p-4 md:p-6 lg:p-8">
        <LuckyAdminHeader active={tab} onTabChange={setTab} />

        {tab === "catalog" && (
          <div className="space-y-4">
            <LuckyNewCardTypeForm
              loading={saveCardTypeState.isLoading}
              onCreate={async (payload) => {
                try {
                  await saveCardType(payload).unwrap();
                  toast.success("Card type created");
                } catch (e) {
                  toast.error(getApiMessage(e, "Failed to create card type"));
                }
              }}
            />

            <div className="flex justify-end">
              <button
                disabled={seedCatalogState.isLoading}
                onClick={async () => {
                  try {
                    const res = await seedCatalog().unwrap();
                    toast.success(res?.message || "Default catalog seeded");
                  } catch (e) {
                    toast.error(getApiMessage(e, "Failed to seed catalog"));
                  }
                }}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold text-white/70 hover:text-white"
              >
                {seedCatalogState.isLoading ? "Seeding..." : "Seed default catalog"}
              </button>
            </div>

            {catalogLoading && (
              <div className="grid gap-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-40 animate-pulse rounded-2xl bg-white/[0.04]" />
                ))}
              </div>
            )}

            {(catalogData?.cardTypes ?? []).map((ct) => (
              <LuckyCardTypeCard
                key={ct._id}
                cardType={ct}
                savingType={saveCardTypeState.isLoading}
                onSaveType={async (patch) => {
                  try {
                    await saveCardType(patch).unwrap();
                    toast.success("Saved");
                  } catch (e) {
                    toast.error(getApiMessage(e, "Failed to save"));
                  }
                }}
                onDeleteType={async () => {
                  try {
                    const res = await deleteCardType(ct._id).unwrap();
                    toast.success(res?.message || "Deleted");
                  } catch (e) {
                    toast.error(getApiMessage(e, "Failed to delete"));
                  }
                }}
                onSavePackage={async (pkg) => {
                  try {
                    await savePackage(pkg).unwrap();
                    toast.success("Package saved");
                  } catch (e) {
                    toast.error(getApiMessage(e, "Failed to save package"));
                  }
                }}
                onDeletePackage={async (id) => {
                  try {
                    const res = await deletePackage(id).unwrap();
                    toast.success(res?.message || "Deleted");
                  } catch (e) {
                    toast.error(getApiMessage(e, "Failed to delete package"));
                  }
                }}
                onSaveTier={async (tier) => {
                  try {
                    await saveTier(tier).unwrap();
                    toast.success("Tier saved");
                  } catch (e) {
                    toast.error(getApiMessage(e, "Failed to save tier"));
                  }
                }}
                onDeleteTier={async (id) => {
                  try {
                    const res = await deleteTier(id).unwrap();
                    toast.success(res?.message || "Deleted");
                  } catch (e) {
                    toast.error(getApiMessage(e, "Failed to delete tier"));
                  }
                }}
              />
            ))}
          </div>
        )}

        {tab === "prize-pool" && (
          <div className="space-y-4">
            {poolData && <LuckyPrizePoolStatusGrid pools={poolData.pools} />}

            <div className="flex justify-end">
              <button
                disabled={seedPoolState.isLoading}
                onClick={async () => {
                  try {
                    const res = await seedPools().unwrap();
                    toast.success(res?.message || "Seeded");
                  } catch (e) {
                    toast.error(getApiMessage(e, "Failed to seed pools"));
                  }
                }}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold text-white/70 hover:text-white"
              >
                {seedPoolState.isLoading ? "Seeding..." : "Seed default A–I pools"}
              </button>
            </div>

            <LuckyPrizePoolEditor
              rows={poolRows}
              companyFundPercent={companyFundPercent}
              onChangeRows={setPoolRows}
              onChangeCompanyFundPercent={setCompanyFundPercent}
              onAddRow={() =>
                setPoolRows((rows) => [
                  ...rows,
                  {
                    code: "",
                    label: "",
                    symbol: "🎁",
                    amount: "0",
                    percent: "0",
                    isActive: true,
                  },
                ])
              }
              onRemoveRow={(i) => setPoolRows((rows) => rows.filter((_, idx) => idx !== i))}
              preview={preview}
              previewing={previewState.isLoading}
              saving={saveState.isLoading}
              onPreview={async () => {
                try {
                  const res = await previewPools({
                    pools: poolRows.map((r) => ({
                      code: r.code,
                      label: r.label,
                      symbol: r.symbol,
                      amount: Number(r.amount),
                      percent: Number(r.percent),
                      isActive: r.isActive,
                    })),
                    companyFundPercent: Number(companyFundPercent),
                  }).unwrap();
                  setPreview(res.preview);
                } catch (e) {
                  toast.error(getApiMessage(e, "Failed to preview"));
                }
              }}
              onSave={async () => {
                try {
                  const res = await savePools({
                    pools: poolRows.map((r) => ({
                      code: r.code,
                      label: r.label,
                      symbol: r.symbol,
                      amount: Number(r.amount),
                      percent: Number(r.percent),
                      isActive: r.isActive,
                    })),
                    companyFundPercent: Number(companyFundPercent),
                    confirm: true,
                  }).unwrap();
                  toast.success(res?.message || "Saved");
                  setPreview(null);
                } catch (e) {
                  toast.error(getApiMessage(e, "Failed to save"));
                }
              }}
            />
          </div>
        )}

        {tab === "stats" && (
          <div className="space-y-4">
            <LuckyStatsGrid summary={statsData?.summary} />
            {statsData && (
              <LuckyRtpTable
                rows={statsData.rtp}
                onReset={async (id) => {
                  try {
                    const res = await resetStats(id).unwrap();
                    toast.success(res?.message || "Reset");
                  } catch (e) {
                    toast.error(getApiMessage(e, "Failed to reset"));
                  }
                }}
              />
            )}
            {statsData && (
              <LuckyRecentLists wins={statsData.recentWins} purchases={statsData.recentPurchases} />
            )}
            <LuckyGiftHistoryTable gifts={giftsData?.gifts ?? []} />
          </div>
        )}

        {tab === "gift" && (
          <GiftPromo />
        )}
      </div>
    </main>
  );
}

/* ────────── small promo card linking to the dedicated gift page ────────── */
function GiftPromo() {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0E1014] p-8 text-center">
      <p className="text-sm text-white/60">
        Use the dedicated{" "}
        <a href="/lucky-cards/gift" className="font-bold text-emerald-300 underline">
          Gift a Package
        </a>{" "}
        page to send any lucky card package — with any prize amount — to any user.
      </p>
    </div>
  );
}
