"use client";

import {
  AdminLoan,
  AdminLoanStatus,
  useApproveAdminLoanMutation,
  useGetAdminLoansQuery,
  useRejectAdminLoanMutation,
} from "@/redux/features/loan/adminLoanApi";
import { RefreshCcw } from "lucide-react";
import toast from "react-hot-toast";
import { useMemo, useState } from "react";
import { getApiErrorMessage } from "./admin-loan.helpers";
import AdminLoanApproveModal from "./AdminLoanApproveModal";
import AdminLoanDetails from "./AdminLoanDetails";
import AdminLoanHeader from "./AdminLoanHeader";
import AdminLoanRejectModal from "./AdminLoanRejectModal";
import AdminLoanTable from "./AdminLoanTable";
import AdminLoanTabs from "./AdminLoanTabs";

/* ─────────────────────────────────────────────────────────────
   Admin loans shell
   RTK Query handles list, approve, and reject flow.
────────────────────────────────────────────────────────────── */
export default function AdminLoansShell() {
  const [tab, setTab] = useState<AdminLoanStatus>("pending");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [approveLoan, setApproveLoan] = useState<AdminLoan | null>(null);
  const [rejectLoan, setRejectLoan] = useState<AdminLoan | null>(null);
  const [approvedAmount, setApprovedAmount] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [reason, setReason] = useState("");

  const { data, isLoading, isFetching, refetch } = useGetAdminLoansQuery(
    { status: tab, limit: 50 },
    { pollingInterval: 20000 },
  );

  const [approveAdminLoan, approveMutation] = useApproveAdminLoanMutation();
  const [rejectAdminLoan, rejectMutation] = useRejectAdminLoanMutation();

  const items = data?.data?.loans || [];
  const stats = data?.data?.stats || {};

  const detailItem = useMemo(
    () => items.find((loan) => loan._id === detailId) || null,
    [items, detailId],
  );

  /* ────────── Open approve modal ────────── */
  const openApproveModal = (loan: AdminLoan) => {
    setApproveLoan(loan);
    setApprovedAmount(String(loan.requestedAmount || ""));
    setAdminNote(loan.adminNote || "");
  };

  /* ────────── Open reject modal ────────── */
  const openRejectModal = (loan: AdminLoan) => {
    setRejectLoan(loan);
    setReason(loan.adminNote || "");
  };

  /* ────────── Approve loan action ────────── */
  const handleApprove = async () => {
    if (!approveLoan) return;

    try {
      await approveAdminLoan({
        loanId: approveLoan._id,
        approvedAmount: Number(approvedAmount),
        adminNote,
      }).unwrap();

      toast.success("Loan approved and disbursed successfully.");
      setApproveLoan(null);
      setApprovedAmount("");
      setAdminNote("");
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, "Failed to approve loan"));
    }
  };

  /* ────────── Reject loan action ────────── */
  const handleReject = async () => {
    if (!rejectLoan) return;

    try {
      await rejectAdminLoan({
        loanId: rejectLoan._id,
        reason,
      }).unwrap();

      toast.success("Loan rejected successfully.");
      setRejectLoan(null);
      setReason("");
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, "Failed to reject loan"));
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-5">
      <AdminLoanHeader stats={stats} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <AdminLoanTabs
          tab={tab}
          onChange={(nextTab) => {
            setTab(nextTab);
            setDetailId(null);
          }}
        />

        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-xs font-black text-white/80 transition hover:bg-white/[0.06]"
        >
          <RefreshCcw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <AdminLoanTable
        items={items}
        tab={tab}
        isLoading={isLoading}
        detailId={detailId}
        onToggleDetail={(id) => setDetailId((prev) => (prev === id ? null : id))}
        onApprove={openApproveModal}
        onReject={openRejectModal}
      />

      <AdminLoanDetails
        loan={detailItem}
        onApprove={openApproveModal}
        onReject={openRejectModal}
      />

      <AdminLoanApproveModal
        loan={approveLoan}
        approvedAmount={approvedAmount}
        adminNote={adminNote}
        isLoading={approveMutation.isLoading}
        onAmountChange={setApprovedAmount}
        onNoteChange={setAdminNote}
        onClose={() => setApproveLoan(null)}
        onConfirm={handleApprove}
      />

      <AdminLoanRejectModal
        loan={rejectLoan}
        reason={reason}
        isLoading={rejectMutation.isLoading}
        onReasonChange={setReason}
        onClose={() => setRejectLoan(null)}
        onConfirm={handleReject}
      />
    </div>
  );
}
