import React, { useState, useRef, useEffect } from 'react';
import { DailyUpdate, Comment } from '../types';

interface TeamGridProps {
  updates: DailyUpdate[];
  onMemberClick?: (member: DailyUpdate) => void;
  onAddComment?: (memberId: string, text: string) => void;
  readonly?: boolean;
}

const TeamCard: React.FC<{ 
  update: DailyUpdate; 
  onClick: () => void; 
  onAddComment?: (id: string, text: string) => void; 
  disabled: boolean 
}> = ({ update, onClick, onAddComment, disabled }) => {
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  
  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Reset audio state if update changes
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [update.audioUrl]);

  const toggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent card click
    if (commentText.trim() && onAddComment) {
      onAddComment(update.id, commentText);
      setCommentText('');
    }
  };

  const openEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Simulate email
    window.location.href = `mailto:${update.user.toLowerCase().replace(' ', '.')}@daily.ai`;
  };

  const scheduleMeeting = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Open Google Calendar create event
    const title = `Sync with ${update.user}`;
    const details = `Discussing: ${update.today}`;
    window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(details)}`, '_blank');
  };

  return (
    <div 
      className={`group rounded-[1.25rem] p-4 transition-all relative outline-none flex flex-col h-full ${
        update.isDayOff
          ? 'bg-slate-900/20 border border-slate-800/30 opacity-60' 
          : 'bg-[#0b1021] border border-[#1e293b] hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.1)]'
      }`}
    >
      {/* Clickable Area for Edit */}
      <div onClick={disabled ? undefined : onClick} className={`flex-1 cursor-pointer ${disabled ? '' : ''}`}>
        
        {/* Header */}
        <div className="flex justify-between items-start mb-3 w-full">
          <div className={`w-9 h-9 rounded-lg ${update.isDayOff ? 'bg-slate-800 text-slate-500' : update.avatarColor} flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-black/20`}>
            {update.isDayOff ? '🌴' : update.user.charAt(0)}
          </div>
          
          {!update.isDayOff && (
            <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold border tracking-wide ${
              update.necessityScore > 7 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
              update.necessityScore > 4 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
              'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}>
              {update.necessityScore}/10
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="mb-2">
          <h3 className={`font-bold text-base leading-none ${update.isDayOff ? 'text-slate-500' : 'text-slate-100'}`}>
            {update.user}
          </h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">{update.role}</p>
        </div>

        {/* Content */}
        <div className="space-y-2 mt-1">
          {update.isDayOff ? (
             <div className="inline-block px-3 py-1 bg-slate-800/50 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-wider">
               Out of Office
             </div>
          ) : (
            <>
              {/* Increased Text Size */}
              <p className="text-[15px] font-medium text-slate-300 leading-snug line-clamp-3">
                {update.today}
              </p>
              {update.blockers && update.blockers !== 'None' && (
                <div className="pt-1">
                   <div className="inline-flex items-center gap-2 bg-rose-950/40 px-2 py-1.5 rounded-md border border-rose-900/30 w-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0"></div>
                    <span className="text-xs text-rose-200 font-medium truncate">{update.blockers}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Image Previews & Icons */}
        {!update.isDayOff && (
          <div className="mt-3 flex items-center justify-between min-h-[20px]">
            
            {/* Image Strip */}
            <div className="flex -space-x-2">
              {update.attachments?.filter(a => a.type === 'image').slice(0, 3).map((att, i) => (
                <div key={att.id} className="w-5 h-5 rounded-full border border-[#0b1021] bg-slate-800 overflow-hidden relative z-0 hover:z-10 hover:scale-150 transition-transform cursor-pointer">
                  <img src={att.url} alt="att" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            <div className="flex gap-2 text-slate-500">
               {update.attachments?.some(a => a.type !== 'image') && (
                  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
               )}
               {update.audioUrl && (
                 <div className="flex items-center">
                    <audio ref={audioRef} src={update.audioUrl} onEnded={handleAudioEnded} className="hidden" />
                    <button 
                      onClick={toggleAudio}
                      className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                        isPlaying 
                        ? 'text-white bg-indigo-500 animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]' 
                        : 'text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20'
                      }`}
                    >
                      {isPlaying ? (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                        </svg>
                      ) : (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                           <path d="M8 5v14l11-7z"/>
                        </svg>
                      )}
                      <span>{isPlaying ? 'Playing' : 'Play'}</span>
                    </button>
                 </div>
               )}
            </div>
          </div>
        )}
      </div>
      
      {/* Footer / Quick Actions */}
      {!update.isDayOff && !disabled && (
        <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
          <div className="flex gap-1">
             <button 
               onClick={openEmail}
               title="Send Email"
               className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
             >
               <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
               </svg>
             </button>
             <button 
               onClick={scheduleMeeting}
               title="Set up meeting"
               className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
             >
               <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
               </svg>
             </button>
          </div>
          
          <button 
            onClick={(e) => { e.stopPropagation(); setIsCommentsOpen(!isCommentsOpen); }}
            className={`flex items-center gap-1 px-1.5 py-1 rounded-md transition-colors text-[10px] font-bold ${
              (update.comments?.length || 0) > 0 || isCommentsOpen
                ? 'text-indigo-400 bg-indigo-500/10' 
                : 'text-slate-500 hover:text-white hover:bg-slate-800'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{update.comments?.length || 0}</span>
          </button>
        </div>
      )}

      {/* Comments Drawer */}
      {isCommentsOpen && !update.isDayOff && (
        <div className="mt-2 pt-2 border-t border-white/5 animate-fade-in" onClick={e => e.stopPropagation()}>
          
          <div className="space-y-2 max-h-32 overflow-y-auto mb-2 scrollbar-thin">
            {update.comments && update.comments.length > 0 ? (
              update.comments.map(c => (
                <div key={c.id} className="text-[10px]">
                  <span className="font-bold text-slate-300 mr-1">{c.author}:</span>
                  <span className="text-slate-400">{c.text}</span>
                </div>
              ))
            ) : (
              <div className="text-[10px] text-slate-600 italic text-center py-1">No comments yet.</div>
            )}
          </div>

          <form onSubmit={handleCommentSubmit} className="relative">
             <input 
               type="text" 
               placeholder="Write a comment..."
               value={commentText}
               onChange={(e) => setCommentText(e.target.value)}
               className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-2 pr-7 py-1.5 text-[10px] text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-600"
             />
             <button 
                type="submit"
                disabled={!commentText.trim()}
                className="absolute right-1 top-1 bottom-1 px-1.5 text-indigo-500 hover:text-indigo-400 disabled:opacity-30 disabled:cursor-not-allowed"
             >
               <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
               </svg>
             </button>
          </form>
        </div>
      )}
    </div>
  );
};

const TeamGrid: React.FC<TeamGridProps> = ({ updates, onMemberClick, onAddComment, readonly = false }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
      {updates.map((update) => (
        <TeamCard 
          key={update.id} 
          update={update} 
          onClick={() => onMemberClick && onMemberClick(update)} 
          onAddComment={onAddComment}
          disabled={readonly}
        />
      ))}
    </div>
  );
};

export default TeamGrid;