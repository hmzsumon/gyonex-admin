/* ────────── imports ────────── */
"use client";
import AdminUsersTable from "@/components/admin/AdminUsersTable";
import AdminUsersToolbar from "@/components/admin/AdminUsersToolbar";
import BulkWithdrawRulesBar from "@/components/admin/BulkWithdrawRulesBar";
import { useGetAllUsersQuery } from "@/redux/features/admin/adminUsersApi";
import type { GridRowSelectionModel } from "@mui/x-data-grid";

import { useMemo, useState } from "react";

/* ────────── page ────────── */
const AllUsersPage = () => {
  /* ────────── UI state ────────── */
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string | undefined>();
  const [is_active, setIsActive] = useState<"true" | "false" | undefined>();
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [teamRule, setTeamRule] = useState<"true" | "false" | undefined>();
  /* DataGrid v8 এ selection model একটা object: { type, ids: Set } */
  const [selection, setSelection] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set(),
  });

  /* ────────── data ────────── */
  const { data, isLoading, isFetching } = useGetAllUsersQuery({
    page,
    limit: pageSize,
    search: search || undefined,
    role,
    is_active,
    require_team_activation: teamRule,
    sortBy,
    sortOrder,
  });

  const users = data?.users ?? [];
  const total = data?.pagination?.total ?? 0;

  /* ────────── selected ids (current page scoped) ────────── */
  const selectedIds = useMemo(() => {
    const ids = selection?.ids ?? new Set();
    if (selection?.type === "exclude") {
      return users.filter((u) => !ids.has(u._id)).map((u) => u._id);
    }
    return users.filter((u) => ids.has(u._id)).map((u) => u._id);
  }, [selection, users]);

  const clearSelection = () =>
    setSelection({ type: "include", ids: new Set() });

  /* ────────── sort handler ────────── */
  const handleSortChange = (m: any) => {
    const first = Array.isArray(m) && m.length ? m[0] : undefined;
    if (first?.field) setSortBy(first.field);
    if (first?.sort) setSortOrder(first.sort);
  };

  /* ────────── initial sort for grid ────────── */
  const initialSort = useMemo(
    () => [{ field: sortBy, sort: sortOrder }] as any,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <main className="min-h-screen bg-[#0B0D12] text-[#E6E6E6]">
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold">All Users</h1>
            <p className="text-xs text-white/50">
              Admin dashboard • manage users
            </p>
          </div>
        </div>

        <AdminUsersToolbar
          search={search}
          onSearchChange={(v) => {
            setPage(1);
            setSearch(v);
          }}
          role={role}
          onRoleChange={(v) => {
            setPage(1);
            setRole(v);
          }}
          is_active={is_active}
          onActiveChange={(v) => {
            setPage(1);
            setIsActive(v);
          }}
          pageSize={pageSize}
          onPageSizeChange={(n) => {
            setPage(1);
            setPageSize(n);
          }}
        />

        {/* ────────── team rule filter ────────── */}
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-white/40">Team rule:</span>
          {(
            [
              { label: "All", value: undefined },
              { label: "Applied", value: "true" as const },
              { label: "Not applied", value: "false" as const },
            ] as const
          ).map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => {
                setPage(1);
                clearSelection();
                setTeamRule(opt.value);
              }}
              className={
                teamRule === opt.value
                  ? "rounded-full border border-teal-400/30 bg-teal-400/15 px-3 py-1 text-teal-300"
                  : "rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/60 hover:bg-white/10"
              }
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* ────────── bulk actions ────────── */}
        <BulkWithdrawRulesBar
          selectedIds={selectedIds}
          onDone={clearSelection}
        />

        <AdminUsersTable
          rows={users}
          loading={isLoading || isFetching}
          total={total}
          page={page}
          pageSize={pageSize}
          onPageChange={(p) => {
            clearSelection();
            setPage(p);
          }}
          onPageSizeChange={(n) => {
            setPage(1);
            setPageSize(n);
          }}
          onSortChange={handleSortChange}
          initialSort={initialSort}
          selectionModel={selection}
          onSelectionChange={setSelection}
        />
      </div>
    </main>
  );
};

export default AllUsersPage;
