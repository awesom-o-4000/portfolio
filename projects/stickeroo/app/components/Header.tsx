import React from 'react';
import { Grid } from 'lucide-react';

interface HeaderProps {
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isLoggedIn, onLogin, onLogout }) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-violet-50">
      <div className="max-w-md mx-auto px-4 h-16 relative flex items-center justify-end">
        
        <div className="flex items-center">
          {/* This single button now handles login (which navigates to gallery) and logout */}
          <button 
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-primary rounded-full text-sm font-bold transition-colors active:scale-95"
            onClick={isLoggedIn ? onLogout : onLogin}
          >
            {isLoggedIn ? (
              'Logout'
            ) : (
              <>
                <Grid size={16} />
                <span>My Stickers</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};