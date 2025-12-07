import React from 'react';
import { AIAnalysisResult, MeetingStatus } from '../types';

interface Props {
  analysis: AIAnalysisResult | null;
  loading: boolean;
  onOverride?: (status: MeetingStatus) => void;
}

const MeetingStatusCard: React.FC<Props> = ({ analysis, loading, onOverride }) => {

  if (loading || !analysis) {
    return (
      <div className="w-full h-80 bg-slate-900/20 backdrop-blur-sm rounded-[2rem] border border-slate-800/50 flex flex-col items-center justify-center gap-4 animate-pulse">
        <div className="w-12 h-12 rounded-full border-2 border-slate-800 border-t-indigo-500 animate-spin"></div>
        <div className="text-slate-500 font-bold text-sm tracking-wide uppercase">Processing Team Signals...</div>
      </div>
    );
  }

  const isConfirmed = analysis.status === MeetingStatus.CONFIRMED;

  return (
    <div className={`relative overflow-hidden rounded-[2rem] transition-all duration-700 group border ${
      isConfirmed 
        ? 'bg-[#150f14] border-rose-900/40 shadow-[0_20px_60px_-15px_rgba(244,63,94,0.1)]' 
        : 'bg-[#0f1715] border-emerald-900/40 shadow-[0_20px_60px_-15px_rgba(16,185,129,0.1)]'
    }`}>
      
      {/* Abstract Background Shapes */}
      <div className={`absolute -top-32 -right-32 w-[600px] h-[600px] bg-gradient-to-b opacity-5 blur-[120px] rounded-full pointer-events-none transition-colors duration-1000 ${
         isConfirmed ? 'from-rose-500 to-transparent' : 'from-emerald-500 to-transparent'
      }`}></div>
      
      {/* Changed to md:flex-row to ensure side-by-side on desktop/tablets */}
      <div className="relative z-10 flex flex-col md:flex-row min-h-[350px]">
        
        {/* LEFT PANEL: Status */}
        {/* Adjusted border logic for md breakpoint */}
        <div className="flex-1 p-8 md:p-10 flex flex-col justify-center gap-6 relative border-b md:border-b-0 md:border-r border-white/5">
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${
                 isConfirmed ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}>
                {isConfirmed ? 'Status: Sync Confirmed' : 'Status: Sync Cancelled'}
              </span>
              {analysis.isManualOverride && (
                 <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-slate-800 text-slate-400 border border-slate-700">
                   Override Active
                 </span>
              )}
            </div>
            
            {/* Scaled text for md screens */}
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white tracking-tight leading-[0.9]">
              {isConfirmed ? <span className="bg-clip-text text-transparent bg-gradient-to-br from-white via-rose-100 to-rose-400/50">Time to<br/>Sync Up.</span> : <span className="bg-clip-text text-transparent bg-gradient-to-br from-white via-emerald-100 to-emerald-400/50">Deep Work<br/>Day.</span>}
            </h1>
          </div>

          <p className="text-sm md:text-base text-slate-400 leading-relaxed max-w-sm font-medium">
            {analysis.reasoning}
          </p>

          {/* Admin Controls - Always Visible */}
          <div className="mt-auto pt-4 flex flex-col gap-2">
            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Admin Actions</div>
            <div className="flex gap-2">
                 <button 
                   onClick={() => onOverride && onOverride(MeetingStatus.CONFIRMED)}
                   disabled={isConfirmed}
                   className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                     isConfirmed 
                     ? 'opacity-30 cursor-not-allowed border-slate-800 text-slate-600' 
                     : 'border-rose-900/50 bg-rose-950/20 text-rose-400 hover:bg-rose-900/40 hover:border-rose-700'
                   }`}
                 >
                   Force Sync
                 </button>
                 <button 
                   onClick={() => onOverride && onOverride(MeetingStatus.CANCELLED)}
                   disabled={!isConfirmed}
                   className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                     !isConfirmed 
                     ? 'opacity-30 cursor-not-allowed border-slate-800 text-slate-600' 
                     : 'border-emerald-900/50 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-900/40 hover:border-emerald-700'
                   }`}
                 >
                   Cancel Sync
                 </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Insights */}
        {/* Removed left border to rely on left panel's right border, simplified logic */}
        <div className="flex-1 p-8 md:p-10 bg-black/20 flex flex-col justify-center">
           <div className="space-y-8">
              
              {/* Focus */}
              <div>
                <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-indigo-500 shadow-[0_0_8px_currentColor]"></span>
                  Team Focus
                </h3>
                <p className="text-lg md:text-xl font-medium text-slate-200 leading-snug">
                  "{analysis.summary}"
                </p>
              </div>

              {/* Priorities */}
              <div>
                <h3 className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_currentColor]"></span>
                  Blockers & Risks
                </h3>
                
                {analysis.priorityItems && analysis.priorityItems.length > 0 ? (
                  <ul className="space-y-3">
                    {analysis.priorityItems.map((item, i) => (
                      <li key={i} className="flex gap-3 text-slate-300 items-start">
                        <span className="text-rose-500 mt-1.5 text-[6px]">●</span>
                        <span className="text-sm font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-slate-600 italic text-sm">
                    No critical blockers reported.
                  </div>
                )}
              </div>

           </div>
        </div>

      </div>
    </div>
  );
};

export default MeetingStatusCard;