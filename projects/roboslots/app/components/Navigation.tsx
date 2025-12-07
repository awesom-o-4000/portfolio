import React from 'react';
import { GameView, PartType, RobotPart } from '../types';
import { LayoutGrid, Hammer, Swords, Trophy, User } from 'lucide-react';

interface NavigationProps {
  currentView: GameView;
  setView: (view: GameView) => void;
  inventory?: RobotPart[];
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView, inventory = [] }) => {
  const navItems = [
    { view: GameView.SLOTS, icon: LayoutGrid, label: 'Slots' },
    { view: GameView.WORKSHOP, icon: Hammer, label: 'Workshop' },
    { view: GameView.BATTLE, icon: Swords, label: 'Battle' },
    { view: GameView.LEADERBOARD, icon: Trophy, label: 'Rank' },
    { view: GameView.PROFILE, icon: User, label: 'Profile' },
  ];

  // Calculate unique collected part types for badge
  const uniqueTypes = new Set(inventory.map(p => p.type));
  const collectedCount = uniqueTypes.size;

  return (
    <div className="bg-slate-900 border-t border-slate-700 h-16 flex items-center justify-around z-50 safe-area-bottom flex-shrink-0 px-1">
      {navItems.map((item) => (
        <button
          key={item.view}
          onClick={() => setView(item.view)}
          className={`relative flex flex-col items-center justify-center w-full h-full transition-colors active:bg-slate-800 ${
            currentView === item.view
              ? 'text-cyan-400 bg-slate-800/50 border-t-2 border-cyan-400'
              : 'text-slate-500 hover:text-slate-300 border-t-2 border-transparent'
          }`}
        >
          <div className="relative">
              <item.icon size={20} className={currentView === item.view ? 'drop-shadow-lg shadow-cyan-500' : ''}/>
              {item.view === GameView.WORKSHOP && collectedCount < 5 && collectedCount > 0 && (
                  <div className="absolute -top-2 -right-3 bg-red-500 text-white text-[9px] font-bold px-1 rounded-full min-w-[16px] text-center border border-slate-900">
                      {collectedCount}/5
                  </div>
              )}
          </div>
          <span className="text-[9px] mt-1 font-medium font-display tracking-wide">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default Navigation;