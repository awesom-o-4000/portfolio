import React, { useState, useEffect, useRef } from 'react';
import { PlayerState, BattleResult, BattleRecord } from '../types';
import { simulateBattle, calculatePower } from '../services/gameLogic';
import { generateBattleCommentary, generateBattleImage } from '../services/geminiService';
import { BATTLE_LOADING_TEXTS } from '../constants';
import { Swords, RefreshCw, Trophy, Skull, Activity, Zap } from 'lucide-react';

interface BattleArenaProps {
  playerState: PlayerState;
  updateState: (newState: Partial<PlayerState>) => void;
}

type BattleStage = 'IDLE' | 'SIMULATING' | 'RESULTS';

const BattleArena: React.FC<BattleArenaProps> = ({ playerState, updateState }) => {
  const [stage, setStage] = useState<BattleStage>('IDLE');
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [commentary, setCommentary] = useState<string>("");
  const [battleImage, setBattleImage] = useState<string | null>(null);
  
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState(BATTLE_LOADING_TEXTS[0]);

  const activeRobot = playerState.robots.find(r => r.id === playerState.activeRobotId);
  const myPower = activeRobot ? calculatePower(activeRobot) : 0;
  const isComplete = activeRobot && Object.keys(activeRobot.parts).length === 5;


  const handleStartBattle = async () => {
    if (!activeRobot) return;
    setStage('SIMULATING');
    setProgress(0);
    setBattleResult(null);
    setBattleImage(null);
    setCommentary("");
    
    // 1. Instant Calculation
    const result = simulateBattle(activeRobot);
    setBattleResult(result);

    // 2. Start Visual Simulation
    const totalDuration = 4000;
    const intervalTime = 100;
    const steps = totalDuration / intervalTime;
    let currentStep = 0;

    const progressInterval = setInterval(() => {
        currentStep++;
        const newProgress = Math.min(95, (currentStep / steps) * 100);
        setProgress(newProgress);
        
        if (currentStep % 10 === 0) {
            const randomText = BATTLE_LOADING_TEXTS[Math.floor(Math.random() * BATTLE_LOADING_TEXTS.length)];
            setLoadingText(randomText);
        }
    }, intervalTime);

    // 3. Trigger Async Generation
    const outcome = result.winner === 'PLAYER' ? 'VICTORY' : 'DEFEAT';
    
    let generatedImg: string | undefined;

    try {
        const [comm, img] = await Promise.all([
            generateBattleCommentary(result, activeRobot, Math.floor(myPower * 0.9)),
            generateBattleImage(activeRobot, result.enemyName, outcome)
        ]);
        setCommentary(comm);
        if (img) {
            setBattleImage(img);
            generatedImg = img;
        }
    } catch (e) {
        console.error("Generation error", e);
    }

    // 4. Finish Simulation
    setTimeout(() => {
        clearInterval(progressInterval);
        setProgress(100);
        setTimeout(() => {
            finishBattle(result, generatedImg);
        }, 500);
    }, totalDuration);
  };

  const finishBattle = (result: BattleResult, imgUrl?: string) => {
    setStage('RESULTS');
    
    const record: BattleRecord = {
        id: Date.now().toString(),
        enemyName: result.enemyName,
        outcome: result.winner === 'PLAYER' ? 'VICTORY' : 'DEFEAT',
        date: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        reward: result.reward,
        battleImageUrl: imgUrl
    };

    const newHistory = [record, ...playerState.battleHistory].slice(0, 10);

    if (result.winner === 'PLAYER') {
      updateState({
        coins: playerState.coins + result.reward,
        wins: playerState.wins + 1,
        battleHistory: newHistory
      });
    } else {
      updateState({
          coins: playerState.coins + result.reward,
          losses: playerState.losses + 1,
          battleHistory: newHistory
      });
    }
  };

  const resetBattle = () => {
      setStage('IDLE');
      setBattleResult(null);
      setBattleImage(null);
  };

  if (!activeRobot || !isComplete) {
      return (
          <div className="flex flex-col items-center justify-start pt-20 h-full p-6 text-center">
              <Swords size={64} className="text-slate-700 mb-4" />
              <h2 className="text-xl font-bold text-slate-300">Robot Incomplete</h2>
              <p className="text-slate-500 mt-2">Your robot needs all 5 part types (Head, Body, Arms, Legs, Weapon) to battle. Visit the Workshop.</p>
          </div>
      )
  }

  return (
    <div className="h-full bg-slate-900 flex flex-col p-4 pt-8 overflow-y-auto pb-24 relative">
      
      {/* IDLE STATE */}
      {stage === 'IDLE' && (
        <div className="flex-1 flex flex-col items-center justify-start mt-8 space-y-8 animate-in fade-in duration-500">
            <div className="text-center">
                <h2 className="text-4xl font-display font-bold text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)] mb-1">BATTLE ARENA</h2>
                <p className="text-slate-400">Challenge AI Trainers</p>
            </div>

            <div className="w-48 h-48 rounded-full border-4 border-slate-700 bg-slate-800 flex items-center justify-center relative shadow-2xl shadow-red-900/20 group">
                 <div className="absolute inset-0 rounded-full border border-red-500/30 animate-ping opacity-20 group-hover:opacity-40"></div>
                 {activeRobot.imageUrl ? (
                     <img src={activeRobot.imageUrl} className="w-full h-full object-cover rounded-full opacity-90" alt="My Robot" />
                 ) : (
                     <span className="text-6xl">🤖</span>
                 )}
                 <div className="absolute -bottom-4 bg-slate-900 px-4 py-1 rounded border border-slate-600 text-yellow-400 font-mono font-bold z-10 shadow-lg whitespace-nowrap">
                     {activeRobot.name} | PWR: {myPower}
                 </div>
            </div>

            <button
                onClick={handleStartBattle}
                className="w-full max-w-xs py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white rounded-xl font-display text-2xl font-bold tracking-widest shadow-lg shadow-red-600/30 flex items-center justify-center transition-all active:scale-95 border-b-4 border-red-900"
            >
                <Swords className="mr-3 fill-current" size={28} /> FIGHT
            </button>
            
            <div className="text-xs text-slate-600 font-mono">
                System Status: <span className="text-green-500">READY</span>
            </div>
        </div>
      )}

      {/* SIMULATING STATE */}
      {stage === 'SIMULATING' && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-in zoom-in-95 duration-300">
            <Swords size={80} className="text-red-500 animate-pulse drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]" />
            
            <div className="w-full max-w-sm space-y-2">
                 <div className="flex justify-between text-xs font-mono uppercase tracking-widest text-red-400">
                     <span>Combat Simulation</span>
                     <span>{Math.round(progress)}%</span>
                 </div>
                 <div className="h-4 bg-slate-800 rounded-full border border-slate-700 overflow-hidden relative">
                     <div 
                        className="h-full bg-red-600 relative overflow-hidden transition-all duration-100 ease-linear"
                        style={{ width: `${progress}%` }}
                     >
                         <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] animate-[shimmer_1s_infinite]"></div>
                     </div>
                 </div>
                 <p className="text-center text-sm font-mono text-slate-300 h-6 animate-pulse">
                     {loadingText}
                 </p>
            </div>
        </div>
      )}

      {/* RESULTS STATE */}
      {stage === 'RESULTS' && battleResult && (
        <div className="flex-1 flex flex-col space-y-4 animate-in slide-in-from-bottom-10 fade-in duration-500">
            
            <div className="relative w-full rounded-2xl overflow-hidden border-2 shadow-2xl bg-slate-800 flex flex-col"
                 style={{ borderColor: battleResult.winner === 'PLAYER' ? '#22c55e' : '#ef4444' }}>
                
                <div className="relative w-full aspect-video bg-black">
                     {battleImage ? (
                         <img src={battleImage} alt="Battle Result" className="w-full h-full object-cover opacity-80" />
                     ) : (
                         <div className="w-full h-full flex items-center justify-center bg-slate-900">
                             <Activity size={48} className="text-slate-600" />
                         </div>
                     )}
                     
                     <div className={`absolute inset-0 bg-gradient-to-t ${battleResult.winner === 'PLAYER' ? 'from-green-900/80' : 'from-red-900/80'} to-transparent via-transparent`}></div>
                     
                     <div className="absolute bottom-4 left-0 right-0 text-center">
                         <h2 className={`text-5xl font-display font-black tracking-tighter uppercase drop-shadow-xl ${battleResult.winner === 'PLAYER' ? 'text-white' : 'text-red-200'}`}>
                             {battleResult.winner === 'PLAYER' ? 'VICTORY' : 'DEFEAT'}
                         </h2>
                         <div className="flex justify-center items-center space-x-2 mt-2">
                             {battleResult.winner === 'PLAYER' ? <Trophy className="text-yellow-400" size={20} /> : <Skull className="text-white" size={20} />}
                             <span className="font-bold text-white text-lg">
                                 +{battleResult.reward} COINS
                             </span>
                         </div>
                     </div>
                </div>

                <div className="p-4 bg-slate-800 border-t border-slate-700">
                    <p className="text-sm italic text-slate-300 text-center">
                        "{commentary || 'Connection established. Downloading battle logs...'}"
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                 <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 flex flex-col items-center">
                     <span className="text-xs text-slate-500 uppercase">Enemy</span>
                     <span className="font-bold text-slate-200">{battleResult.enemyName}</span>
                 </div>
                 <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 flex flex-col items-center">
                     <span className="text-xs text-slate-500 uppercase">Turns</span>
                     <span className="font-bold text-slate-200">{battleResult.log.length}</span>
                 </div>
            </div>

            <button
                onClick={resetBattle}
                className="py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold font-display tracking-widest flex items-center justify-center border border-slate-600 shadow-lg active:scale-95 transition-transform"
            >
                <RefreshCw className="mr-2" size={20} /> RETURN TO BASE
            </button>
        </div>
      )}
    </div>
  );
};

export default BattleArena;