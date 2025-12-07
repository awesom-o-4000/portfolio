import React, { useState, useEffect } from 'react';
import { PlayerState, PartType, RobotPart, Rarity, Robot } from '../types';
import { calculatePower } from '../services/gameLogic';
import { generateRobotImage } from '../services/geminiService';
import { Zap, Bot, Wand2, HelpCircle, ScanFace, Shield, Hammer, Footprints, Swords, CheckCircle2, Plus, Trash2, ArrowRight, Pencil, Check } from 'lucide-react';

interface WorkshopProps {
  playerState: PlayerState;
  updateState: (newState: Partial<PlayerState>) => void;
}

// Internal Tooltip Component for Workshop
const InfoTooltip = ({ text }: { text: string }) => (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-950 text-cyan-400 text-[10px] rounded border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
        {text}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-950 border-b border-r border-slate-700 rotate-45"></div>
    </div>
);

const Workshop: React.FC<WorkshopProps> = ({ playerState, updateState }) => {
  const [selectedSlot, setSelectedSlot] = useState<PartType>(PartType.HEAD);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState("");

  // Active Robot Logic
  const activeRobot = playerState.robots.find(r => r.id === playerState.activeRobotId) || playerState.robots[0];
  const isComplete = Object.keys(activeRobot.parts).length === 5;
  const currentPower = calculatePower(activeRobot);
  
  // Progress Calculation (Current Robot)
  const installedPartsCount = Object.keys(activeRobot.parts).length;

  const newPartFlags = React.useMemo(() => {
    const flags: { [key in PartType]?: boolean } = {};
    const partTypes = Object.values(PartType);

    for (const type of partTypes) {
        flags[type] = playerState.inventory.some(
            p => p.type === type && p.equippedTo === undefined
        );
    }
    return flags;
  }, [playerState.inventory]);
  
  useEffect(() => {
    if (!isRenaming) {
        setNewName(activeRobot.name);
    }
  }, [activeRobot.name, isRenaming]);

  const updateRobot = (robotId: string, updates: Partial<Robot>) => {
      const updatedRobots = playerState.robots.map(r => 
        r.id === robotId ? { ...r, ...updates } : r
      );
      updateState({ robots: updatedRobots });
  };

  const handleRename = () => {
      if (newName.trim() === "") return;
      updateRobot(activeRobot.id, { name: newName.trim() });
      setIsRenaming(false);
  };

  const createNewRobot = () => {
      const newRobot: Robot = {
          id: `robot_${Date.now()}`,
          name: `Unit-0${playerState.robots.length + 1}`,
          parts: {},
          isActive: false
      };
      updateState({ 
          robots: [...playerState.robots, newRobot],
          activeRobotId: newRobot.id 
      });
  };

  const dismantleRobot = () => {
      if (playerState.robots.length <= 1) return; // Prevent deleting last robot
      
      // Unequip all parts from this robot in inventory
      const updatedInventory = playerState.inventory.map(p => 
        p.equippedTo === activeRobot.id ? { ...p, equippedTo: undefined } : p
      );

      const remainingRobots = playerState.robots.filter(r => r.id !== activeRobot.id);
      
      updateState({
          robots: remainingRobots,
          inventory: updatedInventory,
          activeRobotId: remainingRobots[0].id
      });
  };

  const equipPart = (part: RobotPart) => {
    // Check if part is taken by another robot
    if (part.equippedTo && part.equippedTo !== activeRobot.id) {
        alert(`This part is equipped on another robot. Dismantle that robot or unequip the part first.`);
        return;
    }

    const currentPartInSlot = activeRobot.parts[part.type];
    
    // Update Inventory
    const updatedInventory = playerState.inventory.map(p => {
        if (p.id === part.id) return { ...p, equippedTo: activeRobot.id };
        if (currentPartInSlot && p.id === currentPartInSlot.id) return { ...p, equippedTo: undefined };
        return p;
    });

    // Update Robot State
    const updatedParts = {
        ...activeRobot.parts,
        [part.type]: part
    };

    const updatedRobots = playerState.robots.map(r => 
        r.id === activeRobot.id ? { ...r, parts: updatedParts, imageUrl: undefined } : r
    );

    updateState({
      inventory: updatedInventory,
      robots: updatedRobots
    });
  };

  const handleCreateRobot = async () => {
    if (!isComplete) return;
    setIsGenerating(true);
    
    const imageUrl = await generateRobotImage(activeRobot);
    
    if (imageUrl) {
        updateRobot(activeRobot.id, { imageUrl });
        updateState({ tutorialStep: 5 });
    }
    
    setIsGenerating(false);
  };

  const selectRobot = (id: string) => {
      updateState({ activeRobotId: id });
  };

  const getSlotIcon = (type: PartType) => {
      switch (type) {
          case PartType.HEAD: return <ScanFace size={20} />;
          case PartType.BODY: return <Shield size={20} />;
          case PartType.ARMS: return <Hammer size={20} />;
          case PartType.LEGS: return <Footprints size={20} />;
          case PartType.WEAPON: return <Swords size={20} />;
          default: return <Bot size={20} />;
      }
  };

  const availableParts = playerState.inventory.filter(p => p.type === selectedSlot);
  availableParts.sort((a, b) => b.statBonus - a.statBonus);

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white relative">
      
      {/* Robot Selector Bar */}
      <div className="flex items-center space-x-2 p-2 bg-slate-950 overflow-x-auto no-scrollbar border-b border-slate-800 flex-shrink-0">
          {playerState.robots.map(r => (
              <button
                key={r.id}
                onClick={() => selectRobot(r.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${r.id === activeRobot.id ? 'bg-slate-800 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-slate-700 text-slate-500'}`}
              >
                  <Bot size={14} />
                  <span className="text-xs font-bold">{r.name}</span>
              </button>
          ))}
          <div className="group relative">
            <button 
                onClick={createNewRobot}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-colors flex-shrink-0"
            >
                <Plus size={16} />
            </button>
            <InfoTooltip text="Create New Frame" />
          </div>
      </div>

      {/* Main Workshop Area */}
      <div className="p-4 bg-slate-800 shadow-md z-10 flex flex-col items-center relative">
        
        <div className="w-full flex justify-between items-start mb-2">
            <div>
                 {isRenaming ? (
                     <div className="flex items-center space-x-2">
                         <input 
                             type="text" 
                             value={newName} 
                             onChange={(e) => setNewName(e.target.value)} 
                             className="bg-slate-900 border border-cyan-500 rounded px-2 py-1 text-xl font-display font-bold text-white tracking-widest w-40"
                             autoFocus
                             onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                         />
                         <button onClick={handleRename} className="bg-cyan-600 p-2 rounded text-white"><Check size={16}/></button>
                     </div>
                 ) : (
                    <div className="flex items-center space-x-2 group">
                        <h2 className="text-xl font-display font-bold text-white tracking-widest">{activeRobot.name}</h2>
                        <button onClick={() => setIsRenaming(true)} className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Pencil size={12}/>
                        </button>
                    </div>
                 )}
                 <div className="flex items-center text-xs text-slate-400 space-x-3 mt-1">
                     <span className="group relative cursor-help">
                         Status: {isComplete ? 'Ready' : 'Incomplete'}
                         <InfoTooltip text={isComplete ? "Combat Ready" : "Missing Parts"} />
                     </span>
                     {playerState.robots.length > 1 && (
                         <button onClick={dismantleRobot} className="group relative text-red-400 flex items-center hover:text-red-300">
                             <Trash2 size={10} className="mr-1" /> Dismantle
                             <InfoTooltip text="Delete this robot" />
                         </button>
                     )}
                 </div>
            </div>
            <div className="flex flex-col items-end group relative cursor-help">
                <div className="flex items-center space-x-1 bg-slate-900 px-2 py-1 rounded border border-slate-700">
                    <Zap size={14} className="text-yellow-400 fill-current" />
                    <span className="font-mono text-lg font-bold">{currentPower}</span>
                </div>
                <InfoTooltip text="Total Combat Power" />
            </div>
        </div>

        {/* Collection Progress Redesign */}
        <div className="group relative w-full mb-4 flex items-center justify-between bg-slate-900/50 p-2 rounded-lg border border-slate-700/50 cursor-help">
             <div className="flex space-x-1">
                 {[PartType.HEAD, PartType.BODY, PartType.ARMS, PartType.LEGS, PartType.WEAPON].map((type, idx) => {
                     const isEquipped = !!activeRobot.parts[type];
                     return (
                         <div key={type} className={`w-8 h-1 rounded-full ${isEquipped ? 'bg-green-500' : 'bg-slate-700'}`}></div>
                     )
                 })}
             </div>
             <span className="text-[10px] font-mono uppercase text-slate-400">{installedPartsCount}/5 Modules Active</span>
             <InfoTooltip text="Equip all 5 parts to activate generation" />
        </div>

        {/* Visualizer Area */}
        <div className="relative w-full aspect-square max-w-[260px] bg-slate-900 rounded-xl border border-slate-600 mb-4 overflow-hidden flex items-center justify-center group shadow-inner">
            
            {isGenerating ? (
                <div className="flex flex-col items-center z-10">
                    <Wand2 className="animate-spin text-slate-400 mb-2" size={32} />
                    <span className="text-xs text-slate-400 font-bold animate-pulse">Fabricating...</span>
                </div>
            ) : activeRobot.imageUrl ? (
                <img src={activeRobot.imageUrl} alt="My Robot" className="w-full h-full object-contain relative z-10 hover:scale-105 transition-transform duration-500" />
            ) : (
                 // Anatomical Placeholder
                <div className="relative w-full h-full p-6 flex flex-col z-10 opacity-50">
                    {/* Head Row */}
                    <div className="flex justify-center mb-2">
                        <button onClick={() => setSelectedSlot(PartType.HEAD)} className={`w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center transition-colors ${selectedSlot === PartType.HEAD ? 'border-cyan-400 bg-cyan-900/20' : 'border-slate-700 hover:border-slate-500'}`}>
                            {activeRobot.parts[PartType.HEAD] ? <ScanFace size={32} className="text-cyan-400"/> : <div className="text-xs text-slate-600">HEAD</div>}
                        </button>
                    </div>
                    
                    {/* Body/Arms/Weapon Row */}
                    <div className="flex justify-center space-x-2 mb-2">
                        <button onClick={() => setSelectedSlot(PartType.ARMS)} className={`w-12 h-20 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors ${selectedSlot === PartType.ARMS ? 'border-cyan-400 bg-cyan-900/20' : 'border-slate-700 hover:border-slate-500'}`}>
                             {activeRobot.parts[PartType.ARMS] ? <Hammer size={24} className="text-cyan-400"/> : <div className="text-[10px] text-slate-600 rotate-90">ARMS</div>}
                        </button>
                        <button onClick={() => setSelectedSlot(PartType.BODY)} className={`w-20 h-24 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors ${selectedSlot === PartType.BODY ? 'border-cyan-400 bg-cyan-900/20' : 'border-slate-700 hover:border-slate-500'}`}>
                             {activeRobot.parts[PartType.BODY] ? <Shield size={32} className="text-cyan-400"/> : <div className="text-xs text-slate-600">BODY</div>}
                        </button>
                         <button onClick={() => setSelectedSlot(PartType.WEAPON)} className={`w-12 h-20 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors ${selectedSlot === PartType.WEAPON ? 'border-cyan-400 bg-cyan-900/20' : 'border-slate-700 hover:border-slate-500'}`}>
                             {activeRobot.parts[PartType.WEAPON] ? <Swords size={24} className="text-cyan-400"/> : <div className="text-[10px] text-slate-600 rotate-90">WEP</div>}
                        </button>
                    </div>

                    {/* Legs Row */}
                    <div className="flex justify-center">
                         <button onClick={() => setSelectedSlot(PartType.LEGS)} className={`w-24 h-16 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors ${selectedSlot === PartType.LEGS ? 'border-cyan-400 bg-cyan-900/20' : 'border-slate-700 hover:border-slate-500'}`}>
                             {activeRobot.parts[PartType.LEGS] ? <Footprints size={32} className="text-cyan-400"/> : <div className="text-xs text-slate-600">LEGS</div>}
                        </button>
                    </div>
                </div>
            )}

            {/* Helper Text Overlay when empty */}
            {!activeRobot.imageUrl && !isComplete && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <p className="text-xs text-slate-500/50 font-display uppercase tracking-widest rotate-45">Schematic View</p>
                </div>
            )}
        </div>

        {/* Generate Button */}
        {!activeRobot.imageUrl && (
             <div className="w-full group relative">
                <button 
                    onClick={handleCreateRobot}
                    disabled={!isComplete || isGenerating}
                    className={`w-full py-3 rounded-lg font-bold font-display tracking-widest flex items-center justify-center text-sm ${
                        !isComplete 
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg hover:brightness-110'
                    }`}
                >
                    <Wand2 className="mr-2" size={16} />
                    {isComplete ? 'BUILD ROBOT' : 'BUILD ROBOT'}
                </button>
                <InfoTooltip text={isComplete ? "Generate 3D Image with AI" : "Fill all slots first"} />
            </div>
        )}
      </div>

      {/* Inventory List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-32 bg-slate-900 relative">
        <div className="flex justify-between items-center mb-2">
            <h3 className="text-slate-400 text-xs font-display tracking-wider flex items-center uppercase">
                Available {selectedSlot} Modules
            </h3>
            <button onClick={() => setShowHelp(!showHelp)} className="text-slate-500 hover:text-white transition-colors group relative">
                <HelpCircle size={14} />
                <InfoTooltip text="Workshop Guide" />
            </button>
        </div>
        
        {availableParts.length === 0 ? (
            <div className="text-center text-slate-600 py-8 italic border-2 border-dashed border-slate-800 rounded-xl">
                No spare {selectedSlot.toLowerCase()} parts.<br/>Spin slots to find more!
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-3">
                {availableParts.map((part) => {
                    const isEquippedElsewhere = part.equippedTo && part.equippedTo !== activeRobot.id;
                    const isEquippedHere = activeRobot.parts[part.type]?.id === part.id;
                    
                    const baseClasses = `group relative flex p-4 rounded-xl transition-all min-h-[80px] items-center bg-slate-950`;
                    const borderClasses = isEquippedHere ? 'border-2 border-cyan-400' : 'border border-slate-800';
                    const disabledClasses = isEquippedElsewhere ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95';

                    return (
                        <div 
                            key={part.id}
                            onClick={() => !isEquippedElsewhere && equipPart(part)}
                            className={`${baseClasses} ${borderClasses} ${disabledClasses}`}
                        >
                            <div className="flex-1 pr-4">
                                <h4 className="font-bold text-white text-base flex items-center">
                                    {part.name}
                                    {part.level > 1 && <span className="ml-2 text-xs bg-yellow-500 text-black px-1.5 py-0.5 rounded font-mono">Lvl {part.level}</span>}
                                </h4>
                                <p className="text-xs text-slate-400 mt-1 line-clamp-2 italic font-light">{part.description}</p>
                            </div>
                    
                            <div className="flex flex-col items-end text-right">
                                <span className="text-2xl font-display font-bold text-white">+{part.statBonus}</span>
                                <span className="text-[10px] text-slate-500 font-mono tracking-wider">PWR</span>
                            </div>
                            
                            {isEquippedElsewhere && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl">
                                    <span className="text-xs bg-slate-900 px-2 py-1 rounded border border-slate-600 text-red-300">Equipped on other Unit</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        )}
      </div>

      {/* Help Panel (Slide up) */}
      {showHelp && (
          <div className="absolute bottom-16 left-0 right-0 bg-slate-800 border-t-2 border-cyan-500 p-4 z-30 animate-in slide-in-from-bottom-10 shadow-2xl">
              <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-cyan-400 text-sm">Workshop Guide</h4>
                  <button onClick={() => setShowHelp(false)} className="text-slate-400"><Plus className="rotate-45" size={20}/></button>
              </div>
              <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4">
                  <li>Use the top bar to switch between robots or create new ones.</li>
                  <li>Click slot icons (Head, Body, etc.) to filter inventory.</li>
                  <li>Equipping items updates your robot's stats and look.</li>
                  <li>Duplicate items in slots level up automatically!</li>
                  <li>Generate Visuals once all 5 slots are filled.</li>
              </ul>
          </div>
      )}
    </div>
  );
};

export default Workshop;