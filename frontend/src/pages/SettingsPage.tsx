import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Trash2, Save, Sun, Moon, Plus } from "lucide-react";
import ModalWrapper from "@/components/ModalWrapper";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useTheme } from "@/hooks/useTheme";
import api from "@/lib/api";
import { toast } from "sonner";

const PRESET_COLORS = [
  "#10B981",
  "#3B82F6",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#F97316",
];

const PRESET_ICONS = [
  "🍔",
  "🚗",
  "💡",
  "🎉",
  "💊",
  "🏠",
  "✈️",
  "🛒",
  "💻",
  "📌",
];

const SettingsPage = () => {
  const { current } = useWorkspace();
  const { theme, toggleTheme } = useTheme();
  const [name, setName] = useState(current.name);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [members, setMembers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [newCat, setNewCat] = useState({
    name: "",
    color: PRESET_COLORS[0],
    icon: PRESET_ICONS[0],
  });
  const [inviteToken, setInviteToken] = useState("");

  useEffect(() => {
    setName(current.name);
    if (!current.id || current.id === "0") return;
    api
      .get(`/workspaces/${current.id}/members`)
      .then((res) => setMembers(res.data));
    api
      .get(`/workspaces/${current.id}/categories`)
      .then((res) => setCategories(res.data));
  }, [current.id]);

  const handleSaveName = async () => {
    setSaving(true);
    try {
      await api.put(`/workspaces/${current.id}`, { name });
      toast.success("Workspace name updated successfully.");
    } catch {
      toast.error("Failed to update workspace name. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleInvite = async () => {
    if (!email.trim() || !email.includes("@")) {
      toast.warning("Please enter a valid email address.");
      return;
    }
    try {
      const res = await api.post(`/workspaces/${current.id}/invite`, {
        email: email.trim(),
      });
      setInviteToken(res.data.token);
      setEmail("");
      toast.success("Invitation generated successfully.");
      api
        .get(`/workspaces/${current.id}/members`)
        .then((r) => setMembers(r.data));
    } catch {
      toast.error("Failed to generate invitation. Please try again.");
    }
  };

  const handleRemoveMember = async (userId: number) => {
    try {
      await api.delete(`/workspaces/${current.id}/members/${userId}`);
      setMembers((prev) => prev.filter((m) => m.id !== userId));
      toast.success("Member removed from workspace.");
    } catch {
      toast.error("Failed to remove member. Please try again.");
    }
  };

  const handleCreateCategory = async () => {
    if (!newCat.name.trim()) {
      toast.warning("Please enter a category name.");
      return;
    }
    try {
      const res = await api.post(
        `/workspaces/${current.id}/categories`,
        newCat,
      );
      setCategories((prev) => [...prev, res.data]);
      setNewCat({ name: "", color: PRESET_COLORS[0], icon: PRESET_ICONS[0] });
      setCategoryOpen(false);
      toast.success(`Category "${res.data.name}" created.`);
    } catch {
      toast.error("Failed to create category. Please try again.");
    }
  };

  const handleDeleteCategory = async (catId: number, catName: string) => {
    try {
      await api.delete(`/workspaces/${current.id}/categories/${catId}`);
      setCategories((prev) => prev.filter((c) => c.id !== catId));
      toast.success(`Category "${catName}" deleted.`);
    } catch {
      toast.error(
        "Failed to delete category. It may have expenses associated with it.",
      );
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>

      {/* Appearance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <h2 className="text-sm font-semibold text-foreground">Appearance</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Switch between dark and light mode
        </p>
        <div className="mt-4 flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className={`flex items-center gap-3 rounded-xl px-5 py-3 text-sm font-medium transition-all ${theme === "dark" ? "bg-primary/15 text-primary ring-1 ring-primary/30" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
          >
            <Moon className="h-4 w-4" /> Dark
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className={`flex items-center gap-3 rounded-xl px-5 py-3 text-sm font-medium transition-all ${theme === "light" ? "bg-primary/15 text-primary ring-1 ring-primary/30" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
          >
            <Sun className="h-4 w-4" /> Light
          </motion.button>
        </div>
      </motion.div>

      {/* Workspace Name */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card p-6"
      >
        <h2 className="text-sm font-semibold text-foreground">
          Workspace Name
        </h2>
        <div className="mt-3 flex gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSaveName}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save"}
          </motion.button>
        </div>
      </motion.div>

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Categories
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Create categories to organize your expenses
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCategoryOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> New Category
          </motion.button>
        </div>
        <div className="mt-4 divide-y divide-border">
          {categories.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No categories yet. Create one to start adding expenses.
            </p>
          )}
          {categories.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center justify-between py-3 group"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{c.icon || "📌"}</span>
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="text-sm text-foreground">{c.name}</span>
                </div>
              </div>
              <button
                onClick={() => handleDeleteCategory(c.id, c.name)}
                className="text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-expense transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Members */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Members</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setInviteOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
          >
            <Mail className="h-3.5 w-3.5" /> Invite
          </motion.button>
        </div>
        <div className="mt-4 divide-y divide-border">
          {members.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between py-3 group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                  {m.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-foreground">{m.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.email} · {m.role}
                  </p>
                </div>
              </div>
              {m.role !== "owner" && (
                <button
                  onClick={() => handleRemoveMember(m.id)}
                  className="text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-expense transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Create Category Modal */}
      <AnimatePresence>
        {categoryOpen && (
          <ModalWrapper onClose={() => setCategoryOpen(false)}>
            <h3 className="text-lg font-semibold text-foreground">
              New Category
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Give it a name, color, and icon.
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs text-muted-foreground">Name</label>
                <input
                  autoFocus
                  value={newCat.name}
                  onChange={(e) =>
                    setNewCat({ ...newCat, name: e.target.value })
                  }
                  placeholder="e.g. Food & Dining"
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Color</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewCat({ ...newCat, color })}
                      className={`h-7 w-7 rounded-full transition-all ${newCat.color === color ? "ring-2 ring-offset-2 ring-offset-background ring-white scale-110" : ""}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Icon</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {PRESET_ICONS.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setNewCat({ ...newCat, icon })}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-all ${newCat.icon === icon ? "bg-primary/20 ring-1 ring-primary" : "bg-secondary hover:bg-muted"}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setCategoryOpen(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleCreateCategory}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Create
              </motion.button>
            </div>
          </ModalWrapper>
        )}
      </AnimatePresence>

      {/* Invite Modal */}
      <AnimatePresence>
        {inviteOpen && (
          <ModalWrapper
            onClose={() => {
              setInviteOpen(false);
              setInviteToken("");
            }}
          >
            <h3 className="text-lg font-semibold text-foreground">
              Invite Member
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter the email of the person you'd like to invite.
            </p>
            {!inviteToken ? (
              <>
                <input
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                  placeholder="name@example.com"
                  className="mt-4 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setInviteOpen(false)}
                    className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleInvite}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                  >
                    Generate Invite
                  </motion.button>
                </div>
              </>
            ) : (
              <>
                <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <p className="text-xs text-muted-foreground mb-2">
                    Share this invite link with them:
                  </p>
                  <p className="text-xs font-mono text-primary break-all select-all">
                    {window.location.origin}/invite/accept?token={inviteToken}
                  </p>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  This link expires in 7 days.
                </p>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => {
                      setInviteOpen(false);
                      setInviteToken("");
                    }}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                  >
                    Done
                  </button>
                </div>
              </>
            )}
          </ModalWrapper>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsPage;
