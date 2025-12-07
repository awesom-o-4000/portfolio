import React from 'react';

interface CyberButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent';
  className?: string;
  disabled?: boolean;
}

export const CyberButton: React.FC<CyberButtonProps> = ({ 
  onClick, 
  children, 
  variant = 'primary', 
  className = '',
  disabled = false
}) => {
  const baseStyle = "font-cyber uppercase font-bold tracking-wider py-3 px-6 border transition-all duration-200 clip-path-polygon relative overflow-hidden group";
  
  const variants = {
    primary: "border-cyber-primary text-cyber-primary hover:bg-cyber-primary hover:text-cyber-black disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-cyber-primary",
    secondary: "border-cyber-secondary text-cyber-secondary hover:bg-cyber-secondary hover:text-white disabled:opacity-50",
    accent: "border-cyber-accent text-cyber-accent hover:bg-cyber-accent hover:text-cyber-black disabled:opacity-50"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
      <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-0"></div>
    </button>
  );
};