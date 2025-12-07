import React, { useRef } from 'react';
import { GeneratedDesign, TattooStyle } from '../types';
import { Button } from './Button';

interface GalleryProps {
  designs: GeneratedDesign[];
  onSelectForTryOn: (design: GeneratedDesign) => void;
  onDelete: (id: string) => void;
  onUpload: (file: File) => void;
}

export const Gallery: React.FC<GalleryProps> = ({ designs, onSelectForTryOn, onDelete, onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  const downloadImage = (e: React.MouseEvent, url: string, prompt: string) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = url;
    const safeName = prompt.slice(0, 20).replace(/[^a-z0-9]/gi, '-').toLowerCase();
    link.download = `inkling-${safeName}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const UploadButton = () => (
    <>
      <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        Upload Design
      </Button>
      <input 
        type="file" 
        ref={fileInputRef} 
        hidden 
        accept="image/*" 
        onChange={handleFileChange}
      />
    </>
  );

  if (designs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-ink-800 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No Designs Yet</h3>
        <p className="text-gray-500 max-w-sm mb-6">
          Generate a design using AI or upload your own transparent PNG to get started.
        </p>
        <div className="flex gap-4">
            <UploadButton />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-3xl font-display font-bold text-white">Your Collection</h2>
        <UploadButton />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {designs.map((design) => (
          <div key={design.id} className="group bg-ink-800 rounded-xl overflow-hidden border border-ink-700 transition-all hover:border-accent-500/50 hover:shadow-xl hover:shadow-accent-500/10">
            <div className="relative aspect-square bg-ink-900">
              <img 
                src={design.imageUrl} 
                alt={design.prompt} 
                className="w-full h-full object-contain p-4"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button 
                  onClick={() => onSelectForTryOn(design)}
                  className="!px-4 !py-2 text-sm !bg-accent-500 hover:!bg-accent-600 text-white shadow-lg border-0"
                  title="Try On"
                >
                  Try On
                </Button>
                
                <button 
                  onClick={(e) => downloadImage(e, design.imageUrl, design.prompt)}
                  className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors"
                  title="Download"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </button>

                <button 
                  onClick={() => onDelete(design.id)}
                  className="p-2 bg-red-500/20 backdrop-blur-sm text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                  title="Delete"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-accent-500 uppercase tracking-wider">{design.style}</span>
                <span className="text-xs text-gray-600">{new Date(design.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-gray-300 line-clamp-2" title={design.prompt}>
                {design.prompt}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};