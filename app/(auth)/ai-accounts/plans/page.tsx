"use client";

/* ──────────────────────────────────────────────────────────────────────────
   Manage AI Plans — list / create / edit / delete AI plans.
   Creating a plan auto-activates one account for the admin who created it
   (admin-only — never applies to regular users).
────────────────────────────────────────────────────────────────────────── */
import {
  IAiPlan,
  IAiPlanRow,
  useCreateAiPlanMutation,
  useDeleteAiPlanMutation,
  useGetAllAiPlansAdminQuery,
  useUpdateAiPlanMutation,
} from "@/redux/features/ai-account/ai-accountApi";
import {
  Bot,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

/* ────────── api error message resolver ────────── */
const getApiMessage = (error: any, fallback: string) =>
  error?.data?.error ||
  error?.data?.message ||
  error?.error ||
  error?.message ||
  fallback;

/* ────────── form state ────────── */
type FormState = {
  key: string;
  title: string;
  subtitle: string;
  amount: string;
  sortOrder: string;
  isActive: boolean;
  rows: IAiPlanRow[];
};

const emptyForm: FormState = {
  key: "",
  title: "",
  subtitle: "",
  amount: "",
  sortOrder: "0",
  isActive: true,
  rows: [],
};

export default function ManageAiPlansPage() {
  const { data, isLoading, isFetching } = useGetAllAiPlansAdminQuery();
  const [createAiPlan, { isLoading: creating }] = useCreateAiPlanMutation();
  const [updateAiPlan, { isLoading: updating }] = useUpdateAiPlanMutation();
  const [deleteAiPlan, { isLoading: deleting }] = useDeleteAiPlanMutation();

  const plans = data?.items ?? [];

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<IAiPlan | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (plan: IAiPlan) => {
    setEditing(plan);
    setForm({
      key: plan.key,
      title: plan.title,
      subtitle: plan.subtitle,
      amount: String(plan.amount),
      sortOrder: String(plan.sortOrder ?? 0),
      isActive: plan.isActive,
      rows: plan.rows ?? [],
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const updateRow = (idx: number, patch: Partial<IAiPlanRow>) => {
    setForm((prev) => ({
      ...prev,
      rows: prev.rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)),
    }));
  };

  const addRow = () =>
    setForm((prev) => ({
      ...prev,
      rows: [...prev.rows, { label: "", value: "" }],
    }));

  const removeRow = (idx: number) =>
    setForm((prev) => ({
      ...prev,
      rows: prev.rows.filter((_, i) => i !== idx),
    }));

  const handleSubmit = async () => {
    const amt = Number(form.amount);
    if (!form.title.trim() || !form.subtitle.trim()) {
      toast.error("Title and subtitle are required");
      return;
    }
    if (!Number.isFinite(amt) || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (!editing && !form.key.trim()) {
      toast.error("Plan key is required");
      return;
    }

    const rows = form.rows.filter((r) => r.label.trim() && r.value.trim());

    try {
      if (editing) {
        await updateAiPlan({
          id: editing._id,
          title: form.title.trim(),
          subtitle: form.subtitle.trim(),
          amount: amt,
          sortOrder: Number(form.sortOrder) || 0,
          isActive: form.isActive,
          rows,
        }).unwrap();
        toast.success("Plan updated");
      } else {
        const res = await createAiPlan({
          key: form.key.trim().toLowerCase(),
          title: form.title.trim(),
          subtitle: form.subtitle.trim(),
          amount: amt,
          sortOrder: Number(form.sortOrder) || 0,
          isActive: form.isActive,
          rows,
        }).unwrap();
        toast.success(
          res.adminAccount
            ? "Plan created — an admin account was auto-activated for it."
            : "Plan created",
        );
      }
      closeForm();
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to save plan"));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAiPlan({ id }).unwrap();
      toast.success("Plan deleted");
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to delete plan"));
    } finally {
      setConfirmDeleteId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#0b0e11] text-white">
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <Bot className="h-6 w-6 text-emerald-400" />
              Manage AI Plans
            </h1>
            <p className="mt-1 text-sm text-neutral-400">
              Change price / name, add new plans, or delete unused ones.
              {isFetching && !isLoading ? " Refreshing…" : ""}
            </p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-black transition hover:bg-emerald-400"
          >
            <Plus className="h-4 w-4" />
            Add Plan
          </button>
        </div>

        {isLoading && (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-sm text-neutral-400">
            Loading plans...
          </div>
        )}

        {!isLoading && plans.length === 0 && (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-sm text-neutral-400">
            No plans found. Click "Add Plan" to create the first one.
          </div>
        )}

        {!isLoading && plans.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((p) => (
              <div
                key={p._id}
                className={`rounded-2xl border p-4 ${
                  p.isActive
                    ? "border-neutral-800 bg-neutral-900/60"
                    : "border-neutral-800/60 bg-neutral-900/30 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-lg font-bold">{p.title}</div>
                    <div className="text-xs text-neutral-400">
                      {p.subtitle}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      p.isActive
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-neutral-700/40 text-neutral-400"
                    }`}
                  >
                    {p.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs">
                  <span className="rounded bg-neutral-800 px-2 py-1 text-neutral-300">
                    key: {p.key}
                  </span>
                  <span className="rounded bg-neutral-800 px-2 py-1 text-neutral-300">
                    order: {p.sortOrder}
                  </span>
                </div>

                <div className="mt-3 text-2xl font-black text-emerald-400">
                  ${p.amount}
                </div>

                {p.rows?.length > 0 && (
                  <div className="mt-3 space-y-1 border-t border-neutral-800 pt-3">
                    {p.rows.map((r, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs text-neutral-400"
                      >
                        <span>{r.label}</span>
                        <span className="text-neutral-200">{r.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => openEdit(p)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-neutral-700 py-2 text-xs font-semibold text-neutral-200 transition hover:bg-neutral-800"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>

                  {confirmDeleteId === p._id ? (
                    <>
                      <button
                        onClick={() => handleDelete(p._id)}
                        disabled={deleting}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-500/90 py-2 text-xs font-semibold text-white transition hover:bg-red-500 disabled:opacity-60"
                      >
                        {deleting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          "Confirm delete"
                        )}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="rounded-xl border border-neutral-700 px-3 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-800"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(p._id)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ────────── Add / Edit modal ────────── */}
      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={(e) => e.target === e.currentTarget && closeForm()}
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {editing ? "Edit Plan" : "Add New Plan"}
              </h2>
              <button
                onClick={closeForm}
                className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-900 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-400">
                  Key {editing && "(cannot be changed)"}
                </label>
                <input
                  value={form.key}
                  disabled={!!editing}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, key: e.target.value }))
                  }
                  placeholder="e.g. lite, core, prime"
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-emerald-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-400">
                  Title
                </label>
                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="e.g. Lite Plan"
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-400">
                  Subtitle
                </label>
                <input
                  value={form.subtitle}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, subtitle: e.target.value }))
                  }
                  placeholder="Short description"
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-neutral-400">
                    Amount (USD)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.amount}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, amount: e.target.value }))
                    }
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-neutral-400">
                    Sort order
                  </label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, sortOrder: e.target.value }))
                    }
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-neutral-300">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, isActive: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 accent-emerald-500"
                />
                Active (visible to users on the client site)
              </label>

              {/* ── rows (feature list) ── */}
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="block text-xs font-semibold text-neutral-400">
                    Feature rows
                  </label>
                  <button
                    onClick={addRow}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                  >
                    + Add row
                  </button>
                </div>
                <div className="space-y-2">
                  {form.rows.map((r, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        value={r.label}
                        onChange={(e) =>
                          updateRow(idx, { label: e.target.value })
                        }
                        placeholder="Label"
                        className="w-1/2 rounded-lg border border-neutral-800 bg-neutral-900 px-2 py-1.5 text-xs outline-none focus:border-emerald-500"
                      />
                      <input
                        value={r.value}
                        onChange={(e) =>
                          updateRow(idx, { value: e.target.value })
                        }
                        placeholder="Value"
                        className="w-1/2 rounded-lg border border-neutral-800 bg-neutral-900 px-2 py-1.5 text-xs outline-none focus:border-emerald-500"
                      />
                      <button
                        onClick={() => removeRow(idx)}
                        className="shrink-0 rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-900 hover:text-red-400"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {!editing && (
                <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-300">
                  Creating this plan will automatically activate one account
                  for your admin login — this does not affect regular users.
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSubmit}
                  disabled={creating || updating}
                  className="flex-1 rounded-xl bg-emerald-500 py-2.5 text-sm font-bold text-black transition hover:bg-emerald-400 disabled:opacity-60"
                >
                  {creating || updating ? (
                    <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                  ) : editing ? (
                    "Save changes"
                  ) : (
                    "Create plan"
                  )}
                </button>
                <button
                  onClick={closeForm}
                  className="rounded-xl border border-neutral-700 px-4 py-2.5 text-sm font-semibold text-neutral-300 hover:bg-neutral-900"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
