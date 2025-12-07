import React from 'react';
import { WordStatus, GuessResult } from '../types';
import { WordPill } from './WordPill';

interface GridProps {
  guesses: GuessResult[][]; // Past guesses with status
  currentGuess: string[];   // Current active row inputs
  maxAttempts: number;
  activeSlotIndex: number;
  onSlotClick: (index: number) => void;
  onDropWord: (word: string, index: number) => void;
  onRemoveWord: (index: number) => void;
}

const WORD_COUNT = 5;

export const Grid: React.FC<GridProps> = ({ 
  guesses, 
  currentGuess, 
  maxAttempts,
  activeSlotIndex,
  onSlotClick,
  onDropWord,
  onRemoveWord
}) => {
  // Create rows for all attempts
  const rows = Array.from({ length: maxAttempts });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const word = e.dataTransfer.getData("text/plain");
    const sourceIndexStr = e.dataTransfer.getData("application/x-source-index");
    
    // If we have a source index, it's a reorder
    if (sourceIndexStr) {
        // Logic handled in parent via a slightly different signature if needed, 
        // but here we just pass the word and let parent figure out if it's new or moved?
        // Actually, to support swap, we should probably pass the source index too.
        // For simplicity, we'll just pass the word and the target index.
        // The App component will handle "if this word is already in the row, move it".
    }
    onDropWord(word, targetIndex);
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-md mx-auto p-2">
      {rows.map((_, rowIndex) => {
        const isPastGuess = rowIndex < guesses.length;
        const isCurrentRow = rowIndex === guesses.length;
        
        // Prepare data for this row
        let rowWords: { word: string; status: WordStatus }[] = [];

        if (isPastGuess) {
          rowWords = guesses[rowIndex];
        } else if (isCurrentRow) {
          // Fill with current inputs, ensure 5 slots
          rowWords = Array.from({ length: WORD_COUNT }).map((_, i) => ({
            word: currentGuess[i] || '',
            status: WordStatus.PENDING
          }));
        } else {
          // Empty future rows
          rowWords = Array.from({ length: WORD_COUNT }).map(() => ({
            word: '',
            status: WordStatus.PENDING
          }));
        }

        return (
          <div key={rowIndex} className="grid grid-cols-5 gap-1.5 md:gap-2 h-12 md:h-14">
            {rowWords.map((item, colIndex) => {
              const isActive = isCurrentRow && colIndex === activeSlotIndex;
              
              return (
                <div 
                  key={colIndex} 
                  onClick={() => isCurrentRow ? onSlotClick(colIndex) : undefined}
                  onDragOver={isCurrentRow ? handleDragOver : undefined}
                  onDrop={isCurrentRow ? (e) => handleDrop(e, colIndex) : undefined}
                  className={`
                    relative flex items-center justify-center rounded-md border-2
                    ${isActive 
                        ? 'border-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.3)] bg-indigo-900/20' 
                        : (!item.word && !isPastGuess ? 'border-slate-800 bg-slate-900/50' : 'border-transparent')}
                    transition-all duration-300
                  `}
                >
                  {item.word ? (
                    <WordPill 
                      word={item.word} 
                      status={isPastGuess ? item.status : WordStatus.PENDING}
                      disabled={!isCurrentRow} 
                      size="sm"
                      draggable={isCurrentRow}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", item.word);
                        e.dataTransfer.setData("application/x-source-index", colIndex.toString());
                      }}
                      onRemove={isCurrentRow ? () => onRemoveWord(colIndex) : undefined}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};