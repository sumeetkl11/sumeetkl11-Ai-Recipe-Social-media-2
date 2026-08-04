import React from 'react';

export function SkeletonCard({ className = 'h-48' }) {
  return (
    <div className={`glass-card loading-skeleton rounded-[28px] ${className}`} aria-hidden="true" />
  );
}

export function SkeletonPost() {
  return (
    <div className="glass-card loading-skeleton overflow-hidden rounded-[28px] p-6 space-y-4" aria-hidden="true">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-full bg-slate-200/60" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-32 rounded bg-slate-200/60" />
          <div className="h-3 w-20 rounded bg-slate-200/40" />
        </div>
      </div>
      <div className="h-52 w-full rounded-2xl bg-slate-200/50" />
      <div className="space-y-2">
        <div className="h-4 w-3/4 rounded bg-slate-200/60" />
        <div className="h-4 w-1/2 rounded bg-slate-200/40" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3, className = '' }) {
  return (
    <div className={`grid gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, idx) => (
        <SkeletonCard key={idx} className="h-24" />
      ))}
    </div>
  );
}

export default SkeletonCard;
