import React from 'react';
import { WordStatus } from '../types';

interface WordPillProps {
  word: string;
  status?: WordStatus;
  onClick?: () => void;
  onRemove?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  isSelected?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
}

export const WordPill: React.FC<WordPillProps> = ({ 
  word, 
  status = WordStatus.PENDING, 
  onClick,
  onRemove,
  disabled = false,
  isSelected = false,
  size = 'md',
  animate = false,
  draggable = false,
  onDragStart
}) => {
  
  const getColors = () => {
    switch (status) {
      case WordStatus.CORRECT:
        return 'bg-green-600 border-green-700 text-white';
      case WordStatus.PRESENT:
        return 'bg-yellow-600 border-yellow-700 text-white';
      case WordStatus.ABSENT:
        return 'bg-slate-700 border-slate-800 text-slate-400 opacity-50';
      case WordStatus.PENDING:
      default:
        if (isSelected) {
          return 'bg-indigo-900 border-indigo-950 text-slate-400 cursor-not-allowed opacity-70 shadow-inner';
        }
        // Interactive state vs Display state
        return disabled 
          ? 'bg-slate-800 border-slate-700 text-slate-200' 
          : 'bg-indigo-600 border-indigo-700 text-white hover:bg-indigo-500 cursor-pointer active:scale-95 shadow-md hover:shadow-lg';
    }
  };

  const getSize = () => {
    switch (size) {
      case 'sm': return 'text-xs px-2 py-1 min-w-[3rem]';
      case 'lg': return 'text-base px-4 py-3 min-w-[5rem]';
      case 'md':
      default: return 'text-sm px-3 py-2 min-w-[4rem]';
    }
  };

  const isInteractive = !disabled && !isSelected;

  return (
    <div
      onClick={isInteractive ? onClick : undefined}
      draggable={draggable && isInteractive}
      onDragStart={onDragStart}
      className={`
        relative
        ${getSize()}
        ${getColors()}
        ${animate ? 'animate-bounce' : ''}
        border-b-4 rounded-lg font-bold
        flex items-center justify-center
        transition-all duration-150 select-none
        uppercase tracking-wide
        ${draggable && isInteractive ? 'cursor-grab active:cursor-grabbing' : ''}
      `}
    >
      {word}
      {onRemove && !disabled && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(e);
          }}
          className="absolute -top-3 -right-3 w-7 h-7 flex items-center justify-center text-white z-10 opacity-80 hover:opacity-100"
          aria-label="Remove word"
        >
          <div className="w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center shadow-sm">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>
        </button>
      )}
    </div>
  );
};