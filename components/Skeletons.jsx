import React from 'react';

export const CategorySkeleton = () => (
  <div className="flex flex-col items-center gap-1.5 sm:gap-2 shrink-0 w-18 sm:w-24 text-center">
    <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-slate-200 dark:bg-neutral-800 animate-pulse shadow-xl" />
    <div className="w-12 sm:w-16 h-2 bg-slate-200 dark:bg-neutral-800 rounded animate-pulse mt-1" />
  </div>
);

export const ServiceSkeleton = () => (
  <div className="web-card flex flex-col justify-between shadow-2xl relative bg-white dark:bg-[#1A1A1A] p-0 rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 dark:border-[#333333]">
    <div className="w-full h-48 sm:h-56 bg-slate-200 dark:bg-neutral-800 animate-pulse" />
    <div className="p-4 sm:p-5 space-y-3">
      <div className="w-16 h-3 bg-slate-200 dark:bg-neutral-800 rounded animate-pulse" />
      <div className="w-3/4 h-5 bg-slate-200 dark:bg-neutral-800 rounded animate-pulse" />
      <div className="space-y-1.5 mt-2">
        <div className="w-full h-2.5 bg-slate-200 dark:bg-neutral-800 rounded animate-pulse" />
        <div className="w-5/6 h-2.5 bg-slate-200 dark:bg-neutral-800 rounded animate-pulse" />
      </div>
    </div>
    <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-3 border-t border-slate-100 dark:border-neutral-800 flex justify-between items-center">
      <div className="w-20 h-6 bg-slate-200 dark:bg-neutral-800 rounded animate-pulse" />
      <div className="w-24 h-9 sm:h-10 bg-slate-200 dark:bg-neutral-800 rounded-xl animate-pulse" />
    </div>
  </div>
);

export const HeroBannerSkeleton = () => (
  <div className="w-full h-[180px] sm:h-[320px] md:h-[400px] lg:h-[480px] bg-slate-200 dark:bg-neutral-800 animate-pulse rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-neutral-800" />
);
