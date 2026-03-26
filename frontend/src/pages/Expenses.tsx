import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Plus, X, Sparkles, Loader2 } from "lucide-react";
import { SkeletonRow } from "@/components/Skeletons";
import { transactions as mockTx, categories, categoryIcons, delay, Transaction } from "@/lib/mock-data";
import api from "@/lib/api";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const members = ["Alice", "Bob", "Carol"];

const Expenses = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Transaction[]>([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [memberFilter, setMemberFilter] = useState("");
  const [adding, setAdding] = useState(false);
  const [newRow, setNewRow] = useState({ description: "", amount: "", category: categories[0], member: members[0] });
  const [aiLoading, setAiLoading] = useState(false);

  const handleAiCategorize = async () => {
    if (!newRow.description.trim()) return;
    setAiLoading(true);
    try {
      const res = await api.post("/ai/categorize", { title: newRow.description });
      const suggested = res.data?.category_id || res.data?.category;
      if (suggested && categories.includes(suggested)) {
        setNewRow((prev) => ({ ...prev, category: suggested }));
      }
    } catch {
      // silently fail
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => { delay(800).then(() => { setData(mockTx); setLoading(false); }); }, []);

  const filtered = data.filter((tx) => {
    if (search && !tx.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (catFilter && tx.category !== catFilter) return false;
    if (memberFilter && tx.member !== memberFilter) return false;
    return true;
  });

  const handleAdd = () => {
    if (!newRow.description || !newRow.amount) return;
    const tx: Transaction = {
      id: String(Date.now()),
      description: newRow.description,
      amount: parseFloat(newRow.amount),
      type: "expense",
      category: newRow.category,
      date: new Date().toISOString().split("T")[0],
      member: newRow.member,
    };
    setData((prev) => [tx, ...prev]);
    setNewRow({ description: "", amount: "", category: categories[0], member: members[0] });
    setAdding(false);
  };

  const selectClass = "rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Expenses</h1>
        <button onClick={() => setAdding(true)} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Add Expense
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search expenses..." className="w-full rounded-lg border border-border bg-secondary py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className={selectClass}>
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={memberFilter} onChange={(e) => setMemberFilter(e.target.value)} className={selectClass}>
          <option value="">All Members</option>
          {members.map((m) => <option key={m} value={m}>{m}</option>)}
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
                <motion.tr initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-muted/30">
                  <td className="px-5 py-2">
                    <div className="flex items-center gap-1.5">
                      <input autoFocus value={newRow.description} onChange={(e) => setNewRow({ ...newRow, description: e.target.value })} placeholder="Description" className="flex-1 rounded border border-border bg-background px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={handleAiCategorize}
                              disabled={aiLoading || !newRow.description.trim()}
                              className="flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                              {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                              AI
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {newRow.description.trim() ? "AI Suggest Category" : "Enter a title first"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </td>
                  <td className="px-5 py-2">
                    <select value={newRow.category} onChange={(e) => setNewRow({ ...newRow, category: e.target.value })} className="rounded border border-border bg-background px-2 py-1.5 text-sm text-foreground">
                      {categories.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </td>
                  <td className="px-5 py-2">
                    <select value={newRow.member} onChange={(e) => setNewRow({ ...newRow, member: e.target.value })} className="rounded border border-border bg-background px-2 py-1.5 text-sm text-foreground">
                      {members.map((m) => <option key={m}>{m}</option>)}
                    </select>
                  </td>
                  <td className="px-5 py-2 text-muted-foreground">{new Date().toISOString().split("T")[0]}</td>
                  <td className="px-5 py-2">
                    <div className="flex items-center gap-2 justify-end">
                      <input value={newRow.amount} onChange={(e) => setNewRow({ ...newRow, amount: e.target.value })} placeholder="0.00" type="number" className="w-24 rounded border border-border bg-background px-2 py-1.5 text-right text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
                      <button onClick={handleAdd} className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground">Save</button>
                      <button onClick={() => setAdding(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                    </div>
                  </td>
                </motion.tr>
              )}
            </AnimatePresence>
            {loading
              ? [1, 2, 3, 4, 5].map((i) => <tr key={i}><td colSpan={5}><SkeletonRow /></td></tr>)
              : filtered.map((tx) => (
                  <tr key={tx.id} className="transition-colors hover:bg-muted/20">
                    <td className="px-5 py-3 font-medium text-foreground">
                      <span className="mr-2">{categoryIcons[tx.category] || "📌"}</span>
                      {tx.description}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{tx.category}</td>
                    <td className="px-5 py-3 text-muted-foreground">{tx.member}</td>
                    <td className="px-5 py-3 text-muted-foreground">{tx.date}</td>
                    <td className={`px-5 py-3 text-right font-semibold ${tx.type === "income" ? "text-success" : "text-expense"}`}>
                      {tx.type === "income" ? "+" : "-"}${tx.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No expenses found.</p>
        )}
      </div>
    </div>
  );
};

export default Expenses;
