import React, { useState } from 'react';
import { Camera, ArrowRight, Check, Wand2 } from 'lucide-react';

export const CreateProfile: React.FC = () => {
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        
        {/* Progress Bar */}
        <div className="mb-8 flex items-center justify-between max-w-sm mx-auto">
           {[1, 2, 3].map((s) => (
             <div key={s} className="flex items-center">
               <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                 step >= s 
                  ? 'bg-primary border-primary text-white' 
                  : 'bg-transparent border-gray-600 text-gray-600'
               }`}>
                 {step > s ? <Check className="w-4 h-4" /> : s}
               </div>
               {s < 3 && (
                 <div className={`w-12 h-0.5 mx-2 ${step > s ? 'bg-primary' : 'bg-gray-700'}`}></div>
               )}
             </div>
           ))}
        </div>

        <div className="bg-surface border border-white/10 rounded-2xl p-8 shadow-2xl">
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-8">
              <h1 className="text-2xl font-bold text-white mb-2 text-center">Create your Creator Profile</h1>
              <p className="text-gray-400 text-center mb-8">Let's get your portfolio set up to sell prompts.</p>

              <div className="space-y-6">
                <div className="flex justify-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:text-primary text-gray-500 transition-colors">
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-[10px] uppercase font-bold">Upload</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Display Name</label>
                    <input type="text" className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none" placeholder="e.g. Neon Dreamer" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Handle</label>
                    <input type="text" className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none" placeholder="@username" />
                  </div>
                </div>

                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Bio</label>
                   <textarea className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none h-24 resize-none" placeholder="What kind of art do you create?"></textarea>
                </div>

                <button 
                  onClick={() => setStep(2)}
                  className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  Next Step <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-8">
              <h1 className="text-2xl font-bold text-white mb-2 text-center">Your Tech Stack</h1>
              <p className="text-gray-400 text-center mb-8">What tools do you use to create?</p>

              <div className="grid grid-cols-2 gap-3 mb-8">
                 {['Midjourney', 'Stable Diffusion', 'DALL-E 3', 'RunwayML', 'Photoshop', 'Leonardo.ai', 'ComfyUI', 'Blender'].map(tool => (
                   <label key={tool} className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-black/30 hover:bg-white/5 cursor-pointer transition-colors">
                     <input type="checkbox" className="w-4 h-4 rounded border-gray-600 text-primary focus:ring-primary bg-transparent" />
                     <span className="text-gray-200 text-sm font-medium">{tool}</span>
                   </label>
                 ))}
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 bg-transparent border border-white/10 text-white font-bold rounded-lg hover:bg-white/5 transition-colors"
                >
                  Back
                </button>
                <button 
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  Next Step <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-8 text-center">
               <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Wand2 className="w-10 h-10 text-secondary" />
               </div>
               <h1 className="text-2xl font-bold text-white mb-4">You're ready to go!</h1>
               <p className="text-gray-400 mb-8 max-w-md mx-auto">
                 Your profile has been created. Start uploading your prompts and artwork to earn money.
               </p>

               <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-8 text-left">
                  <h3 className="text-sm font-bold text-white mb-2">Default Pricing</h3>
                  <div className="flex gap-4">
                     <div className="flex-1">
                        <label className="text-xs text-gray-500 mb-1 block">Prompts</label>
                        <div className="bg-black/50 p-2 rounded text-white font-mono">$2.99</div>
                     </div>
                     <div className="flex-1">
                        <label className="text-xs text-gray-500 mb-1 block">Downloads</label>
                        <div className="bg-black/50 p-2 rounded text-white font-mono">$25.00</div>
                     </div>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2">You can change this per artwork.</p>
               </div>

               <button 
                  onClick={() => alert("Profile created! Redirecting...")}
                  className="w-full py-3 bg-secondary text-black font-bold rounded-lg hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
                >
                  Go to Dashboard
                </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};