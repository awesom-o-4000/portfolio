import React from 'react';
import { MapPin, Clock, DollarSign, Tag, ExternalLink } from 'lucide-react';
import { JOBS } from '../constants';

export const Jobs: React.FC = () => {
  return (
    <div className="container mx-auto px-4 pt-20 pb-24 md:pt-24 md:pb-12 max-w-5xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Open Gigs</h1>
          <p className="text-gray-400 mt-1">Find your next prompt engineering contract.</p>
        </div>
        <button className="bg-white text-black px-6 py-2.5 rounded-lg font-bold hover:bg-gray-200 transition-colors text-sm">
          Post a Job
        </button>
      </div>

      <div className="space-y-4">
        {JOBS.map((job) => (
          <div 
            key={job.id} 
            className="group bg-surface border border-white/5 rounded-xl p-6 hover:border-primary/30 transition-all hover:bg-white/[0.02]"
          >
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2.5 py-1 rounded text-[10px] font-bold tracking-wider uppercase bg-white/5 text-gray-400 border border-white/5">
                    {job.type}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {job.postedAt}
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold text-white group-hover:text-primary transition-colors mb-2">
                  {job.title}
                </h3>
                
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                  <span className="font-medium text-white">{job.company}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">Remote <MapPin className="w-3 h-3" /></span>
                </div>

                <p className="text-gray-400 text-sm leading-relaxed mb-4 max-w-2xl">
                  {job.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {job.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 text-xs text-gray-300 border border-white/5">
                      <Tag className="w-3 h-3 opacity-50" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-row md:flex-col items-center md:items-end gap-4 w-full md:w-auto justify-between md:justify-start border-t md:border-t-0 border-white/5 pt-4 md:pt-0 mt-2 md:mt-0">
                <div className="text-right">
                  <div className="text-lg font-bold text-secondary flex items-center gap-1 md:justify-end">
                    {job.budget}
                  </div>
                  <div className="text-xs text-gray-500 hidden md:block">Estimated Budget</div>
                </div>
                
                <button 
                  className="px-6 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary hover:text-white transition-all text-sm font-medium flex items-center gap-2"
                  onClick={() => alert('Application flow would open here')}
                >
                  Apply Now
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};