import React from 'react';
import { ArrowLeft, Heart, Share2, ShieldCheck, Download, Lock, Maximize2, Sparkles, Image as ImageIcon, Copy } from 'lucide-react';
import { Artwork, Creator } from '../types';

interface ArtworkDetailProps {
  artwork: Artwork;
  creator: Creator;
  onBack: () => void;
  onSelectCreator: (id: string) => void;
}

export const ArtworkDetail: React.FC<ArtworkDetailProps> = ({ artwork, creator, onBack, onSelectCreator }) => {
  return (
    <div className="min-h-screen bg-background pb-24 md:pb-12 pt-20 md:pt-24 animate-in fade-in">
      <div className="container mx-auto px-4 max-w-6xl">
        <button 
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back to Gallery</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Left Column: Image */}
          <div className="lg:col-span-3">
            <div className="relative group bg-surface border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={artwork.imageUrl} 
                alt={artwork.title} 
                className="w-full h-auto object-contain max-h-[80vh] bg-black/50"
              />
              <button className="absolute bottom-4 right-4 p-2 bg-black/60 backdrop-blur-md rounded-lg text-white/80 hover:text-white hover:bg-black/80 transition-colors border border-white/10">
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>
            
            {/* Image Stats / Details Mobile */}
            <div className="flex items-center justify-between mt-4 text-gray-400 text-sm font-mono px-2">
               <div className="flex gap-4">
                  <span>1024 x 1024</span>
                  <span>PNG</span>
               </div>
               <button className="flex items-center gap-1.5 hover:text-pink-500 transition-colors">
                  <Heart className="w-4 h-4" /> {artwork.likes}
               </button>
            </div>
          </div>

          {/* Right Column: Info & Purchase */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Header Info */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{artwork.title}</h1>
              <div className="flex items-center justify-between">
                <div 
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => onSelectCreator(creator.id)}
                >
                  <img src={creator.avatar} alt={creator.name} className="w-10 h-10 rounded-full border border-white/10" />
                  <div>
                    <h3 className="text-white font-medium group-hover:text-primary transition-colors">{creator.name}</h3>
                    <p className="text-xs text-gray-500">{creator.handle}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                   <button className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/5">
                      <Share2 className="w-5 h-5" />
                   </button>
                </div>
              </div>
            </div>

            {/* Pricing Card - SPLIT OPTIONS */}
            <div className="grid grid-cols-2 gap-4">
              {/* Option 1: Buy Prompt */}
              <div className="bg-surface border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:border-primary/50 transition-colors relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full blur-xl"></div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-bold text-gray-200">Prompt</span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{artwork.promptPrice}</div>
                    <p className="text-[10px] text-gray-500 mb-4">Unlocks full prompt text & params</p>
                  </div>
                  <button className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors">
                    Unlock Text
                  </button>
              </div>

              {/* Option 2: Buy Download */}
              <div className="bg-surface border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:border-secondary/50 transition-colors relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-secondary/10 rounded-full blur-xl"></div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <ImageIcon className="w-4 h-4 text-secondary" />
                      <span className="text-sm font-bold text-gray-200">Image</span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{artwork.downloadPrice}</div>
                    <p className="text-[10px] text-gray-500 mb-4">4K Res + Commercial License</p>
                  </div>
                  <button className="w-full py-2 rounded-lg bg-secondary hover:bg-emerald-400 text-black text-sm font-bold transition-colors">
                    Buy License
                  </button>
              </div>
            </div>

            {/* Prompt Preview (Blurred) */}
            <div className="bg-surface border border-white/5 rounded-xl p-5">
               <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3 flex items-center justify-between">
                 <span>Prompt Preview</span>
                 <Lock className="w-3 h-3 text-gray-500" />
               </h3>
               <div className="relative overflow-hidden rounded-lg bg-black/30 p-4 border border-white/5">
                  <p className="text-gray-500 font-mono text-sm leading-relaxed blur-[3px] select-none">
                     {artwork.promptSnippet} --v 6.0 --ar 16:9 --style raw --stylize 250 --chaos 10
                     detailed lighting, volumetric fog, octane render, 8k resolution, unreal engine 5, photorealistic...
                  </p>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
                     <div className="bg-black/80 px-4 py-2 rounded-lg border border-white/10 text-xs text-white font-medium flex items-center gap-2">
                        Unlock for {artwork.promptPrice}
                     </div>
                  </div>
               </div>
            </div>

            {/* Metadata Tags */}
            <div>
               <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Generation Details</h3>
               <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 rounded bg-white/5 border border-white/5 text-gray-300 text-xs hover:border-white/20 transition-colors">
                     Model: <span className="text-white">{artwork.model}</span>
                  </span>
                  <span className="px-3 py-1.5 rounded bg-white/5 border border-white/5 text-gray-300 text-xs hover:border-white/20 transition-colors">
                     Sampler: <span className="text-white">DPM++ 2M Karras</span>
                  </span>
                  <span className="px-3 py-1.5 rounded bg-white/5 border border-white/5 text-gray-300 text-xs hover:border-white/20 transition-colors">
                     Steps: <span className="text-white">30</span>
                  </span>
                  <span className="px-3 py-1.5 rounded bg-white/5 border border-white/5 text-gray-300 text-xs hover:border-white/20 transition-colors">
                     CFG Scale: <span className="text-white">7.0</span>
                  </span>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};