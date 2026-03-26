import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SkeletonCard } from "@/components/Skeletons";
import ModalWrapper from "@/components/ModalWrapper";
import { budgets as mockBudgets, categoryIcons, delay, Budget } from "@/lib/mock-data";

const BudgetPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Budget[]>([]);
  const [editing, setEditing] = useState<Budget | null>(null);
  const [newLimit, setNewLimit] = useState("");

  useEffect(() => { delay(800).then(() => { setData(mockBudgets); setLoading(false); }); }, []);

  const handleSave = () => {
    if (!editing || !newLimit) return;
    setData((prev) => prev.map((b) => b.id === editing.id ? { ...b, limit: parseFloat(newLimit) } : b));
    setEditing(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Budget</h1>
        <div className="grid gap-4 sm:grid-cols-2">{[1, 2, 3, 4].map((i) => <SkeletonCard key={i} className="h-28" />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Budget</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {data.map((b, i) => {
          const pct = Math.round((b.spent / b.limit) * 100);
          const danger = pct >= 80;
          return (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => { setEditing(b); setNewLimit(String(b.limit)); }}
              className="glass-card cursor-pointer p-5 transition-colors hover:border-primary/30"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{categoryIcons[b.category] || "📌"}</span>
                  <span className="text-sm font-medium text-foreground">{b.category}</span>
                </div>
                <span className="text-xs text-muted-foreground">${b.spent} / ${b.limit}</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(pct, 100)}%` }}
                  transition={{ duration: 0.8, delay: i * 0.06 }}
                  className={`h-full rounded-full ${danger ? "bg-expense" : "bg-primary"}`}
                />
              </div>
              <p className={`mt-2 text-right text-xs font-medium ${danger ? "text-expense" : "text-primary"}`}>{pct}%</p>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {editing && (
          <ModalWrapper onClose={() => setEditing(null)}>
            <h3 className="text-lg font-semibold text-foreground">Edit Budget — {editing.category}</h3>
            <p className="mt-1 text-sm text-muted-foreground">Set the monthly spending limit for this category.</p>
            <div className="mt-4">
              <label className="text-sm text-muted-foreground">Monthly Limit ($)</label>
              <input autoFocus value={newLimit} onChange={(e) => setNewLimit(e.target.value)} type="number" className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setEditing(null)} className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
              <button onClick={handleSave} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Save</button>
            </div>
          </ModalWrapper>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BudgetPage;
