import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { SkeletonCard } from "@/components/Skeletons";
import ModalWrapper from "@/components/ModalWrapper";
import { categoryIcons } from "@/lib/mock-data";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import api from "@/lib/api";
import { toast } from "sonner";

const BudgetPage = () => {
  const { current: workspace } = useWorkspace();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);
  const [newLimit, setNewLimit] = useState("");
  const [newBudget, setNewBudget] = useState({
    category_id: "",
    monthly_limit: "",
    month: "",
  });

  const currentMonth = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    if (!workspace.id || workspace.id === "0") return;
    Promise.all([
      api.get(`/workspaces/${workspace.id}/budgets?month=${currentMonth}`),
      api.get(`/workspaces/${workspace.id}/categories`),
    ])
      .then(([budgetRes, catRes]) => {
        setData(budgetRes.data);
        setCategories(catRes.data);
        if (catRes.data.length > 0) {
          setNewBudget((p) => ({
            ...p,
            category_id: String(catRes.data[0].id),
            month: currentMonth,
          }));
        }
      })
      .finally(() => setLoading(false));
  }, [workspace.id]);

  const handleSave = async () => {
    if (!editing || !newLimit) return;
    try {
      await api.put(`/workspaces/${workspace.id}/budgets/${editing.id}`, {
        monthly_limit: parseFloat(newLimit),
      });
      setData((prev) =>
        prev.map((b) =>
          b.id === editing.id
            ? { ...b, monthly_limit: parseFloat(newLimit) }
            : b,
        ),
      );
      toast.success("Budget updated successfully.");
    } catch {
      toast.error("Failed to update budget. Please try again.");
    }
    setEditing(null);
  };

  const handleCreate = async () => {
    if (!newBudget.category_id || !newBudget.monthly_limit) {
      toast.warning("Please select a category and enter a monthly limit.");
      return;
    }
    try {
      await api.post(`/workspaces/${workspace.id}/budgets`, {
        category_id: parseInt(newBudget.category_id),
        monthly_limit: parseFloat(newBudget.monthly_limit),
        month: newBudget.month || currentMonth,
      });
      const refreshed = await api.get(
        `/workspaces/${workspace.id}/budgets?month=${currentMonth}`,
      );
      setData(refreshed.data);
      setCreating(false);
      setNewBudget((p) => ({ ...p, monthly_limit: "" }));
      toast.success("Budget created successfully.");
    } catch {
      toast.error(
        "Failed to create budget. This category may already have a budget for this month.",
      );
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Budget</h1>
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Budget</h1>
        <button
          onClick={() => {
            if (categories.length === 0) {
              toast.warning(
                "Please create at least one category in Settings before setting a budget.",
              );
              return;
            }
            setCreating(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Set Budget
        </button>
      </div>

      {data.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-muted-foreground text-sm">
            No budgets set for {currentMonth}. Click "Set Budget" to get
            started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.map((b, i) => {
            const pct = Math.round((b.spent / b.monthly_limit) * 100);
            const danger = pct >= 80;
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => {
                  setEditing(b);
                  setNewLimit(String(b.monthly_limit));
                }}
                className="glass-card cursor-pointer p-5 transition-colors hover:border-primary/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {b.category?.icon ||
                        categoryIcons[b.category?.name] ||
                        "📌"}
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {b.category?.name}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ${parseFloat(b.spent).toFixed(2)} / $
                    {parseFloat(b.monthly_limit).toFixed(2)}
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(pct, 100)}%` }}
                    transition={{ duration: 0.8, delay: i * 0.06 }}
                    className={`h-full rounded-full ${danger ? "bg-expense" : "bg-primary"}`}
                  />
                </div>
                <p
                  className={`mt-2 text-right text-xs font-medium ${danger ? "text-expense" : "text-primary"}`}
                >
                  {pct}% used
                </p>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Budget Modal */}
      <AnimatePresence>
        {creating && (
          <ModalWrapper onClose={() => setCreating(false)}>
            <h3 className="text-lg font-semibold text-foreground">
              Set Budget
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Set a monthly spending limit for a category.
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs text-muted-foreground">
                  Category
                </label>
                <select
                  value={newBudget.category_id}
                  onChange={(e) =>
                    setNewBudget({ ...newBudget, category_id: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Month</label>
                <input
                  type="month"
                  value={newBudget.month}
                  onChange={(e) =>
                    setNewBudget({ ...newBudget, month: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">
                  Monthly Limit ($)
                </label>
                <input
                  autoFocus
                  type="number"
                  value={newBudget.monthly_limit}
                  onChange={(e) =>
                    setNewBudget({
                      ...newBudget,
                      monthly_limit: e.target.value,
                    })
                  }
                  placeholder="e.g. 500"
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setCreating(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Set Budget
              </button>
            </div>
          </ModalWrapper>
        )}
      </AnimatePresence>

      {/* Edit Budget Modal */}
      <AnimatePresence>
        {editing && (
          <ModalWrapper onClose={() => setEditing(null)}>
            <h3 className="text-lg font-semibold text-foreground">
              Edit Budget — {editing.category?.name}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Update the monthly spending limit.
            </p>
            <div className="mt-4">
              <label className="text-sm text-muted-foreground">
                Monthly Limit ($)
              </label>
              <input
                autoFocus
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
                type="number"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditing(null)}
                className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Save
              </button>
            </div>
          </ModalWrapper>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BudgetPage;
