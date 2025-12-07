import React from 'react';
import { MessageSquare, Flame, Eye, PlusCircle, Clock } from 'lucide-react';
import { TOPICS } from '../constants';

export const Community: React.FC = () => {
  return (
    <div className="container mx-auto px-4 pt-20 pb-24 md:pt-24 md:pb-12 max-w-5xl">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Community</h1>
          <p className="text-gray-400 mt-1">Discuss techniques, news, and showcase your work.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
                 <input 
                    type="text" 
                    placeholder="Search topics..." 
                    className="bg-surface border border-white/10 rounded-lg pl-4 pr-10 py-2 text-sm text-white focus:outline-none focus:border-primary/50 w-64"
                 />
            </div>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary text-white px-5 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
            <PlusCircle className="w-4 h-4" />
            New Topic
            </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Topics */}
        <div className="hidden lg:block space-y-6">
           <div className="bg-surface border border-white/5 rounded-xl p-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Categories</h3>
              <ul className="space-y-1">
                 {['All Topics', 'Announcements', 'General', 'Workflow', 'Showcase', 'Critique'].map((cat, i) => (
                    <li key={cat}>
                        <button className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${i === 0 ? 'bg-white/10 text-white font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                            {cat}
                        </button>
                    </li>
                 ))}
              </ul>
           </div>

           <div className="bg-gradient-to-br from-primary/20 to-surface border border-primary/20 rounded-xl p-5">
              <h3 className="text-white font-bold mb-2">Pro Tip</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                 Use <code className="bg-black/30 px-1 rounded text-primary">--stylize 250</code> for a balanced artistic flair in v6 models.
              </p>
           </div>
        </div>

        {/* Discussion List */}
        <div className="lg:col-span-3 space-y-3">
           {TOPICS.map((topic) => (
             <div 
                key={topic.id}
                className="bg-surface border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all hover:bg-white/[0.02] cursor-pointer group"
             >
                <div className="flex gap-4">
                   <div className="flex-shrink-0">
                      <img 
                        src={topic.authorAvatar} 
                        alt={topic.author} 
                        className="w-10 h-10 rounded-full border border-white/10"
                      />
                   </div>
                   
                   <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                         <span className="text-xs font-medium text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/10">
                            {topic.category}
                         </span>
                         {topic.isHot && (
                             <span className="flex items-center gap-1 text-[10px] font-bold text-orange-500 uppercase tracking-wide">
                                <Flame className="w-3 h-3 fill-orange-500" />
                                Hot
                             </span>
                         )}
                         <span className="text-xs text-gray-500 ml-auto flex items-center gap-1">
                            <Clock className="w-3 h-3" /> 2h
                         </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-white mb-1 truncate group-hover:text-primary transition-colors">
                         {topic.title}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-1 mb-3">
                         {topic.preview}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                         <span className="text-gray-300 font-medium hover:underline">{topic.author}</span>
                         <span className="flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5" />
                            {topic.replies} replies
                         </span>
                         <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            {topic.views} views
                         </span>
                      </div>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};