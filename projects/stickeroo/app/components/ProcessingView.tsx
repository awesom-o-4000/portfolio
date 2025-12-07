
import React, { useEffect, useState } from 'react';
import { Loader2, Palette } from 'lucide-react';

export const ProcessingView: React.FC = () => {
  const [tip, setTip] = useState(0);
  const tips = [
    "Analyzing features...",
    "Designing 3D Sticker...",
    "Applying glossy finish...",
    "Polishing details...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTip((prev) => (prev + 1) % tips.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 p-6 text-center">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-accent to-primary rounded-full blur-2xl opacity-40 animate-pulse"></div>
        <div className="relative bg-white rounded-3xl p-8 shadow-2xl border border-purple-100">
           <Palette className="w-16 h-16 text-primary animate-bounce-slow" />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-2xl font-bold text-primary">Creating your Sticker...</h2>
        <div className="h-6 overflow-hidden">
           <p className="text-gray-500 font-medium transition-all duration-300 transform translate-y-0">
             {tips[tip]}
           </p>
        </div>
      </div>

      <div className="w-full max-w-xs bg-purple-100 h-2 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-primary to-accent animate-[loading_2s_ease-in-out_infinite] w-1/2 rounded-full"></div>
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
};
