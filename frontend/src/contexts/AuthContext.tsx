import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";

interface AuthContextType {
  isAuthenticated: boolean;
  user: { id: number; email: string; name: string } | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{
    id: number;
    email: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const savedUser = localStorage.getItem("auth_user");
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post("/login", { email, password });
    localStorage.setItem("auth_token", res.data.token);
    localStorage.setItem("auth_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.post("/register", { name, email, password });
    localStorage.setItem("auth_token", res.data.token);
    localStorage.setItem("auth_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  const logout = () => {
    api.post("/logout").finally(() => {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      setUser(null);
    });
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated: !!user, user, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
