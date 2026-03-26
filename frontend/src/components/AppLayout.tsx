import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import SoftAurora from "./SoftAurora";
import { useAuth } from "@/contexts/AuthContext";

const AppLayout = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <main className="relative flex-1 overflow-y-auto">
        {/* Subtle aurora background */}
        <div className="pointer-events-none fixed inset-0 left-64 opacity-20">
          <SoftAurora
            speed={0.3}
            scale={2.0}
            brightness={0.6}
            color1="#10B981"
            color2="#059669"
            noiseFrequency={1.8}
            noiseAmplitude={0.8}
            bandHeight={0.6}
            bandSpread={0.8}
            enableMouseInteraction={false}
          />
        </div>
        <div className="relative z-10 p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
