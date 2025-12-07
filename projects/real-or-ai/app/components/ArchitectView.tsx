import React from 'react';
import { ARCHITECT_ANALYSIS } from '../constants';
import { CyberButton } from './ui/CyberButton';
import { GameMode } from '../types';

interface ArchitectViewProps {
  setMode: (mode: GameMode) => void;
}

export const ArchitectView: React.FC<ArchitectViewProps> = ({ setMode }) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8 border-b border-cyber-dim pb-4">
        <h2 className="text-2xl font-cyber text-cyber-accent">SYSTEM ARCHITECTURE // DEV_ONE</h2>
        <CyberButton variant="primary" onClick={() => setMode(GameMode.MENU)}>
          Close Terminal
        </CyberButton>
      </div>

      <div className="space-y-8 h-[70vh] overflow-y-auto pr-4 custom-scrollbar">
        {ARCHITECT_ANALYSIS.map((section, idx) => (
          <div key={idx} className="bg-cyber-panel border border-cyber-dim p-6 rounded-sm relative">
             <div className="absolute top-0 right-0 p-2 text-xs text-cyber-dim font-mono">SECTOR_0{idx + 1}</div>
            <h3 className="text-xl font-bold text-white mb-2 font-cyber">{section.title}</h3>
            <p className="text-gray-400 mb-6 font-mono text-sm border-l-2 border-cyber-secondary pl-4">
              {section.content}
            </p>
            <div className="space-y-4">
              {section.items.map((item, i) => (
                <div key={i} className="bg-black/40 p-4 rounded border border-white/5 hover:border-cyber-primary/30 transition-colors">
                  <h4 className="text-cyber-primary font-bold mb-1 font-cyber text-sm tracking-widest">{item.label}</h4>
                  <p className="text-gray-300 text-sm font-mono leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};