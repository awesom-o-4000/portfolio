import React, { useState, useEffect } from 'react';
import { PlayerState, RobotPart } from '../types';
import { calculatePower } from '../services/gameLogic';
import { Shield, Zap, Skull, Trophy, History, Bot, Pencil, Check } from 'lucide-react';

interface ProfileProps {
  playerState: PlayerState;
  updateState: (newState: Partial<PlayerState>) => void;
}

const Profile: React.FC<ProfileProps> = ({ playerState, updateState }) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(playerState.playerName);

  const activeRobot = playerState.robots.find(r => r.id === playerState.activeRobotId) || playerState.robots[0];
  const power = calculatePower(activeRobot);
  const totalBattles = playerState.wins + playerState.losses;
  const winRate = totalBattles > 0 ? Math.round((playerState.wins / totalBattles) * 100) : 0;

  useEffect(() => {
    setNewName(playerState.playerName);
  }, [playerState.playerName]);

  const handleRename = () => {
      if (newName.trim() === "") return;
      updateState({ playerName: newName.trim() });
      setIsRenaming(false);
  };

  return (
    <div className="h-full bg-slate-900 overflow-y-auto p-4 pt-8 pb-24">
      
      {/* Profile Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-cyan-400 to-blue-600 shadow-xl mb-4">
            <div className="w-full h-full rounded-full bg-slate-800 overflow-hidden">
                {activeRobot.imageUrl ? (
                    <img src={activeRobot.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-700">
                        <span className="text-4xl">👤</span>
                    </div>
                )}
            </div>
        </div>
        
        {isRenaming ? (
            <div className="flex items-center space-x-2">
                <input 
                    type="text" 
                    value={newName} 
                    onChange={(e) => setNewName(e.target.value)} 
                    className="bg-slate-900 border border-cyan-500 rounded px-2 py-1 text-2xl font-display font-bold text-white tracking-wide w-48 text-center"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                />
                <button onClick={handleRename} className="bg-cyan-600 p-2 rounded text-white"><Check size={16}/></button>
            </div>
        ) : (
            <div className="flex items-center space-x-2 group">
                <h2 className="text-2xl font-display font-bold text-white tracking-wide">{playerState.playerName}</h2>
                <button onClick={() => setIsRenaming(true)} className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Pencil size={14}/>
                </button>
            </div>
        )}

        <div className="flex items-center space-x-2 mt-1">
             <span className="bg-slate-800 text-cyan-400 px-3 py-1 rounded text-xs font-mono border border-slate-700">
                 Rank: {playerState.wins > 10 ? 'VETERAN' : 'ROOKIE'}
             </span>
        </div>
      </div>

      {/* Stats Grid Redesign */}
      <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex items-center px-4">
              <Trophy size={28} className="text-yellow-400 flex-shrink-0" />
              <div className="flex-1 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold font-mono text-white">{playerState.wins}</span>
                  <span className="text-xs text-slate-400">Wins</span>
              </div>
          </div>
          <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex items-center px-4">
              <Skull size={28} className="text-red-400 flex-shrink-0" />
              <div className="flex-1 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold font-mono text-white">{playerState.losses}</span>
                  <span className="text-xs text-slate-400">Losses</span>
              </div>
          </div>
          <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex items-center px-4">
              <Zap size={28} className="text-cyan-400 flex-shrink-0" />
              <div className="flex-1 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold font-mono text-white">{winRate}%</span>
                  <span className="text-xs text-slate-400">Win Rate</span>
              </div>
          </div>
      </div>

      {/* Robot Garage */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 mb-6">
          <h3 className="text-slate-400 text-xs font-display mb-3 uppercase flex items-center">
              <Bot size={14} className="mr-2" /> Robot Garage ({playerState.robots.length})
          </h3>
          <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-2">
            {playerState.robots.map((robot) => (
                <div key={robot.id} className={`flex-shrink-0 w-24 bg-slate-800 rounded-lg p-2 border ${robot.id === activeRobot.id ? 'border-cyan-500' : 'border-slate-600'}`}>
                    <div className="aspect-square bg-slate-900 rounded mb-2 overflow-hidden flex items-center justify-center">
                        {robot.imageUrl ? <img src={robot.imageUrl} className="w-full h-full object-cover"/> : <Bot size={20} className="text-slate-600"/>}
                    </div>
                    <div className="text-[10px] text-center font-bold text-slate-300 truncate">{robot.name}</div>
                    <div className="text-[9px] text-center text-yellow-500 font-mono">PWR {calculatePower(robot)}</div>
                </div>
            ))}
          </div>
      </div>

      {/* Active Unit Specs */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 mb-6">
          <h3 className="text-slate-400 text-xs font-display mb-3 uppercase flex items-center">
              <Shield size={14} className="mr-2" /> Active Unit Config
          </h3>
          <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-lg">{activeRobot.name}</span>
              <span className="text-yellow-400 font-mono font-bold">PWR: {power}</span>
          </div>
          <div className="space-y-1">
              {Object.entries(activeRobot.parts).map(([key, part]) => (
                  <div key={key} className="flex justify-between text-xs border-b border-slate-700/50 pb-1 last:border-0">
                      <span className="text-slate-500 capitalize">{key.toLowerCase()}</span>
                      <span className="text-slate-300">{(part as RobotPart)?.name || '---'}</span>
                  </div>
              ))}
          </div>
      </div>

      {/* Battle History */}
      <div>
          <h3 className="text-slate-400 text-xs font-display mb-3 uppercase flex items-center">
              <History size={14} className="mr-2" /> Recent Engagements
          </h3>
          {playerState.battleHistory.length === 0 ? (
              <div className="text-center py-8 text-slate-600 text-sm italic">
                  No battle data recorded.
              </div>
          ) : (
              <div className="space-y-3">
                  {playerState.battleHistory.map((record) => (
                      <div key={record.id} className="bg-slate-800 rounded-lg border border-slate-700 flex overflow-hidden">
                          {record.battleImageUrl ? (
                              <img src={record.battleImageUrl} className="w-24 h-24 object-cover" alt="Battle Scene"/>
                          ) : (
                              <div className="w-24 h-24 bg-slate-900 flex-shrink-0 flex items-center justify-center">
                                  <History size={24} className="text-slate-700" />
                              </div>
                          )}
                          <div className={`flex-1 p-3 flex flex-col justify-between border-l-4 ${record.outcome === 'VICTORY' ? 'border-green-500' : 'border-red-500'}`}>
                              <div>
                                 <span className={`font-bold font-display text-lg ${record.outcome === 'VICTORY' ? 'text-green-300' : 'text-red-300'}`}>
                                     {record.outcome}
                                 </span>
                                 <p className="text-xs text-slate-400">vs {record.enemyName}</p>
                              </div>
                              <div className="flex justify-between items-end">
                                 <span className="text-yellow-400 text-xs font-mono font-bold">+{record.reward} COINS</span>
                                 <span className="text-slate-600 text-[10px]">{record.date}</span>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </div>

    </div>
  );
};

export default Profile;