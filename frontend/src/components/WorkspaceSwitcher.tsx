import React, { useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Plus, Building2 } from "lucide-react";

const WorkspaceSwitcher = () => {
  const { current, all, switchWorkspace, addWorkspace } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const handleCreate = () => {
    if (newName.trim()) {
      addWorkspace(newName.trim());
      setNewName("");
      setCreating(false);
      setOpen(false);
    }
  };

  return (
    <div className="relative px-3 py-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 rounded-lg bg-secondary px-3 py-2.5 transition-colors hover:bg-muted"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/20">
          <Building2 className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-foreground">{current.name}</p>
          <p className="text-xs text-muted-foreground">{current.memberCount} members</p>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute left-3 right-3 top-full z-50 mt-1 overflow-hidden rounded-lg border border-border bg-popover shadow-xl"
          >
            {all.map((ws) => (
              <button
                key={ws.id}
                onClick={() => { switchWorkspace(ws.id); setOpen(false); }}
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted ${
                  ws.id === current.id ? "bg-muted" : ""
                }`}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/20">
                  <Building2 className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{ws.name}</p>
                  <p className="text-xs text-muted-foreground">{ws.memberCount} members</p>
                </div>
              </button>
            ))}
            <div className="border-t border-border">
              {creating ? (
                <div className="flex gap-2 p-2">
                  <input
                    autoFocus
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                    placeholder="Workspace name"
                    className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button onClick={handleCreate} className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
                    Add
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setCreating(true)}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Plus className="h-4 w-4" /> New workspace
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkspaceSwitcher;
