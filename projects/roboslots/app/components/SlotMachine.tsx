import React, { useState, useEffect, useRef } from 'react';
import { spinReels, getRandomPart, hasFullRobotSet, calculateLevelUpStats } from '../services/gameLogic';
import { SLOT_SYMBOLS, COST_PER_SPIN, JACKPOT_REWARD_COINS } from '../constants';
import { PlayerState, RobotPart, Rarity } from '../types';
import { Zap, Coins, Gift } from 'lucide-react';

interface SlotMachineProps {
  playerState: PlayerState;
  updateState: (newState: Partial<PlayerState>) => void;
  addNotification: (msg: string) => void;
}

type WinResult = {
  type: 'PART' | 'LEVELUP' | 'JACKPOT' | 'COINS';
  part?: RobotPart;
  coins?: number;
  message: string;
};

const getSymbolIcon = (id: string) => {
    const symbol = SLOT_SYMBOLS.find(s => s.id === id);
    return symbol ? symbol.icon : '?';
};

const getRarityColor = (rarity: Rarity) => {
    switch (rarity) {
      case Rarity.COMMON: return 'border-slate-500';
      case Rarity.RARE: return 'border-blue-500';
      case Rarity.EPIC: return 'border-purple-500';
      case Rarity.LEGENDARY: return 'border-yellow-500';
      default: return 'border-slate-600';
    }
};

const SlotMachine: React.FC<SlotMachineProps> = ({ playerState, updateState, addNotification }) => {
  const [reels, setReels] = useState<string[]>(['coin', 'coin', 'coin']);
  const [displayReels, setDisplayReels] = useState<string[]>(['coin', 'coin', 'coin']);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winResult, setWinResult] = useState<WinResult | null>(null);

  const spinTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const winResultTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blurIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (playerState.tutorialStep === 2 && hasFullRobotSet(playerState.inventory)) {
      updateState({ tutorialStep: 3 });
      addNotification("You have all necessary parts! Go to Workshop.");
    }
  }, [playerState.inventory, playerState.tutorialStep, updateState, addNotification]);

  useEffect(() => {
    return () => {
      if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
      if (winResultTimeoutRef.current) clearTimeout(winResultTimeoutRef.current);
      if (blurIntervalRef.current) clearInterval(blurIntervalRef.current);
    };
  }, []);

  const handleRefill = () => {
      updateState({ coins: playerState.coins + 50 });
      addNotification("Emergency Funds Added!");
  };

  const handleSpin = () => {
    if (isSpinning || playerState.coins < COST_PER_SPIN) return;

    setIsSpinning(true);
    setWinResult(null);

    const nextSpinCount = (playerState.spinCount || 0) + 1;
    updateState({
        coins: playerState.coins - COST_PER_SPIN,
        spinCount: nextSpinCount
    });

    blurIntervalRef.current = setInterval(() => {
      const randomReels = [
          SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)].id,
          SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)].id,
          SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)].id,
      ];
      setDisplayReels(randomReels);
    }, 75);

    const stateForLogic = {
        ...playerState,
        spinCount: nextSpinCount
    };
    const newReels = spinReels(stateForLogic);

    spinTimeoutRef.current = setTimeout(() => {
      if (blurIntervalRef.current) clearInterval(blurIntervalRef.current);
      setReels(newReels);
      setDisplayReels(newReels);
      processSpinResult(newReels);
      setIsSpinning(false);
    }, 1500); // Animation duration
  };

  const processSpinResult = (finalReels: string[]) => {
    const [r1, r2, r3] = finalReels;
    let winType = '';

    if (r1 === r2 && r2 === r3) {
      winType = r1;
    } else if (r1 === r2 || r2 === r3) {
      winType = r2 === 'wild' ? r1 : r2;
    } else if (r1 === r3) {
      winType = r1;
    }

    if (finalReels.includes('wild')) {
        const nonWild = finalReels.find(r => r !== 'wild');
        if (nonWild) {
            const occurrences = finalReels.filter(r => r === nonWild).length;
            if (occurrences >= 1) {
                winType = nonWild;
            }
        } else { // All wilds
            winType = 'wild';
        }
    }

    let result: WinResult | null = null;
    if (winType && winType !== '') {
      if (winType === 'coin') {
        result = { type: 'COINS', coins: 15, message: `You won 15 Coins!` };
        updateState({ coins: playerState.coins - COST_PER_SPIN + 15 });
      } else if (winType === 'wild') {
        result = { type: 'JACKPOT', coins: JACKPOT_REWARD_COINS, message: `JACKPOT! +${JACKPOT_REWARD_COINS} Coins!` };
        updateState({ coins: playerState.coins - COST_PER_SPIN + JACKPOT_REWARD_COINS });
      } else {
        const newPart = getRandomPart(winType);
        const existingPart = playerState.inventory.find(p => p.templateId === newPart.templateId);
        
        if (existingPart) {
            const leveledUpPart = calculateLevelUpStats(existingPart);
            const newInventory = playerState.inventory.map(p => p.id === existingPart.id ? leveledUpPart : p);
            updateState({ inventory: newInventory });
            result = { type: 'LEVELUP', part: leveledUpPart, message: `${leveledUpPart.name} Leveled Up!` };
        } else {
            updateState({ inventory: [...playerState.inventory, newPart] });
            result = { type: 'PART', part: newPart, message: `New Part: ${newPart.name}` };
        }
      }
    }

    if (result) {
        setWinResult(result);
        winResultTimeoutRef.current = setTimeout(() => setWinResult(null), 4000);
    }
  };

  const canSpin = playerState.coins >= COST_PER_SPIN;

  return (
    <div className="h-full bg-slate-900 flex flex-col items-center justify-start pt-10 p-4 overflow-hidden">
        <p className="text-center text-slate-400 mb-4 text-sm font-bold">Match 3 to win parts or Level Up!</p>
        <div className="w-full max-w-sm bg-slate-800/50 rounded-3xl border-2 border-slate-700 shadow-2xl shadow-cyan-900/20 p-6 space-y-6">
            
            {/* Reels Display */}
            <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800 shadow-inner">
                <div className="flex justify-around space-x-3 h-28 slot-reel-container">
                    {displayReels.map((symbol, index) => (
                        <div key={index} className="w-1/3 bg-slate-900 rounded-lg flex items-center justify-center text-6xl shadow-inner border border-slate-800 overflow-hidden">
                             <div className={`transition-all duration-100 ${isSpinning ? 'blur-sm scale-90 opacity-80' : 'animate-in fade-in zoom-in-100'}`}>
                                {getSymbolIcon(symbol)}
                             </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Win Result Area */}
            <div className="h-24 flex items-center justify-center">
              {winResult && (
                  <div key={winResult.message} className={`w-full p-3 rounded-xl border-2 flex items-center space-x-3 bg-slate-800 shadow-lg animate-in fade-in zoom-in-90 duration-500 ${winResult.part ? getRarityColor(winResult.part.rarity) : 'border-yellow-500'}`}>
                      <div className="flex-shrink-0 text-3xl">
                        {winResult.part ? getSymbolIcon(winResult.part.type.toLowerCase()) : <Coins className="text-yellow-400" />}
                      </div>
                      <div className="flex-1">
                          <p className="font-bold text-white leading-tight">{winResult.message}</p>
                          {winResult.part && <p className="text-xs text-slate-400">Power: +{winResult.part.statBonus}</p>}
                          {winResult.type === 'JACKPOT' && <p className="text-xs text-yellow-400 font-bold">Incredible Luck!</p>}
                      </div>
                      <Gift size={24} className="text-cyan-400" />
                  </div>
              )}
            </div>
            
            {/* Spin Button */}
            {!canSpin ? (
                 <button
                    onClick={handleRefill}
                    className="w-full py-4 rounded-xl font-display text-2xl font-bold tracking-widest flex items-center justify-center transition-all duration-300 bg-yellow-600 text-white border-b-4 border-yellow-800 hover:brightness-110 active:scale-95 shadow-lg"
                >
                    <div className="flex items-center justify-center">
                        <span>REFILL (+50)</span>
                    </div>
                </button>
            ) : (
                <button
                    onClick={handleSpin}
                    disabled={isSpinning}
                    className={`w-full py-4 rounded-xl font-display text-2xl font-bold tracking-widest flex items-center justify-center transition-all duration-300 active:scale-95 border-b-4 shadow-lg
                    ${isSpinning ? 'bg-purple-800 text-purple-300 border-purple-950 animate-pulse' 
                    : 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white border-purple-800 hover:brightness-110'}`}
                >
                    {isSpinning ? 'SPINNING...' : (
                        <div className="flex items-center justify-center">
                            <span>SPIN</span>
                            <span className="flex items-center ml-2 text-xl">
                                (-{COST_PER_SPIN}
                                <Coins size={20} className="ml-1.5 text-yellow-300" />)
                            </span>
                        </div>
                    )}
                </button>
            )}
        </div>
    </div>
  );
};

export default SlotMachine;