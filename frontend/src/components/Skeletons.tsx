import React from "react";

const SkeletonCard = ({ className = "" }: { className?: string }) => (
  <div className={`glass-card animate-pulse p-6 ${className}`}>
    <div className="mb-3 h-3 w-24 rounded bg-muted" />
    <div className="h-8 w-32 rounded bg-muted" />
  </div>
);

const SkeletonRow = () => (
  <div className="flex animate-pulse items-center gap-4 border-b border-border px-4 py-3">
    <div className="h-8 w-8 rounded-lg bg-muted" />
    <div className="flex-1 space-y-2">
      <div className="h-3 w-32 rounded bg-muted" />
      <div className="h-2 w-20 rounded bg-muted" />
    </div>
    <div className="h-4 w-16 rounded bg-muted" />
  </div>
);

export { SkeletonCard, SkeletonRow };
