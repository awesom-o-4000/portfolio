import React, { useState, useEffect } from 'react';
import { GameMode } from './types';
import { TuringMode } from './components/TuringMode';
import { GlitchMode } from './components/GlitchMode';
import { CyberButton } from './components/ui/CyberButton';

export default function App() {
  const [mode, setMode] = useState<GameMode>(GameMode.MENU);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem('REAL_OR_AI_HIGHSCORE');
    if (stored) setHighScore(parseInt(stored, 10));
  }, [mode]); // Re-check score when returning to menu

  // Simple background grid effect
  const bgGrid = {
    backgroundImage: `linear-gradient(rgba(0, 240, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 240, 255, 0.05) 1px, transparent 1px)`,
    backgroundSize: '40px 40px'
  };

  const renderContent = () => {
    switch (mode) {
      case GameMode.TURING:
        return <TuringMode setMode={setMode} />;
      case GameMode.GLITCH:
        return <GlitchMode setMode={setMode} />;
      case GameMode.MENU:
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-12 animate-in fade-in duration-700">
            <div className="relative">
              <h1 className="text-6xl md:text-8xl font-cyber font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyber-primary via-white to-cyber-secondary relative z-10">
                REAL OR AI?
              </h1>
              <div className="absolute -inset-1 bg-cyber-primary/20 blur-xl"></div>
            </div>
            
            <div className="space-y-2">
              <p className="max-w-md mx-auto text-gray-400 font-mono text-sm md:text-base leading-relaxed">
                PROTOCOL INITIATED. TEST YOUR PERCEPTION AGAINST GENERATIVE ADVERSARIAL NETWORKS.
              </p>
              {highScore > 0 && (
                <div className="inline-block border border-cyber-accent/30 bg-cyber-accent/10 px-4 py-2 rounded">
                  <span className="text-cyber-accent font-cyber text-sm tracking-widest">MAX_HUMANITY_SCORE: {highScore}</span>
                </div>
              )}
            </div>

            <div className="grid gap-6 w-full max-w-sm mx-auto">
              <CyberButton onClick={() => setMode(GameMode.TURING)}>
                START TURING TEST
              </CyberButton>
              
              <CyberButton variant="accent" onClick={() => setMode(GameMode.GLITCH)}>
                GLITCH MODE (BETA)
              </CyberButton>
            </div>

            <div className="absolute bottom-4 right-4 text-xs font-mono text-gray-600">
              BUILD: PROTOTYPE_1.1 // POWERED BY GEMINI 2.5
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-cyber-black text-white relative overflow-hidden font-sans selection:bg-cyber-primary selection:text-black">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none" style={bgGrid}></div>
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-cyber-primary/5 to-transparent pointer-events-none"></div>
      
      {/* Main Container */}
      <div className="relative z-10 w-full h-screen overflow-y-auto">
         {renderContent()}
      </div>
    </div>
  );
}