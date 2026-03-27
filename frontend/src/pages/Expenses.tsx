import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, X, Sparkles, Loader2 } from "lucide-react";
import { SkeletonRow } from "@/components/Skeletons";
import { categoryIcons } from "@/lib/mock-data";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Expenses = () => {
  const { current: workspace } = useWorkspace();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [memberFilter, setMemberFilter] = useState("");
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newRow, setNewRow] = useState({
    title: "",
    amount: "",
    category_id: "",
  });
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!workspace.id || workspace.id === "0") return;
    Promise.all([
      api.get(`/workspaces/${workspace.id}/expenses`),
      api.get(`/workspaces/${workspace.id}/categories`),
      api.get(`/workspaces/${workspace.id}/members`),
    ])
      .then(([expRes, catRes, memRes]) => {
        setData(expRes.data);
        setCategories(catRes.data);
        setMembers(memRes.data);
        if (catRes.data.length > 0) {
          setNewRow((p) => ({ ...p, category_id: String(catRes.data[0].id) }));
        }
      })
      .finally(() => setLoading(false));
  }, [workspace.id]);

  const handleAiCategorize = async () => {
    if (!newRow.title.trim() || categories.length === 0) return;
    setAiLoading(true);
    try {
      const res = await api.post("/ai/categorize", { title: newRow.title });
      const suggestedName = res.data?.category;
      const matched = categories.find(
        (c) => c.name.toLowerCase() === suggestedName?.toLowerCase(),
      );
      if (matched) {
        setNewRow((p) => ({ ...p, category_id: String(matched.id) }));
        toast.success(`AI suggested: ${matched.name}`);
      } else {
        toast.info("AI couldn't find a matching category.");
      }
    } catch {
      toast.error("AI categorization failed. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newRow.title.trim() || !newRow.amount || !newRow.category_id) {
      toast.warning("Please fill in the title, amount, and category.");
      return;
    }
    setSaving(true);
    try {
      const res = await api.post(`/workspaces/${workspace.id}/expenses`, {
        title: newRow.title,
        amount: parseFloat(newRow.amount),
        date: new Date().toISOString().split("T")[0],
        category_id: parseInt(newRow.category_id),
      });
      setData((prev) => [res.data, ...prev]);
      setNewRow({
        title: "",
        amount: "",
        category_id: String(categories[0]?.id || ""),
      });
      setAdding(false);
      toast.success("Expense added successfully.");
    } catch {
      toast.error(
        "Failed to save expense. Ensure you have a category created in Settings.",
      );
    } finally {
      setSaving(false);
    }
  };

  const filtered = data.filter((tx) => {
    if (search && !tx.title?.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (catFilter && String(tx.category?.id) !== catFilter) return false;
    if (memberFilter && tx.member !== memberFilter) return false;
    return true;
  });

  const selectClass =
    "rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary";

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Expenses</h1>
        <div className="glass-card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                <th className="px-5 py-3">Description</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Member</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  <td colSpan={5}>
                    <SkeletonRow />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Expenses</h1>
        <button
          onClick={() => {
            if (categories.length === 0) {
              toast.warning(
                "Please create at least one category in Settings before adding expenses.",
              );
              return;
            }
            setAdding(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Add Expense
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search expenses..."
            className="w-full rounded-lg border border-border bg-secondary py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className={selectClass}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={memberFilter}
          onChange={(e) => setMemberFilter(e.target.value)}
          className={selectClass}
        >
          <option value="">All Members</option>
          {members.map((m) => (
            <option key={m.id} value={m.name}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase text-muted-foreground">
              <th className="px-5 py-3">Description</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Member</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <AnimatePresence>
              {adding && (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-muted/30"
                >
                  <td className="px-5 py-2">
                    <div className="flex items-center gap-1.5">
                      <input
                        autoFocus
                        value={newRow.title}
                        onChange={(e) =>
                          setNewRow({ ...newRow, title: e.target.value })
                        }
                        placeholder="Description"
                        className="flex-1 rounded border border-border bg-background px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={handleAiCategorize}
                              disabled={aiLoading || !newRow.title.trim()}
                              className="flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                              {aiLoading ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Sparkles className="h-3 w-3" />
                              )}
                              AI
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {newRow.title.trim()
                              ? "AI Suggest Category"
                              : "Enter a title first"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </td>
                  <td className="px-5 py-2">
                    <select
                      value={newRow.category_id}
                      onChange={(e) =>
                        setNewRow({ ...newRow, category_id: e.target.value })
                      }
                      className="rounded border border-border bg-background px-2 py-1.5 text-sm text-foreground"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={String(c.id)}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-2 text-muted-foreground text-sm">
                    You
                  </td>
                  <td className="px-5 py-2 text-muted-foreground text-sm">
                    {new Date().toISOString().split("T")[0]}
                  </td>
                  <td className="px-5 py-2">
                    <div className="flex items-center gap-2 justify-end">
                      <input
                        value={newRow.amount}
                        onChange={(e) =>
                          setNewRow({ ...newRow, amount: e.target.value })
                        }
                        placeholder="0.00"
                        type="number"
                        className="w-24 rounded border border-border bg-background px-2 py-1.5 text-right text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                      />
                      <button
                        onClick={handleAdd}
                        disabled={saving}
                        className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground disabled:opacity-50"
                      >
                        {saving ? "..." : "Save"}
                      </button>
                      <button
                        onClick={() => setAdding(false)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              )}
            </AnimatePresence>

            {filtered.length === 0 && !adding ? (
              <tr>
                <td colSpan={5}>
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    {data.length === 0
                      ? 'No expenses yet. Click "Add Expense" to get started.'
                      : "No expenses match your filters."}
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((tx) => (
                <tr key={tx.id} className="transition-colors hover:bg-muted/20">
                  <td className="px-5 py-3 font-medium text-foreground">
                    <span className="mr-2">
                      {categoryIcons[tx.category?.name] ||
                        tx.category?.icon ||
                        "📌"}
                    </span>
                    {tx.title}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {tx.category?.name || "—"}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {tx.member || "—"}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{tx.date}</td>
                  <td className="px-5 py-3 text-right font-semibold text-expense">
                    -${parseFloat(tx.amount).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Expenses;
