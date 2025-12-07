import React, { useState, useEffect, useCallback } from 'react';
import { generateLevel } from './services/geminiService';
import { GameLevel, GameStatus, GuessResult, WordStatus } from './types';
import { Grid } from './components/Grid';
import { Keyboard } from './components/Keyboard';
import { RulesModal } from './components/RulesModal';
import { Legend } from './components/Legend';

const MAX_ATTEMPTS = 6;
const WORD_COUNT = 5;

const App: React.FC = () => {
  const [level, setLevel] = useState<GameLevel | null>(null);
  const [status, setStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [guesses, setGuesses] = useState<GuessResult[][]>([]);
  
  // Current guess state
  const [currentGuess, setCurrentGuess] = useState<string[]>(Array(WORD_COUNT).fill(''));
  const [activeSlotIndex, setActiveSlotIndex] = useState<number>(0);
  
  const [error, setError] = useState<string | null>(null);
  const [showRules, setShowRules] = useState(false);
  const [shareText, setShareText] = useState('Share');

  // Show rules on first visit
  useEffect(() => {
    const hasSeenRules = localStorage.getItem('promptle_has_seen_rules');
    if (!hasSeenRules) {
      setShowRules(true);
    }
  }, []);

  const handleCloseRules = () => {
    setShowRules(false);
    localStorage.setItem('promptle_has_seen_rules', 'true');
  };

  const startNewGame = useCallback(async () => {
    setStatus(GameStatus.LOADING);
    setError(null);
    setGuesses([]);
    setCurrentGuess(Array(WORD_COUNT).fill(''));
    setActiveSlotIndex(0);
    setShareText('Share');
    
    try {
      const newLevel = await generateLevel();
      setLevel(newLevel);
      setStatus(GameStatus.PLAYING);
    } catch (e) {
      console.error(e);
      setError("Failed to generate level. Please check your API key and try again.");
      setStatus(GameStatus.IDLE);
    }
  }, []);

  const handleWordSelect = (word: string) => {
    if (status !== GameStatus.PLAYING || currentGuess.includes(word)) return;
    
    const newGuess = [...currentGuess];
    newGuess[activeSlotIndex] = word;
    setCurrentGuess(newGuess);

    // Auto-advance logic
    let nextIndex = -1;
    for (let i = activeSlotIndex + 1; i < WORD_COUNT; i++) {
        if (!newGuess[i]) {
            nextIndex = i;
            break;
        }
    }
    if (nextIndex === -1) {
        for (let i = 0; i < activeSlotIndex; i++) {
            if (!newGuess[i]) {
                nextIndex = i;
                break;
            }
        }
    }
    
    if (nextIndex !== -1) {
        setActiveSlotIndex(nextIndex);
    }
  };

  const handleSlotClick = (index: number) => {
    if (status === GameStatus.PLAYING) {
        setActiveSlotIndex(index);
    }
  };

  const handleDropWord = (word: string, targetIndex: number) => {
    if (status !== GameStatus.PLAYING) return;

    const newGuess = [...currentGuess];
    
    const existingIndex = newGuess.findIndex((w, i) => w === word && i !== targetIndex);
    
    if (existingIndex !== -1) {
        const targetWord = newGuess[targetIndex];
        newGuess[targetIndex] = word;
        newGuess[existingIndex] = targetWord;
        setActiveSlotIndex(targetIndex);
    } else {
        if (!currentGuess.includes(word)) { // Prevent dropping a word if it's already in the guess
            newGuess[targetIndex] = word;
            setActiveSlotIndex(targetIndex);
        }
    }

    setCurrentGuess(newGuess);
  };

  const handleDelete = () => {
    if (status !== GameStatus.PLAYING) return;
    
    const newGuess = [...currentGuess];
    
    if (newGuess[activeSlotIndex]) {
        newGuess[activeSlotIndex] = '';
    } else {
        const prevIndex = activeSlotIndex - 1;
        if (prevIndex >= 0) {
            newGuess[prevIndex] = '';
            setActiveSlotIndex(prevIndex);
        }
    }
    
    setCurrentGuess(newGuess);
  };

  const handleRemoveWord = (index: number) => {
    if (status !== GameStatus.PLAYING) return;
    const newGuess = [...currentGuess];
    newGuess[index] = '';
    setCurrentGuess(newGuess);
    setActiveSlotIndex(index);
  }

  const handleMoveSelection = (direction: 'left' | 'right') => {
      if (status !== GameStatus.PLAYING) return;
      const newGuess = [...currentGuess];
      
      if (direction === 'left') {
          if (activeSlotIndex > 0) {
              const temp = newGuess[activeSlotIndex];
              newGuess[activeSlotIndex] = newGuess[activeSlotIndex - 1];
              newGuess[activeSlotIndex - 1] = temp;
              setActiveSlotIndex(activeSlotIndex - 1);
          }
      } else {
          if (activeSlotIndex < WORD_COUNT - 1) {
              const temp = newGuess[activeSlotIndex];
              newGuess[activeSlotIndex] = newGuess[activeSlotIndex + 1];
              newGuess[activeSlotIndex + 1] = temp;
              setActiveSlotIndex(activeSlotIndex + 1);
          }
      }
      setCurrentGuess(newGuess);
  };

  const checkGuess = (guess: string[], target: string[]): GuessResult[] => {
    const result: GuessResult[] = guess.map(w => ({ word: w, status: WordStatus.ABSENT }));
    const targetCounts: Record<string, number> = {};
    
    target.forEach(w => {
      targetCounts[w] = (targetCounts[w] || 0) + 1;
    });

    guess.forEach((w, i) => {
      if (w === target[i]) {
        result[i].status = WordStatus.CORRECT;
        targetCounts[w]--;
      }
    });

    guess.forEach((w, i) => {
      if (result[i].status !== WordStatus.CORRECT) {
        if (targetCounts[w] > 0) {
          result[i].status = WordStatus.PRESENT;
          targetCounts[w]--;
        }
      }
    });

    return result;
  };

  const handleSubmit = () => {
    if (currentGuess.some(w => !w) || !level) return;

    const result = checkGuess(currentGuess, level.targetPrompt);
    const newGuesses = [...guesses, result];
    setGuesses(newGuesses);
    
    setCurrentGuess(Array(WORD_COUNT).fill(''));
    setActiveSlotIndex(0);

    const isWin = result.every(r => r.status === WordStatus.CORRECT);
    if (isWin) {
      setStatus(GameStatus.WON);
    } else if (newGuesses.length >= MAX_ATTEMPTS) {
      setStatus(GameStatus.LOST);
    }
  };
  
  const handleShare = () => {
    const isWin = status === GameStatus.WON;
    const title = `Promptle ${isWin ? guesses.length : 'X'}/${MAX_ATTEMPTS}`;
    
    const resultLines = guesses.map(row => {
      return row.map(cell => {
        switch(cell.status) {
          case WordStatus.CORRECT: return '🟩';
          case WordStatus.PRESENT: return '🟨';
          case WordStatus.ABSENT: return '⬛';
          default: return '⬛';
        }
      }).join('');
    }).join('\n');
    
    const shareString = `${title}\n\n${resultLines}`;

    navigator.clipboard.writeText(shareString).then(() => {
      setShareText('Copied!');
      setTimeout(() => setShareText('Share'), 2000);
    }).catch(err => {
      console.error('Failed to copy results:', err);
      setShareText('Failed!');
      setTimeout(() => setShareText('Share'), 2000);
    });
  };

  const usedWords = new Map<string, WordStatus>();
  guesses.forEach(row => {
    row.forEach(({ word, status }) => {
      const current = usedWords.get(word);
      if (status === WordStatus.CORRECT) {
        usedWords.set(word, WordStatus.CORRECT);
      } else if (status === WordStatus.PRESENT && current !== WordStatus.CORRECT) {
        usedWords.set(word, WordStatus.PRESENT);
      } else if (status === WordStatus.ABSENT && !current) {
        usedWords.set(word, WordStatus.ABSENT);
      }
    });
  });

  const filledCount = currentGuess.filter(Boolean).length;

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-slate-100 flex flex-col items-center relative overflow-hidden">
      
      <RulesModal isOpen={showRules} onClose={handleCloseRules} />

      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-96 bg-indigo-900/20 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="w-full p-4 flex justify-between items-center z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-lg shadow-lg">P</div>
           <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Promptle</h1>
        </div>
        <div className="flex items-center gap-2">
            <button
                onClick={() => setShowRules(true)}
                className="p-2 text-yellow-400 hover:text-yellow-200 transition-colors rounded-full hover:bg-slate-800"
                aria-label="Rules"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-1.94c.413-.092.812-.21 1.19-.355 2.13-.815 3.65-2.863 3.65-5.205 0-3.038-2.462-5.5-5.5-5.5S6 8.5 6 11.54c0 2.342 1.52 4.39 3.65 5.205.378.145.777.263 1.19.355V18m0 0a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5" />
                </svg>
            </button>
            {status !== GameStatus.LOADING && status !== GameStatus.IDLE && (
                <button 
                    onClick={startNewGame}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors text-slate-300 border border-slate-700"
                >
                    New Game
                </button>
            )}
        </div>
      </header>

      <main className="flex-1 w-full flex flex-col max-w-lg relative z-0 overflow-hidden">
        
        {/* IDLE / LOADING STATE */}
        {(status === GameStatus.IDLE || status === GameStatus.LOADING) && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8 overflow-y-auto">
                {status === GameStatus.IDLE ? (
                    <>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold">Guess the AI Prompt</h2>
                            <p className="text-slate-400">
                                An image will be generated. You have 6 attempts to guess the 5-word prompt used to create it.
                            </p>
                        </div>
                        <button 
                            onClick={startNewGame}
                            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-lg shadow-xl shadow-indigo-500/20 transition-all active:scale-95"
                        >
                            Start Game
                        </button>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-4 animate-pulse">
                        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-indigo-400 font-medium">Summoning creative spirits...</p>
                        <p className="text-xs text-slate-500">Thinking of a difficult prompt...</p>
                    </div>
                )}
                {error && <div className="text-rose-400 bg-rose-900/20 p-4 rounded-lg text-sm">{error}</div>}
            </div>
        )}

        {/* ACTIVE GAME STATE */}
        {(status === GameStatus.PLAYING || status === GameStatus.WON || status === GameStatus.LOST) && level && (
            <>
                <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
                    {/* Image Section */}
                    <div className="p-4 flex flex-col items-center gap-2 shrink-0">
                        <div className="relative group rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 w-56 h-56 sm:w-64 sm:h-64 md:w-80 md:h-80 bg-slate-900">
                            <img 
                                src={level.imageUrl} 
                                alt="AI Generated" 
                                className="w-full h-full object-cover" 
                            />
                            <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-xl pointer-events-none"></div>
                        </div>
                        {guesses.length > 0 && <Legend />}
                    </div>

                    {/* Grid */}
                    <div className="px-2 pb-4">
                        <Grid 
                            guesses={guesses} 
                            currentGuess={currentGuess} 
                            maxAttempts={MAX_ATTEMPTS}
                            activeSlotIndex={activeSlotIndex}
                            onSlotClick={handleSlotClick}
                            onDropWord={handleDropWord}
                            onRemoveWord={handleRemoveWord}
                        />
                    </div>
                </div>

                {/* Controls (Word Bank) */}
                {(status === GameStatus.PLAYING) && (
                    <Keyboard 
                        wordBank={level.wordBank} 
                        usedWords={usedWords}
                        currentGuess={currentGuess}
                        onWordSelect={handleWordSelect}
                        onDelete={handleDelete}
                        onSubmit={handleSubmit}
                        onMoveLeft={() => handleMoveSelection('left')}
                        onMoveRight={() => handleMoveSelection('right')}
                        isSubmitDisabled={filledCount !== WORD_COUNT}
                        isDeleteDisabled={filledCount === 0}
                    />
                )}
            </>
        )}

        {/* Game Over Modal */}
        {(status === GameStatus.WON || status === GameStatus.LOST) && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center space-y-6 transform scale-100">
                    <div>
                        {status === GameStatus.WON ? (
                            <div className="text-5xl mb-2">🎉</div>
                        ) : (
                            <div className="text-5xl mb-2">🤖</div>
                        )}
                        <h2 className="text-2xl font-bold text-white">
                            {status === GameStatus.WON ? 'Brilliant!' : 'Game Over'}
                        </h2>
                        <p className="text-slate-400 mt-2">
                            {status === GameStatus.WON ? 'You cracked the code.' : 'The AI outsmarted you.'}
                        </p>
                    </div>

                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                        <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">The Prompt Was</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {level?.targetPrompt.map((word, i) => (
                                <span key={i} className="px-2 py-1 bg-indigo-900/50 text-indigo-300 rounded text-sm font-semibold border border-indigo-500/30">
                                    {word}
                                </span>
                            ))}
                        </div>
                    </div>
                    
                    <div className="w-full flex flex-col sm:flex-row-reverse gap-3">
                         <button 
                            onClick={startNewGame}
                            className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                        >
                            Play Again
                        </button>
                        <button 
                            onClick={handleShare}
                            className="w-full py-3 bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-600 transition-colors"
                        >
                            {shareText}
                        </button>
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
};

export default App;