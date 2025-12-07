import React from 'react';

export const Legend: React.FC = () => {
  return (
    <div className="flex flex-wrap justify-center gap-3 text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-slate-400 mt-2 select-none">
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 bg-green-600 rounded-sm shadow-sm ring-1 ring-white/10"></div>
        <span>Correct</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 bg-yellow-600 rounded-sm shadow-sm ring-1 ring-white/10"></div>
        <span>Wrong Spot</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 bg-slate-700 rounded-sm shadow-sm ring-1 ring-white/10"></div>
        <span>Unused</span>
      </div>
    </div>
  );
};