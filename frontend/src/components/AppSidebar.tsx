import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  BarChart3,
  Settings,
  LogOut,
  MessageSquareText,
} from "lucide-react";
import WorkspaceSwitcher from "./WorkspaceSwitcher";
import { useAuth } from "@/contexts/AuthContext";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/expenses", label: "Expenses", icon: Receipt },
  { to: "/budget", label: "Budget", icon: PiggyBank },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/chat", label: "AI Assistant", icon: MessageSquareText },
  { to: "/settings", label: "Settings", icon: Settings },
];

const AppSidebar = () => {
  const { logout, user } = useAuth();
  const location = useLocation();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-sidebar">
      <WorkspaceSwitcher />
      <nav className="flex-1 space-y-1 px-3">
        {links.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary/15 text-primary"
                  : "text-sidebar-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              {label === "AI Assistant" && (
                <span className="ml-auto rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                  AI
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {user?.name || "User"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.email || ""}
            </p>
          </div>
          <button
            onClick={logout}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
