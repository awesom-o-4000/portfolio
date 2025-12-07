import React, { useState } from 'react';
import { Button } from './Button';
import { AIStudio } from '../types';

interface ApiKeySelectorProps {
  onKeySelected: () => void;
}

export const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {
  const [error, setError] = useState<string | null>(null);

  const handleSelection = async () => {
    setError(null);
    try {
      const aistudio = (window as any).aistudio as AIStudio;
      await aistudio.openSelectKey();
      // Assume success if no error thrown, proceed to check
      if (await aistudio.hasSelectedApiKey()) {
        onKeySelected();
      } else {
         // Fallback re-check or simple proceed as per instructions to not wait too long
         onKeySelected();
      }
    } catch (e: any) {
      console.error(e);
      if (e.message && e.message.includes("Requested entity was not found")) {
        setError("Session expired or invalid. Please try selecting the key again.");
      } else {
        setError("An error occurred selecting the key.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 opacity-20">
         <div className="absolute top-0 left-0 w-96 h-96 bg-purple-900 rounded-full blur-[128px]"></div>
         <div className="absolute bottom-0 right-0 w-96 h-96 bg-fuchsia-900 rounded-full blur-[128px]"></div>
      </div>

      <div className="z-10 max-w-md w-full bg-ink-900/50 backdrop-blur-xl border border-ink-700 p-8 rounded-2xl shadow-2xl text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-purple-700 rounded-xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-accent-500/20">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
        </div>
        
        <h1 className="text-4xl font-display font-bold text-white mb-2">InkVision AI</h1>
        <p className="text-gray-400 mb-8">
          Next-generation tattoo visualization powered by Gemini Pro Vision.
        </p>

        <div className="space-y-4">
          <p className="text-sm text-gray-300">
            To generate high-quality 1K designs and perform realistic virtual try-ons, access to a paid API Key is required.
          </p>
          
          <Button onClick={handleSelection} className="w-full text-lg py-4">
            Connect with Google AI Studio
          </Button>

          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          
          <div className="pt-4 border-t border-ink-800">
             <a 
               href="https://ai.google.dev/gemini-api/docs/billing" 
               target="_blank" 
               rel="noopener noreferrer"
               className="text-xs text-gray-500 hover:text-accent-500 underline transition-colors"
             >
               Read about Gemini API Billing
             </a>
          </div>
        </div>
      </div>
    </div>
  );
};
