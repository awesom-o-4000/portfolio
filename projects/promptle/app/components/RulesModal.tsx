import React from 'react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-2xl max-w-sm w-full relative flex flex-col max-h-[90vh]">
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 p-2 text-slate-400 hover:text-white transition-colors z-10"
          aria-label="Close Rules"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-2xl font-bold text-white mb-4">How to Play</h2>
        
        <div className="space-y-4 text-sm text-slate-300 overflow-y-auto pr-2">
          <p>
            <span className="text-indigo-400 font-bold">1. Analyze</span> the AI-generated image.
          </p>
          <p>
            <span className="text-indigo-400 font-bold">2. Guess</span> the exact 5-word prompt used to create it.
            <br/>
            <span className="text-xs text-slate-500 italic">Beware! Distractors include linking words (of, in, and) to confuse you.</span>
          </p>
          <p>
            <span className="text-indigo-400 font-bold">3. Build</span> your prompt by tapping words or dragging them into the slots.
          </p>
          
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 space-y-2">
            <p className="font-semibold text-xs uppercase tracking-wider text-slate-400">Clues</p>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-600 rounded"></div>
              <span>Correct word & spot</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-600 rounded"></div>
              <span>Correct word, wrong spot</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-slate-700 rounded"></div>
              <span>Word not in prompt</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 pt-2 border-t border-slate-800">
            Tip: You can drag words to reorder them on desktop, or tap a slot to select it for replacement on mobile.
          </p>
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
        >
          Got it!
        </button>
      </div>
    </div>
  );
};