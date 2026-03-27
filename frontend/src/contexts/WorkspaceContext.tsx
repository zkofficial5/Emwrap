import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import api from "@/lib/api";
import { useAuth } from "./AuthContext";

interface Workspace {
  id: string;
  name: string;
  owner_id: number;
  role: string;
  memberCount: number;
}

interface WorkspaceContextType {
  current: Workspace;
  all: Workspace[];
  switchWorkspace: (id: string) => void;
  addWorkspace: (name: string) => Promise<void>;
  loading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export const useWorkspace = () => {
  const ctx = useContext(WorkspaceContext);
  if (!ctx)
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
};

const fallback: Workspace = {
  id: "0",
  name: "Loading...",
  owner_id: 0,
  role: "member",
  memberCount: 0,
};

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [all, setAll] = useState<Workspace[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    api
      .get("/workspaces")
      .then((res) => {
        setAll(res.data);
        if (res.data.length > 0) setCurrentId(res.data[0].id);
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const current = all.find((w) => w.id == currentId) || fallback;

  const switchWorkspace = (id: string) => setCurrentId(id);

  const addWorkspace = async (name: string) => {
    const res = await api.post("/workspaces", { name });
    setAll((prev) => [...prev, res.data]);
    setCurrentId(res.data.id);
  };

  return (
    <WorkspaceContext.Provider
      value={{ current, all, switchWorkspace, addWorkspace, loading }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};
