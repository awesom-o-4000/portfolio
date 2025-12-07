import React, { useState, useRef, useEffect } from 'react';
import { generateGlitchImage } from '../services/geminiService';
import { CyberButton } from './ui/CyberButton';
import { GameMode } from '../types';

interface GlitchModeProps {
  setMode: (mode: GameMode) => void;
}

interface Marker {
  x: number;
  y: number;
  type: 'hit' | 'miss';
}

interface Cluster {
  id: number;
  x: number;
  y: number;
  radius: number;
  found: boolean;
}

export const GlitchMode: React.FC<GlitchModeProps> = ({ setMode }) => {
  const [phase, setPhase] = useState<'upload' | 'processing' | 'game' | 'result'>('upload');
  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [glitchImage, setGlitchImage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  
  // Game State
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [targets, setTargets] = useState<Cluster[]>([]);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [gameResult, setGameResult] = useState<'win' | 'loss' | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBaseImage(reader.result as string);
        setMarkers([]);
        setAttemptsLeft(3);
        setGameResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const startGlitching = async () => {
    if (!baseImage) return;
    setPhase('processing');
    
    const result = await generateGlitchImage(baseImage);
    if (result) {
      setGlitchImage(result);
      setPhase('game');
    } else {
      setPhase('upload');
      alert("Glitch generation failed. Please try a different image.");
    }
  };

  // ADVANCED DIFFERENCE DETECTION: GRID CLUSTERING
  const computeDifference = () => {
    if (!baseImage || !glitchImage || !canvasRef.current) return;

    const img1 = new Image();
    const img2 = new Image();
    
    img1.src = baseImage;
    img2.src = glitchImage;

    const handleLoad = () => {
        if (!img1.complete || !img2.complete) return;
        
        const cvs = canvasRef.current!;
        const ctx = cvs.getContext('2d');
        if(!ctx) return;

        // Use fixed resolution for analysis
        const DIM = 500;
        cvs.width = DIM;
        cvs.height = DIM;

        // Draw original
        ctx.drawImage(img1, 0, 0, DIM, DIM);
        const data1 = ctx.getImageData(0, 0, DIM, DIM).data;
        
        // Draw glitch
        ctx.drawImage(img2, 0, 0, DIM, DIM);
        const data2 = ctx.getImageData(0, 0, DIM, DIM).data;

        // 1. Grid Analysis
        // Increased grid size to 25 (20px cells) for better separation of 5 changes
        const GRID_SIZE = 25; 
        const CELL_SIZE = DIM / GRID_SIZE;
        const grid = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0));

        // Scan pixels and populate grid density
        for(let i=0; i<data1.length; i+=4) {
            const rDiff = Math.abs(data1[i] - data2[i]);
            const gDiff = Math.abs(data1[i+1] - data2[i+1]);
            const bDiff = Math.abs(data1[i+2] - data2[i+2]);
            
            // Lower threshold (50) to catch subtler changes
            if (rDiff + gDiff + bDiff > 50) { 
                const pIdx = i / 4;
                const x = pIdx % DIM;
                const y = Math.floor(pIdx / DIM);
                
                const gx = Math.floor(x / CELL_SIZE);
                const gy = Math.floor(y / CELL_SIZE);
                
                if (gx < GRID_SIZE && gy < GRID_SIZE) {
                    grid[gy][gx]++;
                }
            }
        }

        // 2. Cluster Creation (Simple Neighbor Grouping)
        const clusters: Cluster[] = [];
        const visited = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(false));
        // Lower pixel threshold per cell since cells are smaller (20x20 = 400px)
        const PIXEL_THRESHOLD = 10; 

        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                if (!visited[y][x] && grid[y][x] > PIXEL_THRESHOLD) {
                    // Start new cluster
                    let cx = 0, cy = 0, count = 0;
                    const queue = [{x, y}];
                    visited[y][x] = true;

                    while (queue.length > 0) {
                        const cell = queue.shift()!;
                        cx += (cell.x * CELL_SIZE) + (CELL_SIZE/2);
                        cy += (cell.y * CELL_SIZE) + (CELL_SIZE/2);
                        count++;

                        // Check neighbors
                        const neighbors = [
                            {x: cell.x+1, y: cell.y}, {x: cell.x-1, y: cell.y},
                            {x: cell.x, y: cell.y+1}, {x: cell.x, y: cell.y-1}
                        ];

                        neighbors.forEach(n => {
                            if (n.x >=0 && n.x < GRID_SIZE && n.y >= 0 && n.y < GRID_SIZE) {
                                if (!visited[n.y][n.x] && grid[n.y][n.x] > PIXEL_THRESHOLD) {
                                    visited[n.y][n.x] = true;
                                    queue.push(n);
                                }
                            }
                        });
                    }

                    clusters.push({
                        id: clusters.length,
                        x: cx / count,
                        y: cy / count,
                        // Tighter radius for more precision
                        radius: Math.max(30, Math.sqrt(count) * CELL_SIZE * 0.8), 
                        found: false
                    });
                }
            }
        }

        // 3. Fallback
        if (clusters.length === 0) {
             console.warn("No distinct clusters found. Fallback.");
             // Default center target if something fails
             setTargets([{ id: 0, x: 250, y: 250, radius: 100, found: false }]);
        } else {
             setTargets(clusters);
        }
    };

    img1.onload = handleLoad;
    img2.onload = handleLoad;
  };

  useEffect(() => {
    if (phase === 'game' && glitchImage) {
        computeDifference();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, glitchImage]);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (phase !== 'game' || attemptsLeft <= 0) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 500;
    const y = ((e.clientY - rect.top) / rect.height) * 500;
    
    let hitIndex = -1;

    // Check against all unfound targets
    targets.forEach((t, idx) => {
        if (!t.found) {
             const dist = Math.sqrt(Math.pow(x - t.x, 2) + Math.pow(y - t.y, 2));
             if (dist < t.radius) {
                 hitIndex = idx;
             }
        }
    });

    if (hitIndex !== -1) {
        // HIT
        const newTargets = [...targets];
        newTargets[hitIndex].found = true;
        setTargets(newTargets);
        
        setMarkers(prev => [...prev, { x, y, type: 'hit' }]);
        setFeedback("ANOMALY ISOLATED.");
        
        // Check Win Condition
        const allFound = newTargets.every(t => t.found);
        if (allFound) {
            setGameResult('win');
            setPhase('result');
            setFeedback("ALL ANOMALIES NEUTRALIZED.");
        }
    } else {
        // MISS
        const newAttempts = attemptsLeft - 1;
        setAttemptsLeft(newAttempts);
        setMarkers(prev => [...prev, { x, y, type: 'miss' }]);
        
        if (newAttempts <= 0) {
            setFeedback("SCAN FAILED. BREACH DETECTED.");
            setGameResult('loss');
            setPhase('result');
        }
    }
  };

  const resetGame = () => {
    setBaseImage(null);
    setGlitchImage(null);
    setPhase('upload');
    setFeedback("");
    setMarkers([]);
    setTargets([]);
    setAttemptsLeft(3);
    setGameResult(null);
  };

  const retrySameImage = () => {
    setPhase('game');
    setFeedback("");
    setMarkers([]);
    setAttemptsLeft(3);
    setGameResult(null);
    setTargets(prev => prev.map(t => ({...t, found: false})));
  };

  const foundCount = targets.filter(t => t.found).length;

  return (
    <div className="w-full max-w-6xl mx-auto p-4 flex flex-col h-full animate-in fade-in duration-500">
       <canvas ref={canvasRef} className="hidden" />
       
       {/* Navigation Header */}
       <div className="w-full border-b border-cyber-dim pb-4 mb-6 flex justify-between items-center">
         <div className="flex items-center gap-4">
             <button 
                onClick={() => setMode(GameMode.MENU)} 
                className="text-cyber-primary hover:text-white transition-colors font-mono text-sm flex items-center gap-1"
             >
                {'<'} BACK
             </button>
             <h2 className="text-2xl font-cyber text-white hidden md:block">GLITCH MODE <span className="text-cyber-secondary text-xs align-top">v2.1</span></h2>
         </div>
         
         {/* Status / Counters */}
         <div className="flex gap-8 items-center">
            {(phase === 'game' || phase === 'result') && (
                <div className="flex gap-6">
                    <div className="flex flex-col items-end">
                        <span className="font-mono text-xs text-gray-400">ANOMALIES FOUND</span>
                        <span className={`font-cyber text-xl ${foundCount === targets.length ? 'text-green-400' : 'text-white'}`}>
                            {foundCount} / {targets.length}
                        </span>
                    </div>

                    <div className="flex flex-col items-end">
                        <span className="font-mono text-xs text-gray-400">LIVES</span>
                        <div className="flex gap-1 mt-1">
                            {[...Array(3)].map((_, i) => (
                                <div 
                                    key={i} 
                                    className={`w-3 h-3 rotate-45 border ${
                                        i < attemptsLeft 
                                            ? 'bg-cyber-secondary border-cyber-secondary shadow-[0_0_5px_#ff003c]' 
                                            : 'bg-transparent border-gray-700'
                                    } transition-all duration-300`}
                                ></div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
         </div>
       </div>

       {phase === 'upload' && (
         <div className="flex flex-col items-center justify-center flex-1 w-full max-w-lg mx-auto border-2 border-dashed border-cyber-dim rounded-lg p-12 bg-cyber-panel/50 hover:border-cyber-primary/50 transition-colors">
            <p className="font-cyber text-xl mb-4 text-center">UPLOAD SOURCE MATERIAL</p>
            <p className="font-mono text-sm text-gray-400 mb-8 text-center leading-relaxed">
                Upload a photo. The AI will inject 5 distinct glitches.
                Find them before you run out of lives.
            </p>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept="image/*"
            />
            {baseImage ? (
                <div className="space-y-4 w-full">
                    <img src={baseImage} alt="Preview" className="w-full max-h-64 object-contain rounded border border-cyber-primary bg-black/50" />
                    <CyberButton onClick={startGlitching} className="w-full">INITIATE GLITCH</CyberButton>
                    <CyberButton variant="secondary" onClick={() => setBaseImage(null)} className="w-full">CLEAR</CyberButton>
                </div>
            ) : (
                <CyberButton onClick={() => fileInputRef.current?.click()}>
                    SELECT FILE
                </CyberButton>
            )}
         </div>
       )}

       {phase === 'processing' && (
         <div className="flex flex-col items-center justify-center flex-1">
            <div className="relative">
                <div className="absolute inset-0 bg-cyber-primary blur-xl opacity-20 animate-pulse"></div>
                <div className="text-4xl md:text-6xl font-cyber text-white animate-bounce tracking-widest">PROCESSING</div>
            </div>
            <div className="mt-8 flex gap-2">
                <div className="w-3 h-3 bg-cyber-primary rounded-full animate-pulse"></div>
                <div className="w-3 h-3 bg-cyber-primary rounded-full animate-pulse delay-75"></div>
                <div className="w-3 h-3 bg-cyber-primary rounded-full animate-pulse delay-150"></div>
            </div>
            <p className="mt-4 font-mono text-cyber-primary text-sm">INJECTING 5 ANOMALIES...</p>
         </div>
       )}

       {(phase === 'game' || phase === 'result') && baseImage && glitchImage && (
         <div className="flex flex-col flex-1 w-full">
            <p className="font-mono text-center text-gray-400 mb-6 max-w-2xl mx-auto hidden md:block">
                {phase === 'result' 
                    ? "ANALYSIS COMPLETE. REVIEW DATA BELOW." 
                    : `COMPARE THE IMAGES. FIND ${targets.length - foundCount} MORE ANOMALY(S) ON THE RIGHT.`}
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start justify-center">
                {/* Original Image Container */}
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs font-mono text-cyber-primary bg-cyber-dark p-2 border border-cyber-dim border-b-0">
                        <span>REFERENCE_DATA</span>
                        <span className="text-gray-500">READ_ONLY</span>
                    </div>
                    <div className="relative w-full aspect-square bg-black border border-cyber-dim overflow-hidden group">
                        <img 
                            src={baseImage} 
                            alt="Original" 
                            className="w-full h-full object-contain pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity" 
                        />
                        <div className="absolute inset-0 pointer-events-none bg-grid-white/[0.05] bg-[length:20px_20px]"></div>
                    </div>
                </div>

                {/* Glitched Image Container */}
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs font-mono text-cyber-secondary bg-cyber-dark p-2 border border-cyber-dim border-b-0">
                        <span>CORRUPTED_DATA</span>
                        <span className="text-white animate-pulse">INTERACTIVE // TAP ANOMALY</span>
                    </div>
                    <div 
                        className={`relative w-full aspect-square bg-black border-2 ${phase === 'game' ? 'border-cyber-secondary cursor-crosshair hover:shadow-[0_0_15px_rgba(255,0,60,0.3)]' : 'border-cyber-dim'} overflow-hidden transition-all`} 
                        onClick={handleImageClick}
                    >
                        <img 
                            src={glitchImage} 
                            alt="Glitch" 
                            className="w-full h-full object-contain" 
                        />
                        
                        {/* Interactive Scanner Line */}
                        {phase === 'game' && (
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyber-secondary/10 to-transparent h-[5%] w-full animate-[scan_2s_linear_infinite] pointer-events-none"></div>
                        )}

                        {/* Click Markers */}
                        {markers.map((marker, idx) => (
                            <div 
                                key={idx}
                                className={`absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10`}
                                style={{ left: (marker.x / 500 * 100) + "%", top: (marker.y / 500 * 100) + "%" }}
                            >
                                {marker.type === 'hit' ? (
                                    <div className="w-full h-full border-2 border-green-500 rounded-full shadow-[0_0_10px_#22c55e] animate-pulse"></div>
                                ) : (
                                    <div className="text-red-500 font-bold text-2xl drop-shadow-[0_0_2px_rgba(0,0,0,0.8)]">✕</div>
                                )}
                            </div>
                        ))}

                        {/* Targets Reveal on Win/Loss */}
                        {phase === 'result' && targets.map((t, i) => (
                            <div 
                                key={i}
                                className={`absolute border-2 border-dashed -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none ${t.found ? 'border-green-500' : 'border-cyber-primary animate-pulse'}`}
                                style={{ 
                                    left: (t.x / 500 * 100) + "%", 
                                    top: (t.y / 500 * 100) + "%",
                                    width: (t.radius * 2 / 500 * 100) + "%",
                                    height: (t.radius * 2 / 500 * 100) + "%",
                                    borderRadius: '50%'
                                }}
                            >
                                {!t.found && <span className="text-[10px] bg-cyber-primary text-black font-bold px-1 absolute -top-4">MISSED</span>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {phase === 'result' && (
                <div className="mt-8 text-center w-full max-w-lg mx-auto bg-cyber-panel border border-cyber-dim p-6 animate-in slide-in-from-bottom-4 shadow-2xl z-20">
                    <h3 className={`text-2xl font-cyber mb-2 ${gameResult === 'win' ? 'text-green-400' : 'text-red-500'}`}>
                        {gameResult === 'win' ? 'ALL ANOMALIES ISOLATED' : 'SYSTEM OVERRUN'}
                    </h3>
                    <p className="font-mono text-sm text-gray-400 mb-6">
                         {gameResult === 'win' ? "Visual cortex functioning within optimal parameters." : "Changes remain undetected. Try scanning the image quadrant by quadrant."}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <CyberButton onClick={resetGame}>NEW IMAGE</CyberButton>
                        <CyberButton variant="secondary" onClick={retrySameImage}>RETRY SAME IMAGE</CyberButton>
                    </div>
                </div>
            )}
         </div>
       )}
    </div>
  );
};