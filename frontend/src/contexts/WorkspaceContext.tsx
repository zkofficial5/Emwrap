import React, { createContext, useContext, useState, ReactNode } from "react";
import { workspaces, Workspace } from "@/lib/mock-data";

interface WorkspaceContextType {
  current: Workspace;
  all: Workspace[];
  switchWorkspace: (id: string) => void;
  addWorkspace: (name: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export const useWorkspace = () => {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
};

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const [all, setAll] = useState<Workspace[]>(workspaces);
  const [currentId, setCurrentId] = useState(workspaces[0].id);

  const current = all.find((w) => w.id === currentId) || all[0];

  const switchWorkspace = (id: string) => setCurrentId(id);

  const addWorkspace = (name: string) => {
    const newWs: Workspace = { id: String(Date.now()), name, memberCount: 1 };
    setAll((prev) => [...prev, newWs]);
    setCurrentId(newWs.id);
  };

  return (
    <WorkspaceContext.Provider value={{ current, all, switchWorkspace, addWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
};
