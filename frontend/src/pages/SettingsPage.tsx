import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Trash2, Save, Sun, Moon } from "lucide-react";
import ModalWrapper from "@/components/ModalWrapper";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useTheme } from "@/hooks/useTheme";

const SettingsPage = () => {
  const { current } = useWorkspace();
  const { theme, toggleTheme } = useTheme();
  const [name, setName] = useState(current.name);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [members, setMembers] = useState(["alice@acme.com", "bob@acme.com", "carol@acme.com"]);
  const [saved, setSaved] = useState(false);

  const handleSaveName = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const handleInvite = () => {
    if (email.trim() && email.includes("@")) {
      setMembers((prev) => [...prev, email.trim()]);
      setEmail("");
      setInviteOpen(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>

      {/* Appearance */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <h2 className="text-sm font-semibold text-foreground">Appearance</h2>
        <p className="mt-1 text-xs text-muted-foreground">Switch between dark and light mode</p>
        <div className="mt-4 flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className={`relative flex items-center gap-3 rounded-xl px-5 py-3 text-sm font-medium transition-all ${
              theme === "dark"
                ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            <Moon className="h-4 w-4" />
            Dark
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className={`relative flex items-center gap-3 rounded-xl px-5 py-3 text-sm font-medium transition-all ${
              theme === "light"
                ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sun className="h-4 w-4" />
            Light
          </motion.button>
        </div>
      </motion.div>

      {/* Workspace Name */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-6">
        <h2 className="text-sm font-semibold text-foreground">Workspace Name</h2>
        <div className="mt-3 flex gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)} className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSaveName}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:shadow-[0_0_16px_-4px_hsl(var(--primary)/0.5)] transition-all"
          >
            <Save className="h-4 w-4" /> {saved ? "Saved!" : "Save"}
          </motion.button>
        </div>
      </motion.div>

      {/* Members */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
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
              key={m}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between py-3 group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                  {m.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-foreground">{m}</span>
              </div>
              <button onClick={() => setMembers((prev) => prev.filter((x) => x !== m))} className="text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-expense transition-all">
                <Trash2 className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {inviteOpen && (
          <ModalWrapper onClose={() => setInviteOpen(false)}>
            <h3 className="text-lg font-semibold text-foreground">Invite Member</h3>
            <p className="mt-1 text-sm text-muted-foreground">Enter the email address of the person you'd like to invite.</p>
            <input autoFocus value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleInvite()} placeholder="name@example.com" className="mt-4 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setInviteOpen(false)} className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleInvite} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Send Invite</motion.button>
            </div>
          </ModalWrapper>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsPage;
