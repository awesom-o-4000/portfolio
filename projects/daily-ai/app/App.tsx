import React, { useState, useEffect, useMemo } from 'react';
import { DailyUpdate, AIAnalysisResult, DayRecord, MeetingStatus } from './types';
import MeetingStatusCard from './components/MeetingStatusCard';
import TeamGrid from './components/Feed';
import UpdateModal from './components/UpdateForm';
import CalendarView from './components/CalendarView';
import { analyzeUpdates, generateInitialTeam, generateHistory } from './services/geminiService';

const App: React.FC = () => {
  const [updates, setUpdates] = useState<DailyUpdate[]>([]);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [history, setHistory] = useState<DayRecord[]>([]);
  
  // View State
  const [view, setView] = useState<'TODAY' | 'HISTORY'>('TODAY');
  
  // Clock State
  const [currentTime, setCurrentTime] = useState(new Date());

  // Modal State
  const [editingMember, setEditingMember] = useState<DailyUpdate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Clock Ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Initial Data Load
  useEffect(() => {
    const loadData = async () => {
      setIsAnalyzing(true);
      const initialData = generateInitialTeam();
      setUpdates(initialData);
      setHistory(generateHistory());
      
      const result = await analyzeUpdates(initialData);
      setAnalysis(result);
      setIsAnalyzing(false);
    };
    loadData();
  }, []);

  const handleUpdateMember = async (updatedMember: DailyUpdate) => {
    const newUpdates = updates.map(u => u.id === updatedMember.id ? updatedMember : u);
    setUpdates(newUpdates);
    
    // Re-analyze
    setIsAnalyzing(true);
    const result = await analyzeUpdates(newUpdates);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleCardClick = (member: DailyUpdate) => {
    setEditingMember(member);
    setIsModalOpen(true);
  };

  const handleAddComment = (memberId: string, text: string) => {
    setUpdates(prev => prev.map(u => {
      if (u.id === memberId) {
        return {
          ...u,
          comments: [
            ...(u.comments || []),
            { 
              id: Date.now().toString(), 
              text, 
              timestamp: Date.now(), 
              author: 'You' 
            }
          ]
        };
      }
      return u;
    }));
  };

  // Admin Override Handler
  const handleOverride = (status: MeetingStatus) => {
    if (!analysis) return;
    
    setAnalysis({
      ...analysis,
      status: status,
      reasoning: status === MeetingStatus.CONFIRMED 
        ? "Meeting manually forced by admin." 
        : "Meeting manually cancelled by admin.",
      isManualOverride: true
    });
  };

  // Stats Logic Calculation (Lifted from CalendarView)
  const stats = useMemo(() => {
    const teamSize = updates.length || 8;
    const MEETING_DURATION_MINS = 15;
    const SAVED_MINS_PER_MEETING = MEETING_DURATION_MINS * teamSize;

    const calculateSavedHours = (days: DayRecord[]) => {
      let cancelledCount = days.filter(d => d.status === MeetingStatus.CANCELLED).length;
      // Include today if cancelled
      if (analysis?.status === MeetingStatus.CANCELLED) {
        cancelledCount += 1;
      }
      return (cancelledCount * SAVED_MINS_PER_MEETING) / 60;
    };

    return {
      totalHours: calculateSavedHours(history)
    };
  }, [history, analysis?.status, updates.length]);

  return (
    <div className="min-h-screen flex flex-col bg-[#02050f] text-slate-200 selection:bg-indigo-500/30 font-['Outfit']">
      
      {/* Navigation & Header */}
      <nav className="sticky top-0 z-40 bg-[#02050f]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.location.reload()}>
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(79,70,229,0.5)] group-hover:scale-105 transition-transform">
              d.
            </div>
            <div className="font-bold text-xl text-white tracking-tight">daily.ai</div>
          </div>

          <div className="flex items-center gap-6">
             {/* View Toggle */}
             <div className="bg-slate-900/80 p-1 rounded-full flex text-xs font-bold border border-slate-800/50">
                <button 
                  onClick={() => setView('TODAY')}
                  className={`px-5 py-1.5 rounded-full transition-all duration-300 ${view === 'TODAY' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Today
                </button>
                <button 
                  onClick={() => setView('HISTORY')}
                  className={`px-5 py-1.5 rounded-full transition-all duration-300 ${view === 'HISTORY' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  History
                </button>
             </div>

             {/* Live Clock */}
             <div className="text-right hidden sm:block leading-tight">
               <div className="text-sm font-bold text-slate-100">
                 {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </div>
               <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                 {currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
               </div>
             </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10 w-full">
        
        {view === 'TODAY' ? (
          <>
            {/* Hero Section */}
            <section className="animate-fade-in">
              <MeetingStatusCard 
                analysis={analysis} 
                loading={isAnalyzing} 
                onOverride={handleOverride}
              />
            </section>

            {/* Team Grid Section */}
            <section className="animate-fade-in-up delay-100">
              <div className="mb-4 px-1">
                <h2 className="text-xl font-bold text-white mb-1">Team Updates</h2>
                <p className="text-slate-500 text-sm font-medium">
                  Tap any card to edit, record voice, or upload files.
                </p>
              </div>
              
              <TeamGrid 
                updates={updates} 
                onMemberClick={handleCardClick}
                onAddComment={handleAddComment}
              />
            </section>
          </>
        ) : (
          <section className="animate-fade-in">
            <CalendarView 
              history={history} 
              todayStatus={analysis?.status}
              teamSize={updates.length}
            />
          </section>
        )}

      </main>

      {/* Footer Stats */}
      <footer className="border-t border-slate-900 bg-[#050914] py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="text-xs text-slate-600 font-medium">
               &copy; {new Date().getFullYear()} daily.ai &bull; Intelligent Standups
             </div>
             
             <div className="flex items-center gap-8 bg-slate-900/50 px-6 py-3 rounded-2xl border border-slate-800">
                <div className="text-right">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Time Saved (All Time)</div>
                  <div className="text-xl font-bold text-sky-400">{stats.totalHours.toFixed(0)} Hours</div>
                </div>
                <div className="h-8 w-px bg-slate-800"></div>
                <div className="text-left">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Meetings Avoided</div>
                  <div className="text-xl font-bold text-emerald-400">{(stats.totalHours * 4 / updates.length).toFixed(0)} Syncs</div>
                </div>
             </div>
          </div>
        </div>
      </footer>

      {/* Edit Modal */}
      {editingMember && (
        <UpdateModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleUpdateMember}
          data={editingMember}
        />
      )}
    </div>
  );
};

export default App;