import React, { useState, useEffect } from 'react';
import { generateAICompanion, generateAIImageFromTopic } from '../services/geminiService';
import { CyberButton } from './ui/CyberButton';
import { GameMode } from '../types';
import { PICSUM_BASE } from '../constants';

interface TuringModeProps {
  setMode: (mode: GameMode) => void;
}

export const TuringMode: React.FC<TuringModeProps> = ({ setMode }) => {
  const [loading, setLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState<string>("");
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [realImg, setRealImg] = useState<string>("");
  const [aiImg, setAiImg] = useState<string>("");
  const [aiIsLeft, setAiIsLeft] = useState(false);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);

  const updateHighScore = (newScore: number) => {
    const currentHigh = parseInt(localStorage.getItem('REAL_OR_AI_HIGHSCORE') || '0', 10);
    if (newScore > currentHigh) {
        localStorage.setItem('REAL_OR_AI_HIGHSCORE', newScore.toString());
    }
  };

  const loadRound = async () => {
    setLoading(true);
    setResult(null);
    setLoadingStage("ACQUIRING TARGET SUBJECT...");
    
    const isLeft = Math.random() > 0.5;
    setAiIsLeft(isLeft);

    // 1. Get Real Image
    const randomSeed = Math.floor(Math.random() * 1000);
    const realUrl = `${PICSUM_BASE}?random=${randomSeed}`;
    setRealImg(realUrl);

    // 2. Generate AI Companion matching the real image
    setLoadingStage("SYNTHESIZING DOPPELGANGER...");
    try {
        let generated = await generateAICompanion(realUrl);
        
        // Fallback if image-to-image fails (e.g. CORS or model refusal)
        if (!generated) {
             console.warn("Falling back to topic generation");
             const topics = ['city street', 'forest path', 'cyberpunk room', 'vintage car', 'abstract art'];
             const topic = topics[Math.floor(Math.random() * topics.length)];
             generated = await generateAIImageFromTopic(topic);
        }

        if (generated) {
            setAiImg(generated);
        } else {
            setAiImg("https://picsum.photos/500/500?grayscale"); 
        }
    } catch (e) {
        console.error(e);
        setAiImg("https://picsum.photos/500/500?grayscale");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadRound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGuess = (pickedLeft: boolean) => {
    if (result) return; // already guessed

    const pickedAI = (pickedLeft && aiIsLeft) || (!pickedLeft && !aiIsLeft);
    
    if (pickedAI) {
        setResult('correct');
        const newScore = score + 100;
        setScore(newScore);
        updateHighScore(newScore);
    } else {
        setResult('wrong');
    }
  };

  const nextRound = () => {
      setRound(r => r + 1);
      loadRound();
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-end mb-6 border-b border-cyber-dim pb-4">
        <div>
            <h2 className="text-3xl font-cyber text-white">TURING TEST <span className="text-cyber-primary text-sm align-top">v1.1</span></h2>
            <p className="font-mono text-xs text-cyber-primary mt-1">IDENTIFY THE SYNTHETIC CLONE</p>
        </div>
        <div className="text-right">
            <div className="text-sm font-mono text-gray-400">HUMANITY SCORE</div>
            <div className="text-3xl font-cyber text-cyber-secondary">{score} <span className="text-sm">PTS</span></div>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {loading ? (
           <div className="flex flex-col items-center gap-4">
             <div className="w-16 h-16 border-4 border-cyber-primary border-t-transparent rounded-full animate-spin"></div>
             <p className="font-mono text-cyber-primary animate-pulse text-sm tracking-widest uppercase">{loadingStage}</p>
           </div>
        ) : (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Image A */}
                <div className="group relative">
                    <div className="aspect-square bg-cyber-dark border-2 border-cyber-dim overflow-hidden relative cursor-pointer" onClick={() => handleGuess(true)}>
                        <img src={aiIsLeft ? aiImg : realImg} alt="Sample A" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        {result && (
                            <div className={`absolute inset-0 flex items-center justify-center bg-black/60 font-cyber text-2xl font-bold ${aiIsLeft ? 'text-cyber-primary' : 'text-cyber-secondary'}`}>
                                {aiIsLeft ? 'AI GENERATED' : 'HUMAN MADE'}
                            </div>
                        )}
                        <div className="absolute top-2 left-2 bg-black/80 px-2 py-1 text-xs font-mono text-white border border-white/20">IMG_A</div>
                    </div>
                    <CyberButton className="w-full mt-4" onClick={() => handleGuess(true)} disabled={!!result}>
                        SELECT A
                    </CyberButton>
                </div>

                {/* Image B */}
                <div className="group relative">
                    <div className="aspect-square bg-cyber-dark border-2 border-cyber-dim overflow-hidden relative cursor-pointer" onClick={() => handleGuess(false)}>
                        <img src={!aiIsLeft ? aiImg : realImg} alt="Sample B" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                         {result && (
                            <div className={`absolute inset-0 flex items-center justify-center bg-black/60 font-cyber text-2xl font-bold ${!aiIsLeft ? 'text-cyber-primary' : 'text-cyber-secondary'}`}>
                                {!aiIsLeft ? 'AI GENERATED' : 'HUMAN MADE'}
                            </div>
                        )}
                        <div className="absolute top-2 left-2 bg-black/80 px-2 py-1 text-xs font-mono text-white border border-white/20">IMG_B</div>
                    </div>
                    <CyberButton className="w-full mt-4" onClick={() => handleGuess(false)} disabled={!!result}>
                        SELECT B
                    </CyberButton>
                </div>
            </div>
        )}

        {/* Result Overlay */}
        {result && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-cyber-panel/95 backdrop-blur-md border border-cyber-primary p-6 text-center shadow-[0_0_50px_rgba(0,240,255,0.2)] z-50">
                <h3 className={`text-3xl font-cyber mb-2 ${result === 'correct' ? 'text-green-400' : 'text-red-500'}`}>
                    {result === 'correct' ? 'THREAT DETECTED' : 'DECEPTION SUCCESSFUL'}
                </h3>
                <p className="font-mono text-sm text-gray-300 mb-6">
                    {result === 'correct' 
                        ? "You successfully identified the synthetic media. Humanity +1." 
                        : "You were fooled by the algorithm. The machine learns from your failure."}
                </p>
                <div className="flex gap-4 justify-center">
                    <CyberButton onClick={nextRound}>NEXT SUBJECT</CyberButton>
                    <CyberButton variant="secondary" onClick={() => setMode(GameMode.MENU)}>ABORT</CyberButton>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};