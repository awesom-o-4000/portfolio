import React, { useState, useEffect, useRef } from 'react';
import Navigation from './components/Navigation';
import SlotMachine from './components/SlotMachine';
import Workshop from './components/Workshop';
import BattleArena from './components/BattleArena';
import Profile from './components/Profile';
import Onboarding from './components/Onboarding';
import { GameView, PlayerState } from './types';
import { INITIAL_PLAYER_STATE, MOCK_LEADERBOARD } from './constants';
import { Coins, Box, Info, Gamepad2, Play } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<GameView>(GameView.SLOTS);
  const [playerState, setPlayerState] = useState<PlayerState>(INITIAL_PLAYER_STATE);
  const [notification, setNotification] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const notificationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleStartGame = () => {
      setGameStarted(true);
      if (playerState.tutorialStep === 0) {
        setShowOnboarding(true);
      }
  };

  const handleOnboardingClose = () => {
      setShowOnboarding(false);
      if (playerState.tutorialStep === 0) {
          updateState({ tutorialStep: 1 }); // Mark onboarding as complete
      }
  };

  const updateState = (newState: Partial<PlayerState>) => {
    setPlayerState(prev => ({ ...prev, ...newState }));
  };

  const addNotification = (msg: string) => {
    if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
    }
    setNotification(msg);
    notificationTimeoutRef.current = setTimeout(() => {
        setNotification(null);
        notificationTimeoutRef.current = null;
    }, 3000);
  };

  const handleSetView = (view: GameView) => {
      if (notificationTimeoutRef.current) {
          clearTimeout(notificationTimeoutRef.current);
      }
      setNotification(null);
      setCurrentView(view);
  };

  useEffect(() => {
     if (playerState.tutorialStep === 3 && currentView !== GameView.WORKSHOP) {
        addNotification("New parts available! Check the Workshop.");
     }
  }, [playerState.tutorialStep, currentView]);

  const renderView = () => {
    switch (currentView) {
      case GameView.SLOTS:
        return <SlotMachine playerState={playerState} updateState={updateState} addNotification={addNotification} />;
      case GameView.WORKSHOP:
        return <Workshop playerState={playerState} updateState={updateState} />;
      case GameView.BATTLE:
        return <BattleArena playerState={playerState} updateState={updateState} />;
      case GameView.PROFILE:
        return <Profile playerState={playerState} updateState={updateState} />;
      case GameView.LEADERBOARD:
        const leaderboardData = [...MOCK_LEADERBOARD, { name: playerState.playerName, wins: playerState.wins }]
            .sort((a, b) => b.wins - a.wins);

        return (
            <div className="flex flex-col items-center justify-start pt-16 h-full p-6 bg-slate-900 text-center">
                <h2 className="text-2xl font-display font-bold text-white mb-6">LEADERBOARD</h2>
                <div className="bg-slate-800 rounded-xl p-4 w-full max-w-sm border border-slate-700 shadow-xl">
                    <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-2 text-slate-400 text-xs uppercase font-display tracking-wider">
                        <span>Rank</span>
                        <span>Player</span>
                        <span>Wins</span>
                    </div>
                    <div className="space-y-2">
                        {leaderboardData.map((player, index) => (
                            <div key={player.name + index} className={`flex justify-between items-center py-3 px-4 rounded-lg text-lg transition-all ${
                                player.name === playerState.playerName
                                ? 'bg-slate-700/50 text-cyan-400 font-bold border-2 border-cyan-500' 
                                : 'bg-slate-900/50 text-slate-300'
                            }`}>
                                <div className="flex items-center space-x-4">
                                    <span className="font-mono text-slate-500 w-6 text-center">#{index + 1}</span>
                                    <span>{player.name}</span>
                                </div>
                                <span className="font-bold font-mono">{player.wins}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
      default:
        return null;
    }
  };

  if (!gameStarted) {
      return (
          <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-950 to-black z-0"></div>
              <div className="absolute inset-0 z-0 opacity-20" style={{backgroundImage: 'linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>

              <div className="z-10 space-y-2">
                   <div className="inline-block p-4 rounded-full bg-slate-900/50 border border-cyan-500/30 mb-4 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                       <Gamepad2 size={48} className="text-cyan-400" />
                   </div>
                   <h1 className="text-4xl md:text-6xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 drop-shadow-lg tracking-tighter">
                      ROBOSLOTS
                   </h1>
                   <p className="text-slate-400 font-mono tracking-widest text-sm uppercase">Battle Assembly</p>
              </div>

              <div className="flex flex-col space-y-4 w-full max-w-xs z-10 pt-8">
                <button 
                    onClick={handleStartGame}
                    className="group relative w-full px-6 py-4 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-white font-bold font-display tracking-wider shadow-lg shadow-cyan-900/40 active:scale-95 transition-all overflow-hidden"
                >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                    <span className="flex items-center justify-center"><Play size={20} className="mr-2 fill-current" /> ENTER GAME</span>
                </button>
              </div>

               <p className="text-[10px] text-slate-600 z-10 max-w-xs leading-relaxed">
                  Spin the slots. Build the ultimate mech. Dominate the arena.
              </p>
          </div>
      )
  }

  return (
    <div 
      className="h-screen w-full flex flex-col bg-slate-950 font-sans text-slate-100 overflow-hidden"
    >
      {showOnboarding && <Onboarding onClose={handleOnboardingClose} />}
      
      {/* Top Header */}
      <div className="h-16 bg-slate-950 border-b-2 border-slate-800 flex items-center justify-between px-4 z-20 shadow-lg flex-shrink-0">
        <h1 className="font-display font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          ROBOSLOTS
        </h1>
        <div className="flex items-center space-x-3">
            <div className="bg-slate-800 border border-slate-700 rounded-full px-3 py-1 flex items-center space-x-2 shadow-inner">
                <Coins size={16} className="text-yellow-400" />
                <span className="font-bold font-mono text-lg text-white">{playerState.coins}</span>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-full px-3 py-1 flex items-center space-x-2 shadow-inner">
                <Box size={16} className="text-cyan-400" />
                <span className="font-bold font-mono text-lg text-white">{playerState.inventory.length}</span>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {renderView()}

        {notification && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-auto max-w-[90%] animate-in slide-in-from-top-5 fade-in duration-300 pointer-events-none">
                <div className="bg-slate-800/95 backdrop-blur-md border border-cyan-500/50 text-white px-4 py-2 rounded-full shadow-lg shadow-cyan-900/30 flex items-center justify-center space-x-2">
                    <Info size={16} className="text-cyan-400 flex-shrink-0" />
                    <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">{notification}</span>
                </div>
            </div>
        )}
      </div>

      <Navigation currentView={currentView} setView={handleSetView} inventory={playerState.inventory} />
    </div>
  );
};

export default App;