import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  isAuthenticated: boolean;
  user: { email: string; name: string } | null;
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
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const savedUser = localStorage.getItem("auth_user");
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 600));
    const u = { email, name: email.split("@")[0] };
    localStorage.setItem("auth_token", "mock_token_" + Date.now());
    localStorage.setItem("auth_user", JSON.stringify(u));
    setUser(u);
  };

  const register = async (name: string, email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 600));
    const u = { email, name };
    localStorage.setItem("auth_token", "mock_token_" + Date.now());
    localStorage.setItem("auth_user", JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
