
import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, ArrowLeft, Copy, Share2, Check, Wand2, Layers, Loader2, PackagePlus } from 'lucide-react';
import { StickerVariation, StickerPack } from '../types';
import { generateStickerVariations } from '../services/gemini';
import { convertToWhatsAppWebP, createStickerPackZip } from '../utils/imageUtils';

interface ResultViewProps {
  pack: StickerPack;
  onReset: () => void;
  onTweak: (instruction: string) => void;
  onUpdatePack: (variations: StickerVariation[]) => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ 
  pack,
  onReset, 
  onTweak,
  onUpdatePack
}) => {
  const [copied, setCopied] = useState(false);
  const [tweakInput, setTweakInput] = useState("");
  const [isTweaking, setIsTweaking] = useState(false);
  
  // Sticker Pack State
  const [isGeneratingPack, setIsGeneratingPack] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  // The main sticker is the first one in the list (or the latest one if we tracked history differently, but for simplicity index 0 is active view)
  // For tweaking, we tweak the main sticker.
  const mainSticker = pack.stickers[0]; 
  const variations = pack.stickers.slice(1); // All except main

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = mainSticker.image;
    link.download = `sticker-main-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = async () => {
    try {
      const response = await fetch(mainSticker.image);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const response = await fetch(mainSticker.image);
        const blob = await response.blob();
        const file = new File([blob], 'sticker.png', { type: 'image/png' });
        await navigator.share({
          title: 'My Sticker',
          text: 'Check out my custom sticker made with Sticker Maker!',
          files: [file],
        });
      } catch (err) {
        console.error("Error sharing", err);
      }
    } else {
      handleDownload();
    }
  };

  const submitTweak = () => {
    if (!tweakInput.trim()) return;
    setIsTweaking(true);
    onTweak(tweakInput);
  };

  const handleGeneratePack = async () => {
    setIsGeneratingPack(true);
    try {
      const newVars = await generateStickerVariations(pack.sourceImage);
      onUpdatePack(newVars);
    } catch (e) {
      console.error(e);
      alert("Failed to generate pack. Please try again.");
    } finally {
      setIsGeneratingPack(false);
    }
  };

  const handleDownloadWebP = async (variation: StickerVariation) => {
    try {
      const webpBase64 = await convertToWhatsAppWebP(variation.image);
      const link = document.createElement('a');
      link.href = webpBase64;
      link.download = `${variation.emotion.toLowerCase()}_sticker.webp`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("WebP conversion failed", e);
      alert("Could not convert to WebP");
    }
  };

  const handleDownloadPackZip = async () => {
    setIsZipping(true);
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
      console.error("Failed to create zip", e);
      alert("Failed to create zip file");
    } finally {
      setIsZipping(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-36">
      <div className="relative flex items-center justify-center mb-4 min-h-[40px]">
        <button 
          onClick={onReset} 
          className="absolute left-0 top-1/2 -translate-y-1/2 p-2 -ml-2 text-gray-500 hover:text-primary transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold text-primary">Your Sticker</h2>
      </div>

      <div className="flex flex-col gap-4">
        {/* Result Card */}
        <div className="relative w-full aspect-square bg-gray-100 rounded-3xl shadow-xl border border-gray-200 overflow-hidden flex items-center justify-center p-6">
            <div className="absolute inset-0 z-0 opacity-40" 
                 style={{
                    backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                 }}>
            </div>
            
            <img
              src={mainSticker.image}
              alt="Generated Sticker"
              className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
            />
        </div>

        {/* Tweak Section */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-purple-100 space-y-3">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Wand2 size={18} className="text-secondary" />
            <h3>Tweak Design</h3>
          </div>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={tweakInput}
              onChange={(e) => setTweakInput(e.target.value)}
              placeholder="e.g., Make hair blue, add glasses..." 
              className="flex-1 bg-purple-50 border border-purple-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              onKeyDown={(e) => e.key === 'Enter' && submitTweak()}
            />
            <button 
              onClick={submitTweak}
              disabled={isTweaking || !tweakInput.trim()}
              className="bg-primary text-white px-4 rounded-xl font-bold text-sm disabled:opacity-50 hover:bg-violet-800"
            >
              {isTweaking ? '...' : 'Go'}
            </button>
          </div>
        </div>

        {/* Sticker Pack Generator Section */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-purple-100 space-y-4">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2 text-primary font-bold">
                <Layers size={18} className="text-secondary" />
                <h3>Sticker Pack</h3>
             </div>
             {variations.length === 0 && !isGeneratingPack && (
               <button 
                 onClick={handleGeneratePack}
                 className="flex items-center gap-1.5 text-xs bg-purple-100 text-primary px-3 py-1.5 rounded-lg font-semibold hover:bg-purple-200"
               >
                 <PackagePlus size={14} />
                 Generate Pack
               </button>
             )}
             {variations.length > 0 && (
                <button
                  onClick={handleDownloadPackZip}
                  disabled={isZipping}
                  className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg font-semibold hover:bg-green-100"
                >
                  {isZipping ? <Loader2 size={14} className="animate-spin"/> : <Download size={14} />}
                  Download Pack
                </button>
             )}
          </div>

          {isGeneratingPack && (
            <div className="py-8 flex flex-col items-center justify-center text-gray-400 gap-2">
               <Loader2 className="animate-spin text-secondary" size={24} />
               <p className="text-sm">Creating matching stickers...</p>
            </div>
          )}

          {!isGeneratingPack && variations.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
               {variations.map((v) => (
                 <div key={v.emotion} className="bg-purple-50 p-2 rounded-xl border border-purple-100 flex flex-col items-center gap-2">
                    <div className="relative w-full aspect-square bg-white rounded-lg overflow-hidden">
                       <img src={v.image} alt={v.emotion} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex w-full items-center justify-between px-1">
                       <span className="text-xs font-bold text-gray-600">{v.emotion}</span>
                       <button 
                         onClick={() => handleDownloadWebP(v)}
                         className="p-1.5 bg-green-500 text-white rounded-full hover:bg-green-600 shadow-sm"
                         title="Download WhatsApp Sticker"
                       >
                         <Download size={12} />
                       </button>
                    </div>
                 </div>
               ))}
            </div>
          )}
          
          {variations.length > 0 && (
             <p className="text-[10px] text-gray-400 text-center italic mt-2">
                Click download icons for WhatsApp-ready WebP files
             </p>
          )}
        </div>

        {/* Source Image (Small) */}
        <div className="flex items-center justify-between bg-white p-3 rounded-2xl shadow-sm border border-purple-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                 <img src={pack.sourceImage} alt="Source" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <p className="text-xs text-gray-500 font-medium">Original Source</p>
                <p className="text-[10px] text-green-600 font-semibold flex items-center gap-1">
                  <Check size={10} /> Auto-saved to My Stickers
                </p>
              </div>
            </div>
        </div>
      </div>

      {/* Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-lg border-t border-purple-100 z-40">
        <div className="max-w-md mx-auto grid grid-cols-5 gap-2">
          
          <button
            onClick={onReset}
            className="col-span-1 flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-purple-50 text-primary font-semibold active:scale-95 transition-transform"
            aria-label="Start Over"
          >
            <RefreshCw size={20} />
          </button>

          <button
            onClick={handleDownload}
            className="col-span-1 flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-purple-50 text-primary font-semibold active:scale-95 transition-transform"
            aria-label="Save to Photos"
          >
            <Download size={20} />
          </button>

          <button
            onClick={handleCopy}
            className="col-span-1 flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-purple-50 text-primary font-semibold active:scale-95 transition-transform"
            aria-label="Copy to Clipboard"
          >
            {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
          </button>
          
          <button
            onClick={handleShare}
            className="col-span-2 flex flex-row items-center justify-center gap-2 p-3 rounded-xl bg-primary text-white font-semibold shadow-lg shadow-primary/30 active:scale-95 transition-transform hover:bg-violet-800"
          >
            <Share2 size={20} />
            <span className="text-sm">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};
