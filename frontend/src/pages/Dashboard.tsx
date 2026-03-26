import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Sparkles, RefreshCw } from "lucide-react";
import NumberTicker from "@/components/NumberTicker";
import { SkeletonCard, SkeletonRow } from "@/components/Skeletons";
import { transactions, categoryBreakdown, categoryIcons, delay } from "@/lib/mock-data";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import api from "@/lib/api";

const statCards = [
  { label: "Monthly Spending", value: 2041, icon: DollarSign, trend: "+12%" },
  { label: "Total Income", value: 6200, icon: TrendingUp, trend: "+8%" },
  { label: "Net Savings", value: 4159, icon: TrendingDown, trend: "+23%" },
  { label: "Transactions", value: 47, icon: CreditCard, prefix: "", trend: "+5" },
];

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const { current: workspace } = useWorkspace();
  const [insights, setInsights] = useState<string[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsFetched, setInsightsFetched] = useState(false);

  useEffect(() => {
    delay(1000).then(() => setLoading(false));
  }, []);

  const fetchInsights = async () => {
    setInsightsLoading(true);
    try {
      const res = await api.get(`/ai/insights?workspace_id=${workspace.id}`);
      setInsights(res.data?.insights || []);
      setInsightsFetched(true);
    } catch {
      setInsights([]);
      setInsightsFetched(true);
    } finally {
      setInsightsLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) fetchInsights();
  }, [loading, workspace.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <SkeletonCard className="h-72" />
          <div className="space-y-0 rounded-xl border border-glass-border bg-card/60 backdrop-blur-xl">
            {[1, 2, 3, 4, 5].map((i) => <SkeletonRow key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-2xl font-bold text-foreground"
      >
        Dashboard
      </motion.h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -2 }}
            className="glass-card p-5 group cursor-default"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <motion.div
                whileHover={{ rotate: 15 }}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors"
              >
                <card.icon className="h-4 w-4 text-primary" />
              </motion.div>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">
              <NumberTicker value={card.value} prefix={card.prefix ?? "$"} />
            </p>
            <p className="mt-1 text-xs font-medium text-primary">{card.trend} from last month</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Spending by Category</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value">
                {categoryBreakdown.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(240, 5%, 14%)", border: "1px solid hsl(240, 4%, 22%)", borderRadius: "8px", color: "#fff" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex flex-wrap gap-3">
            {categoryBreakdown.map((c) => (
              <div key={c.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="inline-block h-2.5 w-2.5 rounded-full glow-dot" style={{ backgroundColor: c.fill, color: c.fill }} />
                {c.name}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">AI Spending Insights</h2>
            </div>
            <button onClick={fetchInsights} disabled={insightsLoading} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:text-primary hover:bg-primary/10 disabled:opacity-50">
              <RefreshCw className={`h-3.5 w-3.5 ${insightsLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
          <AnimatePresence mode="wait">
            {insightsLoading ? (
              <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted animate-pulse" />
                    <div className="flex-1 h-3 rounded bg-muted animate-pulse" />
                  </div>
                ))}
              </motion.div>
            ) : insights.length > 0 ? (
              <motion.ul key="insights" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2.5">
                {insights.map((insight, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary glow-dot" style={{ color: "hsl(var(--primary))" }} />
                    {insight}
                  </motion.li>
                ))}
              </motion.ul>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center py-4">
                <button onClick={fetchInsights} className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20">
                  <Sparkles className="h-4 w-4" /> Generate Insights
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card overflow-hidden">
          <h2 className="p-5 pb-3 text-sm font-semibold text-foreground">Recent Transactions</h2>
          <div className="divide-y divide-border">
            {transactions.slice(0, 6).map((tx, i) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.08 }}
                whileHover={{ backgroundColor: "hsl(var(--muted) / 0.3)" }}
                className="flex items-center gap-4 px-5 py-3 transition-colors cursor-default"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-lg">
                  {categoryIcons[tx.category] || "📌"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{tx.description}</p>
                  <p className="text-xs text-muted-foreground">{tx.date} · {tx.member}</p>
                </div>
                <span className={`text-sm font-semibold ${tx.type === "income" ? "text-success" : "text-expense"}`}>
                  {tx.type === "income" ? "+" : "-"}${tx.amount.toLocaleString()}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
