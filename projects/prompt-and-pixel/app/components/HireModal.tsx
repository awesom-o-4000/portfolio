import React, { useState } from 'react';
import { X, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Creator, HireFormData } from '../types';

interface HireModalProps {
  isOpen: boolean;
  onClose: () => void;
  creator: Creator;
}

export const HireModal: React.FC<HireModalProps> = ({ isOpen, onClose, creator }) => {
  const [formData, setFormData] = useState<HireFormData>({
    jobType: 'commission',
    brief: '',
    model: 'Midjourney v6',
    budget: '$50 - $100'
  });

  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, send data to backend
    setStep(2);
    setTimeout(() => {
        onClose();
        setStep(1);
        setFormData({...formData, brief: ''}); // reset
        alert(`Request sent to ${creator.name}!`);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-surface border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        
        {step === 1 ? (
          <>
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#1a1a1a]">
              <div>
                <h2 className="text-xl font-bold text-white">Hire {creator.name}</h2>
                <p className="text-xs text-gray-400 mt-1">Typically responds within {creator.stats.responseTime}</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Job Type Toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 rounded-lg">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, jobType: 'commission' })}
                  className={`py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    formData.jobType === 'commission' 
                      ? 'bg-primary text-white shadow-lg' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  New Commission
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, jobType: 'remix' })}
                  className={`py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    formData.jobType === 'remix' 
                      ? 'bg-primary text-white shadow-lg' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  Remix / Edit
                </button>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-gray-500 uppercase mb-2">Project Brief</label>
                  <textarea 
                    value={formData.brief}
                    onChange={(e) => setFormData({...formData, brief: e.target.value})}
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 min-h-[120px] resize-none placeholder-gray-600"
                    placeholder="Describe your vision (e.g., 'A cyberpunk detective standing in neon rain...')"
                    required
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-gray-500 uppercase mb-2">Preferred Model</label>
                    <div className="relative">
                      <select 
                        value={formData.model}
                        onChange={(e) => setFormData({...formData, model: e.target.value})}
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-primary/50 appearance-none cursor-pointer"
                      >
                         <option>Midjourney v6</option>
                         <option>Stable Diffusion XL</option>
                         <option>DALL-E 3</option>
                         <option>Creator's Choice</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-gray-500 uppercase mb-2">Est. Budget</label>
                    <div className="relative">
                      <select 
                        value={formData.budget}
                        onChange={(e) => setFormData({...formData, budget: e.target.value})}
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-primary/50 appearance-none cursor-pointer"
                      >
                         <option>$20 - $50</option>
                         <option>$50 - $100</option>
                         <option>$100 - $300</option>
                         <option>$300+</option>
                      </select>
                       <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button 
                type="submit"
                className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
              >
                Send Request
              </button>
            </form>
          </>
        ) : (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-secondary animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Request Sent!</h3>
            <p className="text-gray-400 mb-6">You've started a conversation with {creator.name}. They usually reply quickly.</p>
          </div>
        )}
      </div>
    </div>
  );
};