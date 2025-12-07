import React from 'react';
import { WordPill } from './WordPill';
import { WordStatus } from '../types';

interface KeyboardProps {
  wordBank: string[];
  usedWords: Map<string, WordStatus>;
  currentGuess: string[];
  onWordSelect: (word: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  isSubmitDisabled: boolean;
  isDeleteDisabled: boolean;
}

export const Keyboard: React.FC<KeyboardProps> = ({
  wordBank,
  usedWords,
  currentGuess,
  onWordSelect,
  onDelete,
  onSubmit,
  onMoveLeft,
  onMoveRight,
  isSubmitDisabled,
  isDeleteDisabled,
}) => {
  return (
    <div className="flex flex-col gap-3 w-full max-w-2xl mx-auto p-2 pb-6 bg-slate-900/95 backdrop-blur-md sticky bottom-0 border-t border-slate-800 shadow-2xl z-20 shrink-0">
      {/* Controls */}
      <div className="flex justify-between items-center px-2 pt-1">
        <div className="flex gap-3">
            <button
            onClick={onDelete}
            disabled={isDeleteDisabled}
            className={`
                px-4 py-3 rounded-xl font-bold uppercase text-xs tracking-wider flex items-center justify-center
                transition-all duration-200 min-w-[3.5rem]
                ${isDeleteDisabled 
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                : 'bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 border border-rose-600/50'}
            `}
            aria-label="Delete"
            >
             ⌫
            </button>
            <button
                onClick={onMoveLeft}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700 font-bold min-w-[3rem]"
            >
                ←
            </button>
            <button
                onClick={onMoveRight}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700 font-bold min-w-[3rem]"
            >
                →
            </button>
        </div>
        
        <button
          onClick={onSubmit}
          disabled={isSubmitDisabled}
          className={`
            px-6 py-3 rounded-xl font-bold uppercase text-sm tracking-wider
            transition-all duration-200 shadow-lg
            ${isSubmitDisabled 
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
              : 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)] active:scale-95'}
          `}
        >
          Enter
        </button>
      </div>

      {/* Word Bank */}
      <div className="flex flex-wrap gap-2 justify-center no-scrollbar px-1 py-1">
        {wordBank.map((word) => {
           const status = usedWords.get(word) || WordStatus.PENDING;
           const isSelected = currentGuess.includes(word);
           return (
             <WordPill
               key={word}
               word={word}
               status={status === WordStatus.PENDING ? WordStatus.PENDING : status} 
               isSelected={isSelected}
               onClick={() => onWordSelect(word)}
               size="sm"
               draggable={true}
               onDragStart={(e) => {
                 if (isSelected) {
                   e.preventDefault();
                   return;
                 }
                 e.dataTransfer.setData("text/plain", word);
                 e.dataTransfer.setData("application/x-source-bank", "true");
               }}
             />
           );
        })}
      </div>
    </div>
  );
};