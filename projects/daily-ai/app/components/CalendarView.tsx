import React, { useState } from 'react';
import { DayRecord, MeetingStatus } from '../types';

interface CalendarViewProps {
  history: DayRecord[];
  todayStatus: MeetingStatus | undefined;
  teamSize: number;
}

const CalendarView: React.FC<CalendarViewProps> = ({ history }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();
  
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  
  // Create array of days for the grid
  const days = [];
  // Pad the beginning of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null); 
  }
  // Fill in the actual days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  }

  // Helper to find data for a specific date
  const getDataForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return history.find(h => h.date === dateStr);
  };

  return (
    <div className="bg-[#0b1021] border border-slate-800 rounded-[2rem] p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
           <h2 className="text-2xl font-bold text-white tracking-tight">{monthName} {year}</h2>
           <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">History & Performance</p>
        </div>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-full text-slate-400 hover:text-white transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={nextMonth} className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-full text-slate-400 hover:text-white transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      {/* Grid Header */}
      <div className="grid grid-cols-7 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">{d}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {days.map((date, idx) => {
          if (!date) return <div key={`pad-${idx}`} className="aspect-square"></div>;
          
          const data = getDataForDate(date);
          const isHeld = data?.status === MeetingStatus.CONFIRMED;
          const isToday = date.toDateString() === new Date().toDateString();

          return (
            <div key={idx} className={`aspect-square rounded-xl border flex flex-col items-center justify-center relative group transition-all ${
              isToday ? 'bg-indigo-900/20 border-indigo-500/50' : 
              'bg-[#0f172a]/50 border-slate-800/50 hover:bg-slate-800 hover:border-slate-700'
            }`}>
              <span className={`text-xs md:text-sm font-bold mb-1 ${isToday ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                {date.getDate()}
              </span>
              
              {data && (
                <>
                  <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold transition-transform group-hover:scale-110 ${
                    isHeld 
                    ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]' 
                    : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                  }`}>
                    {isHeld ? 'M' : 'S'}
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute z-50 bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-slate-950 border border-slate-800 p-3 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none translate-y-2 group-hover:translate-y-0 duration-200">
                     <div className="text-xs font-bold text-white mb-1">{date.toLocaleDateString(undefined, {weekday: 'short', month: 'short', day: 'numeric'})}</div>
                     <div className="text-[10px] text-slate-400 leading-tight mb-2">{data.summary}</div>
                     <div className="flex justify-between items-center border-t border-slate-800 pt-2">
                       <span className="text-[10px] font-bold uppercase text-slate-500">Score: {data.avgScore.toFixed(1)}</span>
                       <span className={`text-[10px] font-bold uppercase ${isHeld ? 'text-rose-500' : 'text-emerald-500'}`}>
                         {isHeld ? 'Meeting Held' : 'Time Saved'}
                       </span>
                     </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-8 flex justify-center gap-6">
        <div className="flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></span>
           <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Meeting Held</span>
        </div>
        <div className="flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
           <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Meeting Saved</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;