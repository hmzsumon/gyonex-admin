/* ────────── imports ────────── */
"use client";

import { AdminUserRow } from "@/redux/features/admin/adminUsersApi";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridRowSelectionModel,
  GridSortModel,
} from "@mui/x-data-grid";
import Link from "next/link";
import { useMemo } from "react";

/* ────────── helpers ────────── */
const StatusPill = ({ active }: { active: boolean }) => (
  <span
    className={
      active
        ? "rounded-full border border-emerald-400/30 bg-emerald-400/15 px-2 py-0.5 text-xs text-emerald-400"
        : "rounded-full border border-rose-400/30 bg-rose-400/15 px-2 py-0.5 text-xs text-rose-400"
    }
  >
    {active ? "active" : "inactive"}
  </span>
);

const TeamRulePill = ({ row }: { row: AdminUserRow }) => {
  if (!row?.require_team_activation)
    return <span className="text-xs text-white/30">—</span>;

  const activated = Number(row.addNewMember ?? 0);
  const required = Number(row.required_team_members ?? 3);
  const met = activated >= required;

  return (
    <span
      className={
        met
          ? "rounded-full border border-emerald-400/30 bg-emerald-400/15 px-2 py-0.5 text-xs text-emerald-400"
          : "rounded-full border border-amber-400/30 bg-amber-400/15 px-2 py-0.5 text-xs text-amber-300"
      }
    >
      {activated}/{required}
    </span>
  );
};

/* ────────── safe access helpers ────────── */
const toDateMs = (iso?: string | null) =>
  iso ? new Date(iso).getTime() : null;
const toDateLabel = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "-";

/* ────────── columns ────────── */
const columns: GridColDef<AdminUserRow>[] = [
  { field: "customerId", headerName: "Customer ID", width: 140 },
  { field: "name", headerName: "Name", width: 200 },
  { field: "email", headerName: "Email", width: 240 },
  { field: "phone", headerName: "Phone", width: 160 },
  { field: "country", headerName: "Country", width: 140 },
  { field: "role", headerName: "Role", width: 110 },

  {
    field: "is_active",
    headerName: "Status",
    width: 120,
    renderCell: (p: GridRenderCellParams<AdminUserRow>) => (
      <StatusPill active={!!(p?.row?.is_active ?? false)} />
    ),
  },
  {
    field: "createdAt",
    headerName: "Joined",
    width: 160,
    valueGetter: (p: any) => {
      const iso = p?.row?.createdAt as string | undefined;
      return toDateMs(iso ?? null);
    },
    renderCell: (p: GridRenderCellParams<AdminUserRow>) =>
      toDateLabel((p?.row?.createdAt as string | undefined) ?? null),
  },
  {
    field: "require_team_activation",
    headerName: "Team Rule",
    width: 120,
    align: "center",
    headerAlign: "center",
    sortable: false,
    renderCell: (p: GridRenderCellParams<AdminUserRow>) => (
      <TeamRulePill row={p.row} />
    ),
  },
  {
    field: "view",
    headerName: "",
    width: 80,
    align: "center",
    headerAlign: "center",
    sortable: false,
    renderCell: (p: GridRenderCellParams<AdminUserRow>) => {
      const id = p?.row?._id;
      return id ? (
        <Link
          href={`/users/${p.row._id}`}
          className="text-teal-300 hover:underline"
        >
          View
        </Link>
      ) : (
        <span className="text-white/30">—</span>
      );
    },
  },
];

/* ────────── component ────────── */
export default function AdminUsersTable(props: {
  rows: AdminUserRow[];
  loading: boolean;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (n: number) => void;
  onSortChange: (m: GridSortModel) => void;
  initialSort?: GridSortModel;
  /* ────────── bulk selection ────────── */
  selectionModel?: GridRowSelectionModel;
  onSelectionChange?: (m: GridRowSelectionModel) => void;
}) {
  const {
    rows,
    loading,
    total,
    page,
    pageSize,
    onPageChange,
    onPageSizeChange,
    onSortChange,
    initialSort,
    selectionModel,
    onSelectionChange,
  } = props;

  const dgRows = useMemo(
    () => rows.map((u) => ({ id: u._id ?? crypto.randomUUID(), ...u })),
    [rows],
  );

  return (
    <div className="h-[calc(100vh-260px)]">
      <DataGrid
        rows={dgRows}
        columns={columns}
        loading={loading}
        paginationMode="server"
        sortingMode="server"
        rowCount={total}
        pageSizeOptions={[10, 20, 50, 100, 200]}
        paginationModel={{ page: page - 1, pageSize }}
        onPaginationModelChange={(m) => {
          onPageChange(m.page + 1);
          onPageSizeChange(m.pageSize);
        }}
        onSortModelChange={onSortChange}
        initialState={
          initialSort ? { sorting: { sortModel: initialSort } } : undefined
        }
        /* community DataGrid এ header checkbox এমনিতেই শুধু
           visible rows সিলেক্ট করে — server pagination এর জন্য যা দরকার */
        checkboxSelection={!!onSelectionChange}
        rowSelectionModel={selectionModel}
        onRowSelectionModelChange={(m) => onSelectionChange?.(m)}
        disableRowSelectionOnClick
        columnHeaderHeight={44}
        getRowHeight={() => 56}
        sx={{
          bgcolor: "#0E1014",
          color: "#E6E6E6",
          border: "1px solid rgba(255,255,255,0.08)",
          "& .MuiDataGrid-columnHeaders": {
            bgcolor: "rgba(255,255,255,0.05)",
            color: "rgba(255,255,255,0.85)",
            fontSize: 12,
          },
          "& .MuiDataGrid-cell": {
            borderColor: "rgba(255,255,255,0.06)",
            fontSize: 12,
          },
          "& .MuiDataGrid-row:hover": { bgcolor: "rgba(255,255,255,0.03)" },
          "& .MuiTablePagination-root": { color: "rgba(255,255,255,0.75)" },
        }}
      />
    </div>
  );
}
