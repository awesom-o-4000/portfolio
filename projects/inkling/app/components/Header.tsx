import React from 'react';
import { ViewState } from '../types';

interface HeaderProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-ink-900/90 backdrop-blur-md border-b border-ink-700">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer shrink-0" 
          onClick={() => onNavigate('generate')}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-accent-500 to-purple-700 rounded-md flex items-center justify-center shadow-lg shadow-accent-500/20">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <span className="text-xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 hidden xs:block">
            Inkling
          </span>
        </div>

        {/* Navigation - scrollable on very small mobile screens */}
        <nav className="flex items-center gap-1 bg-ink-800 p-1 rounded-full border border-ink-700 overflow-x-auto no-scrollbar ml-2">
          {[
            { id: 'generate', label: 'Create' },
            { id: 'gallery', label: 'Gallery' },
            { id: 'try-on', label: 'Try On' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as ViewState)}
              className={`
                px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap
                ${currentView === item.id 
                  ? 'bg-accent-600 text-white shadow-md' 
                  : 'text-gray-400 hover:text-white hover:bg-ink-700'}
              `}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};