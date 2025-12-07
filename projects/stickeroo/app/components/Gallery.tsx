
import React, { useState } from 'react';
import { StickerPack } from '../types';
import { Trash2, ArrowLeft, Layers, Download } from 'lucide-react';
import { createStickerPackZip } from '../utils/imageUtils';

interface GalleryProps {
  items: StickerPack[];
  onSelect: (pack: StickerPack) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

export const Gallery: React.FC<GalleryProps> = ({ items, onSelect, onDelete, onBack }) => {
  const [viewingPackId, setViewingPackId] = useState<string | null>(null);

  const handleDownloadPack = async (e: React.MouseEvent, pack: StickerPack) => {
    e.stopPropagation();
    try {
      const blob = await createStickerPackZip(pack.stickers);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sticker_pack_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Failed to download pack");
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-20">
      <div className="sticky top-16 z-30 bg-purple-50/95 backdrop-blur py-3 -mx-4 px-4 border-b border-purple-100/50 grid grid-cols-3 items-center">
        <div className="justify-self-start">
          <button onClick={onBack} className="p-2 -ml-2 text-gray-500 hover:text-primary transition-colors">
            <ArrowLeft size={24} />
          </button>
        </div>
        <h2 className="text-2xl font-bold text-primary justify-self-center whitespace-nowrap">My Sticker Packs</h2>
        <span className="text-sm text-gray-500 font-medium justify-self-end">{items.length} packs</span>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-8 opacity-50">
          <span className="text-4xl mb-4">📂</span>
          <p className="text-lg font-medium text-primary">No sticker packs saved yet.</p>
          <p className="text-sm text-gray-500">Create one to see it in your collection!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {items.map((pack) => {
            const mainSticker = pack.stickers[0];
            const count = pack.stickers.length;
            
            return (
              <div key={pack.id} className="group relative bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden flex flex-col transition-all hover:shadow-md">
                <div 
                  className="aspect-square w-full relative cursor-pointer"
                  onClick={() => onSelect(pack)}
                >
                  {/* Checkerboard bg */}
                  <div className="absolute inset-0 z-0 opacity-20" 
                       style={{
                          backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                          backgroundSize: '10px 10px'
                       }}>
                  </div>
                  <img 
                    src={mainSticker?.image} 
                    alt="Saved Sticker" 
                    className="absolute inset-0 w-full h-full object-contain p-2 z-10"
                  />
                  {count > 1 && (
                    <div className="absolute top-2 right-2 bg-primary/90 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm z-20">
                      <Layers size={10} />
                      {count}
                    </div>
                  )}
                </div>
                
                <div className="p-2 flex justify-between items-center bg-white border-t border-purple-50">
                  <span className="text-[10px] text-gray-400">
                     {new Date(pack.timestamp).toLocaleDateString()}
                  </span>
                  
                  <div className="flex gap-1">
                    {count > 1 && (
                      <button
                        onClick={(e) => handleDownloadPack(e, pack)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Download Pack ZIP"
                      >
                        <Download size={16} />
                      </button>
                    )}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(pack.id);
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
