"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   Admin loan toast
   Success/error message top-right এ দেখাবে।
────────────────────────────────────────────────────────────── */
export default function AdminLoanToast({
  toast,
}: {
  toast: { msg: string; ok: boolean } | null;
}) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed right-5 top-14 z-50 flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold shadow-xl"
          style={{
            background: "#0D1320",
            border: `1px solid ${
              toast.ok ? "rgba(16,217,128,0.4)" : "rgba(240,75,85,0.4)"
            }`,
            color: toast.ok ? "#10D980" : "#F04B55",
          }}
        >
          {toast.ok ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          {toast.msg}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
