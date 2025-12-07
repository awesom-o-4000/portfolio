import React, { useState, useMemo } from 'react';
import { Heart, SlidersHorizontal, Check } from 'lucide-react';
import { Artwork, Creator } from '../types';

interface FeedProps {
  artworks: Artwork[];
  creators: Creator[];
  onSelectCreator: (creatorId: string) => void;
  onSelectArtwork: (artworkId: string) => void;
}

export const Feed: React.FC<FeedProps> = ({ artworks, creators, onSelectCreator, onSelectArtwork }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Trending');
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  
  const getCreator = (id: string) => creators.find(c => c.id === id);

  // Filter & Sort Logic
  const filteredArtworks = useMemo(() => {
    let result = [...artworks];

    // 1. Top Category Chips
    if (activeCategory === 'Trending') {
       result.sort((a, b) => b.likes - a.likes);
    } else if (activeCategory === 'New') {
       result = [...artworks].reverse(); // Simple simulation of "New"
    } else if (['Midjourney', 'Stable Diffusion'].includes(activeCategory)) {
       result = result.filter(a => a.model.toLowerCase().includes(activeCategory.toLowerCase()));
    } else if (['Portraits', 'Sci-Fi', 'Abstract'].includes(activeCategory)) {
       const keyword = activeCategory.toLowerCase();
       result = result.filter(a => 
         a.title.toLowerCase().includes(keyword) || 
         a.promptSnippet?.toLowerCase().includes(keyword)
       );
    }

    // 2. Advanced Filters (Model)
    if (selectedModels.length > 0) {
      result = result.filter(a => {
         return selectedModels.some(m => a.model.includes(m));
      });
    }

    return result;
  }, [artworks, activeCategory, selectedModels]);

  const toggleModel = (model: string) => {
    if (selectedModels.includes(model)) {
      setSelectedModels(selectedModels.filter(m => m !== model));
    } else {
      setSelectedModels([...selectedModels, model]);
    }
  };

  return (
    <div className="container mx-auto px-4 pt-20 pb-24 md:pt-24 md:pb-8">
      
      {/* Controls Bar - Sticky on mobile for better UX */}
      <div className="sticky top-14 md:top-16 z-30 bg-background/95 backdrop-blur-md py-4 -mx-4 px-4 mb-6 border-b border-white/5 md:static md:bg-transparent md:border-none md:p-0 md:mb-6 transition-all">
        <div className="flex items-center justify-between gap-4">
            <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1 mask-fade-right">
            {['Trending', 'New', 'Midjourney', 'Stable Diffusion', 'Portraits', 'Sci-Fi', 'Abstract'].map((tag) => (
                <button 
                key={tag}
                onClick={() => setActiveCategory(tag)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    activeCategory === tag
                    ? 'bg-white text-black shadow-lg shadow-white/10' 
                    : 'bg-surface border border-white/10 text-gray-400 hover:text-white hover:border-white/30'
                }`}
                >
                {tag}
                </button>
            ))}
            </div>
            
            <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-medium transition-all ${
                    showFilters 
                    ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                    : 'bg-surface border-white/10 text-gray-300 hover:border-white/30 hover:text-white'
                }`}
            >
                <SlidersHorizontal className="w-3 h-3" />
                Filter
            </button>
        </div>
      </div>

      {/* Advanced Filter Panel (Expandable) */}
      {showFilters && (
        <div className="mb-8 p-4 md:p-6 bg-surface border border-white/10 rounded-2xl animate-in slide-in-from-top-2 shadow-2xl">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Model</label>
                <div className="space-y-2">
                   {['Midjourney', 'DALL-E 3', 'Stable Diffusion'].map(m => (
                     <label key={m} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white group select-none">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedModels.includes(m) ? 'bg-primary border-primary' : 'border-gray-600 group-hover:border-white'}`}>
                           {selectedModels.includes(m) && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <input 
                            type="checkbox" 
                            className="hidden"
                            checked={selectedModels.includes(m)}
                            onChange={() => toggleModel(m)}
                        />
                        {m}
                     </label>
                   ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Price Range</label>
                <div className="space-y-2">
                   {['Free', 'Under $5', '$5 - $20', '$20+'].map(p => (
                     <label key={p} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white group select-none">
                        <div className="w-4 h-4 rounded border border-gray-600 group-hover:border-white"></div>
                        {p}
                     </label>
                   ))}
                </div>
              </div>

               <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Orientation</label>
                <div className="space-y-2">
                   {['Portrait', 'Landscape', 'Square'].map(o => (
                     <label key={o} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white group select-none">
                        <div className="w-4 h-4 rounded border border-gray-600 group-hover:border-white"></div>
                        {o}
                     </label>
                   ))}
                </div>
              </div>
              
              <div className="flex items-end">
                 <button 
                    onClick={() => setShowFilters(false)}
                    className="w-full py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors"
                 >
                    Apply Filters
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Masonry Layout */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {filteredArtworks.map((art) => {
          const creator = getCreator(art.creatorId);
          return (
            <div 
              key={art.id} 
              className="group relative break-inside-avoid rounded-xl overflow-hidden bg-surface border border-white/5 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 cursor-pointer"
              onClick={() => onSelectArtwork(art.id)}
            >
              <img 
                src={art.imageUrl} 
                alt={art.title} 
                className="w-full h-auto object-cover"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400';
                }}
              />
              
              {/* Top Right Model Badge */}
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-mono text-white/80 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                {art.model}
              </div>

              {/* Overlay Content */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <h3 className="text-white font-medium text-sm mb-1 translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                  {art.title}
                </h3>
                
                <div className="flex items-center justify-between translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-100">
                  {creator && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCreator(creator.id);
                      }}
                      className="flex items-center gap-2 group/creator"
                    >
                      <img 
                        src={creator.avatar} 
                        alt={creator.name} 
                        className="w-5 h-5 rounded-full border border-white/20"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100';
                        }}
                      />
                      <span className="text-xs text-gray-300 group-hover/creator:text-primary transition-colors">
                        {creator.name}
                      </span>
                    </button>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <button 
                      className="text-white/60 hover:text-pink-500 transition-colors p-1"
                      onClick={(e) => {
                          e.stopPropagation();
                          // In a real app, this would toggle like state
                      }}
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {filteredArtworks.length === 0 && (
          <div className="text-center py-20 text-gray-500">
              <p>No artworks found matching your filters.</p>
              <button onClick={() => { setActiveCategory('Trending'); setSelectedModels([]); }} className="text-primary hover:underline mt-2">Clear filters</button>
          </div>
      )}
    </div>
  );
};