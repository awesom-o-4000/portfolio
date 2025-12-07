import React from 'react';
import { ArrowLeft, Star, Clock, CheckCircle2, Zap, Share2 } from 'lucide-react';
import { Creator, Artwork } from '../types';

interface ProfileProps {
  creator: Creator;
  artworks: Artwork[];
  onBack: () => void;
  onHire: () => void;
  onSelectArtwork: (id: string) => void;
}

export const Profile: React.FC<ProfileProps> = ({ creator, artworks, onBack, onHire, onSelectArtwork }) => {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Cover Image */}
      <div className="h-48 md:h-64 w-full relative">
        <img 
          src={creator.coverImage} 
          alt="Cover" 
          className="w-full h-full object-cover opacity-60"
          onError={(e) => {
             (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background"></div>
        <button 
          onClick={onBack}
          className="absolute top-4 left-4 md:top-20 md:left-8 p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-white/10 transition-colors z-10"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="container mx-auto px-4 -mt-16 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 md:items-end mb-8">
          {/* Avatar */}
          <div className="relative">
            <div className="w-32 h-32 rounded-2xl p-1 bg-gradient-to-br from-surface to-surface/50 backdrop-blur-sm border border-white/10 overflow-hidden shadow-2xl">
               <img 
                 src={creator.avatar} 
                 alt={creator.name} 
                 className="w-full h-full object-cover rounded-xl"
                 onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200';
                 }}
               />
            </div>
            
            <div className="absolute -bottom-2 -right-2 bg-surface px-3 py-1 rounded-full border border-white/10 flex items-center gap-2 shadow-lg">
              <span className="relative flex h-2.5 w-2.5">
                {creator.available && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${creator.available ? 'bg-secondary' : 'bg-gray-500'}`}></span>
              </span>
              <span className={`text-xs font-medium ${creator.available ? 'text-secondary' : 'text-gray-400'}`}>
                {creator.available ? 'Available' : 'Busy'}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">{creator.name}</h1>
            <p className="text-primary font-mono text-sm mb-4">{creator.handle}</p>
            <p className="text-gray-400 max-w-2xl leading-relaxed text-sm md:text-base">
              {creator.bio}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-4 md:mt-0">
             <button className="p-3 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
               <Share2 className="w-5 h-5" />
             </button>
             <button 
                onClick={onHire}
                className="flex-1 md:flex-none px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.15)]"
              >
                <Zap className="w-4 h-4 fill-black" />
                Hire Me
             </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-10 border-y border-white/5 py-6">
          <div className="flex flex-col items-center justify-center border-r border-white/5 last:border-0">
            <div className="flex items-center gap-1.5 text-white font-bold text-lg">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              {creator.stats.successRate}%
            </div>
            <span className="text-xs text-gray-500 uppercase tracking-wider mt-1">Success</span>
          </div>
          <div className="flex flex-col items-center justify-center border-r border-white/5 last:border-0">
            <div className="flex items-center gap-1.5 text-white font-bold text-lg">
              <Clock className="w-4 h-4 text-blue-400" />
              {creator.stats.responseTime}
            </div>
            <span className="text-xs text-gray-500 uppercase tracking-wider mt-1">Response</span>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center gap-1.5 text-white font-bold text-lg">
              <CheckCircle2 className="w-4 h-4 text-secondary" />
              {creator.stats.completedJobs}
            </div>
            <span className="text-xs text-gray-500 uppercase tracking-wider mt-1">Jobs Done</span>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mb-10">
          <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">Tech Stack</h3>
          <div className="flex flex-wrap gap-2">
            {creator.techStack.map(tech => (
              <span key={tech} className="px-3 py-1.5 rounded bg-white/5 border border-white/5 text-gray-300 text-xs font-mono hover:border-primary/50 transition-colors cursor-default">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Portfolio Grid */}
        <div>
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            Portfolio <span className="text-gray-600 font-normal text-sm">({artworks.length})</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {artworks.map(art => (
              <div 
                key={art.id} 
                className="aspect-square rounded-lg overflow-hidden relative group cursor-pointer"
                onClick={() => onSelectArtwork(art.id)}
              >
                <img 
                  src={art.imageUrl} 
                  alt={art.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                     (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400';
                  }}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="px-4 py-2 border border-white/30 rounded-full text-xs font-medium text-white backdrop-blur-sm">View</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};