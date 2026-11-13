import React from 'react';
import { Skeleton } from './Skeleton';

export const ViewSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header bar skeleton */}
      <div className="flex items-center justify-between pb-6 border-b border-stone-200">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>

      {/* KPI grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-stone-200/80 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Main content table/cards skeleton */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200/80 space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
};

