import React from 'react';
import { Star, Zap } from 'lucide-react';
import { Creator } from '../types';

interface CreatorsListProps {
  creators: Creator[];
  onSelectCreator: (id: string) => void;
}

export const CreatorsList: React.FC<CreatorsListProps> = ({ creators, onSelectCreator }) => {
  return (
    <div className="container mx-auto px-4 pt-20 pb-24 md:pt-24 md:pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Featured Creators</h1>
        <p className="text-gray-400 mt-1">Top rated prompt engineers available for hire.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {creators.map((creator) => (
          <div 
            key={creator.id} 
            className="group bg-surface border border-white/5 rounded-xl overflow-hidden hover:border-primary/50 transition-all flex flex-col"
          >
            {/* Header / Cover */}
            <div className="h-32 bg-gray-800 relative">
              <img 
                src={creator.coverImage} 
                alt="cover" 
                className="w-full h-full object-cover opacity-50 group-hover:opacity-75 transition-opacity"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800';
                }}
              />
              <div className="absolute top-3 right-3 flex gap-2">
                {creator.available ? (
                   <span className="px-2 py-1 rounded bg-black/60 backdrop-blur text-[10px] font-medium text-secondary border border-secondary/20 flex items-center gap-1">
                     <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                     OPEN
                   </span>
                ) : (
                   <span className="px-2 py-1 rounded bg-black/60 backdrop-blur text-[10px] font-medium text-gray-400 border border-white/10 flex items-center gap-1">
                     <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                     BUSY
                   </span>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="p-5 pt-0 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <div className="-mt-10 relative">
                  <img 
                    src={creator.avatar} 
                    alt={creator.name} 
                    className="w-20 h-20 rounded-xl border-4 border-surface object-cover shadow-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200';
                    }}
                  />
                </div>
                <div className="mt-3 flex items-center gap-1 text-yellow-500 font-bold text-sm">
                  <Star className="w-4 h-4 fill-current" />
                  {creator.stats.successRate}%
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors cursor-pointer" onClick={() => onSelectCreator(creator.id)}>
                  {creator.name}
                </h3>
                <p className="text-xs font-mono text-gray-500">{creator.handle}</p>
              </div>

              <p className="text-sm text-gray-400 mb-4 line-clamp-2 flex-1">
                {creator.bio}
              </p>

              {/* Skills */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {creator.techStack.slice(0, 3).map(tech => (
                  <span key={tech} className="px-2 py-1 rounded bg-white/5 text-[10px] text-gray-300 border border-white/5">
                    {tech}
                  </span>
                ))}
                {creator.techStack.length > 3 && (
                  <span className="px-2 py-1 rounded bg-white/5 text-[10px] text-gray-500 border border-white/5">
                    +{creator.techStack.length - 3}
                  </span>
                )}
              </div>

              <button 
                onClick={() => onSelectCreator(creator.id)}
                className="w-full py-2.5 rounded-lg bg-white/5 border border-white/10 text-white font-medium hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 text-sm"
              >
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};