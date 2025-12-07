import React from 'react';
import { Home, Search, Briefcase, Users, MessageCircle, Bell, Plus } from 'lucide-react';
import { ViewType } from '../types';

interface NavbarProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  onProfileClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView, onProfileClick }) => {
  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:flex fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-white/5 h-16 items-center justify-between px-8 transition-all duration-300">
        <div className="flex items-center gap-8">
          <div 
            className="text-2xl font-bold tracking-tighter cursor-pointer text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 hover:to-primary transition-all"
            onClick={() => setCurrentView('feed')}
          >
            Prompt & Pixel
          </div>
          <nav className="flex gap-6 text-sm font-medium text-gray-400">
            <button 
              onClick={() => setCurrentView('feed')} 
              className={`hover:text-white transition-colors ${currentView === 'feed' ? 'text-white' : ''}`}
            >
              Feed
            </button>
            <button 
              onClick={() => setCurrentView('jobs')}
              className={`hover:text-white transition-colors ${currentView === 'jobs' ? 'text-white' : ''}`}
            >
              Jobs
            </button>
            <button 
              onClick={() => setCurrentView('creators')}
              className={`hover:text-white transition-colors ${['creators'].includes(currentView) ? 'text-white' : ''}`}
            >
              Creators
            </button>
            <button 
               onClick={() => setCurrentView('community')}
               className={`hover:text-white transition-colors ${currentView === 'community' ? 'text-white' : ''}`}
            >
              Community
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search art or models..." 
              className="bg-surface border border-white/5 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 w-64 transition-all"
            />
          </div>
          
          <button 
            onClick={() => setCurrentView('create-profile')}
            className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-gray-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Join as Creator
          </button>

          <button className="p-2 text-gray-400 hover:text-white transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></span>
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-blue-600 p-[1px] cursor-pointer" onClick={onProfileClick}>
            <div className="w-full h-full rounded-full bg-surface flex items-center justify-center overflow-hidden">
               <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100" alt="User" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 bg-[#0a0a0a]/90 backdrop-blur-lg border-t border-white/10 pb-safe">
        <div className="flex justify-around items-center h-16">
          <button 
            onClick={() => setCurrentView('feed')}
            className={`flex flex-col items-center gap-1 ${currentView === 'feed' ? 'text-primary' : 'text-gray-500'}`}
          >
            <Home className="w-6 h-6" />
            <span className="text-[10px] font-medium">Feed</span>
          </button>
          
          <button 
            onClick={() => setCurrentView('search')}
            className={`flex flex-col items-center gap-1 ${currentView === 'search' ? 'text-primary' : 'text-gray-500'}`}
          >
            <Search className="w-6 h-6" />
            <span className="text-[10px] font-medium">Search</span>
          </button>

          <button 
            onClick={() => setCurrentView('jobs')}
            className={`flex flex-col items-center gap-1 ${currentView === 'jobs' ? 'text-primary' : 'text-gray-500'}`}
          >
            <Briefcase className="w-6 h-6" />
            <span className="text-[10px] font-medium">Jobs</span>
          </button>

          <button 
            onClick={() => setCurrentView('creators')}
            className={`flex flex-col items-center gap-1 ${['creators'].includes(currentView) ? 'text-primary' : 'text-gray-500'}`}
          >
            <Users className="w-6 h-6" />
            <span className="text-[10px] font-medium">Creators</span>
          </button>

          <button 
            onClick={onProfileClick}
            className={`flex flex-col items-center gap-1 ${currentView === 'profile' ? 'text-primary' : 'text-gray-500'}`}
          >
            <div className="w-6 h-6 rounded-full overflow-hidden border border-current">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=50&h=50" alt="User" className="w-full h-full object-cover" />
            </div>
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </nav>
      
      {/* Mobile Top Header (Logo Only) */}
      <div className="md:hidden fixed top-0 w-full z-40 bg-background/80 backdrop-blur-md border-b border-white/5 h-14 flex items-center justify-between px-4">
        <span 
          className="text-lg font-bold tracking-tight text-white cursor-pointer"
          onClick={() => setCurrentView('feed')}
        >
          Prompt & Pixel
        </span>
        <div className="flex gap-4">
             <button className="text-gray-400" onClick={() => setCurrentView('create-profile')}>
                 <Plus className="w-6 h-6" />
             </button>
             <button className="text-gray-400" onClick={() => setCurrentView('community')}>
                 <MessageCircle className="w-6 h-6" />
             </button>
             <button className="text-gray-400">
                <Bell className="w-6 h-6" />
             </button>
        </div>
      </div>
    </>
  );
};