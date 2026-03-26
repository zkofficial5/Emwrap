import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Sparkles, ChevronDown, Download, Loader2 } from "lucide-react";
import { SkeletonCard } from "@/components/Skeletons";
import { monthlyReports, delay } from "@/lib/mock-data";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import api from "@/lib/api";

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const { current: workspace } = useWorkspace();
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(monthlyReports[monthlyReports.length - 1].month);

  useEffect(() => { delay(800).then(() => setLoading(false)); }, []);

  const fetchSummary = async () => {
    setSummaryLoading(true);
    setSummaryOpen(true);
    try {
      const res = await api.get(`/ai/report-summary?workspace_id=${workspace.id}&month=${selectedMonth}`);
      setSummary(res.data?.summary || "No summary available.");
    } catch {
      setSummary("Unable to generate summary at this time.");
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleDownloadWithAi = async () => {
    try {
      const res = await api.get(`/workspaces/${workspace.id}/reports/export?ai=true`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${selectedMonth}-ai.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      // silently fail
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <SkeletonCard className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Reports</h1>
      {/* AI Summary Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
        <div className="flex items-center justify-between p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">AI Monthly Summary</h2>
          </div>
          <div className="flex items-center gap-2">
            {summary && (
              <button onClick={handleDownloadWithAi} className="flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20">
                <Download className="h-3 w-3" /> Download with AI Summary
              </button>
            )}
            {!summary ? (
              <button onClick={fetchSummary} disabled={summaryLoading} className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
                {summaryLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                Generate AI Summary
              </button>
            ) : (
              <button onClick={() => setSummaryOpen(!summaryOpen)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground">
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${summaryOpen ? "rotate-180" : ""}`} />
              </button>
            )}
          </div>
        </div>
        <AnimatePresence>
          {summaryOpen && summary && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mx-5 mb-5 rounded-lg border border-primary/20 bg-primary/5 p-4" style={{ borderImage: "linear-gradient(135deg, hsl(var(--primary) / 0.3), hsl(var(--primary) / 0.05)) 1" }}>
                <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
        <h2 className="mb-6 text-sm font-semibold text-foreground">Month-over-Month Spending</h2>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={monthlyReports} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 4%, 20%)" />
            <XAxis dataKey="month" stroke="hsl(240, 5%, 55%)" fontSize={12} />
            <YAxis stroke="hsl(240, 5%, 55%)" fontSize={12} tickFormatter={(v) => `$${v}`} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(240, 5%, 14%)", border: "1px solid hsl(240, 4%, 22%)", borderRadius: "8px", color: "#fff" }} formatter={(v: number) => [`$${v.toLocaleString()}`, "Total"]} />
            <Bar dataKey="total" fill="hsl(160, 64%, 40%)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};

export default Reports;
