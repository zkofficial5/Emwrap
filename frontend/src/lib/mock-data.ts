export interface Workspace {
  id: string;
  name: string;
  memberCount: number;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "expense" | "income";
  category: string;
  date: string;
  member: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
}

export interface MonthlyReport {
  month: string;
  total: number;
}

export const workspaces: Workspace[] = [
  { id: "1", name: "Acme Corp", memberCount: 8 },
  { id: "2", name: "Side Project", memberCount: 3 },
  { id: "3", name: "Personal", memberCount: 1 },
];

export const categoryIcons: Record<string, string> = {
  "Food & Dining": "🍔",
  Transport: "🚗",
  Software: "💻",
  Marketing: "📣",
  Utilities: "⚡",
  Entertainment: "🎬",
  Office: "🏢",
  Travel: "✈️",
  Income: "💰",
};

export const categories = Object.keys(categoryIcons).filter((c) => c !== "Income");

export const transactions: Transaction[] = [
  { id: "1", description: "Team lunch", amount: 124.5, type: "expense", category: "Food & Dining", date: "2026-03-22", member: "Alice" },
  { id: "2", description: "Uber ride", amount: 32.0, type: "expense", category: "Transport", date: "2026-03-21", member: "Bob" },
  { id: "3", description: "Figma subscription", amount: 15.0, type: "expense", category: "Software", date: "2026-03-20", member: "Alice" },
  { id: "4", description: "Client payment", amount: 5000.0, type: "income", category: "Income", date: "2026-03-19", member: "Alice" },
  { id: "5", description: "Google Ads", amount: 340.0, type: "expense", category: "Marketing", date: "2026-03-18", member: "Carol" },
  { id: "6", description: "Electric bill", amount: 89.0, type: "expense", category: "Utilities", date: "2026-03-17", member: "Bob" },
  { id: "7", description: "Movie night", amount: 45.0, type: "expense", category: "Entertainment", date: "2026-03-16", member: "Carol" },
  { id: "8", description: "Office supplies", amount: 67.5, type: "expense", category: "Office", date: "2026-03-15", member: "Alice" },
  { id: "9", description: "Flight to NYC", amount: 420.0, type: "expense", category: "Travel", date: "2026-03-14", member: "Bob" },
  { id: "10", description: "Freelance work", amount: 1200.0, type: "income", category: "Income", date: "2026-03-13", member: "Carol" },
];

export const budgets: Budget[] = [
  { id: "1", category: "Food & Dining", limit: 500, spent: 380 },
  { id: "2", category: "Transport", limit: 200, spent: 175 },
  { id: "3", category: "Software", limit: 100, spent: 45 },
  { id: "4", category: "Marketing", limit: 1000, spent: 820 },
  { id: "5", category: "Utilities", limit: 150, spent: 89 },
  { id: "6", category: "Entertainment", limit: 200, spent: 45 },
  { id: "7", category: "Office", limit: 300, spent: 67 },
  { id: "8", category: "Travel", limit: 1000, spent: 420 },
];

export const monthlyReports: MonthlyReport[] = [
  { month: "Oct", total: 3200 },
  { month: "Nov", total: 4100 },
  { month: "Dec", total: 3800 },
  { month: "Jan", total: 2900 },
  { month: "Feb", total: 3500 },
  { month: "Mar", total: 4200 },
];

export const categoryBreakdown = [
  { name: "Food & Dining", value: 380, fill: "hsl(160, 64%, 40%)" },
  { name: "Transport", value: 175, fill: "hsl(200, 70%, 50%)" },
  { name: "Software", value: 45, fill: "hsl(270, 60%, 55%)" },
  { name: "Marketing", value: 820, fill: "hsl(35, 90%, 55%)" },
  { name: "Utilities", value: 89, fill: "hsl(50, 80%, 50%)" },
  { name: "Entertainment", value: 45, fill: "hsl(330, 60%, 55%)" },
  { name: "Office", value: 67, fill: "hsl(180, 50%, 45%)" },
  { name: "Travel", value: 420, fill: "hsl(0, 65%, 55%)" },
];

// Simulate API delay
export const delay = (ms = 800) => new Promise((r) => setTimeout(r, ms));
