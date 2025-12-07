import React, { useState, useRef, useEffect, MouseEvent, TouchEvent } from 'react';
import { GeneratedDesign, ViewState, TattooStyle } from '../types';
import { compositeTattooOnBody, generateTattooDesign, prepareImageForModel } from '../services/gemini';
import { Button } from './Button';

interface VirtualTryOnProps {
  designs: GeneratedDesign[];
  initialDesign?: GeneratedDesign;
  onNavigate: (view: ViewState) => void;
  onSaveToGallery: (design: GeneratedDesign) => void;
}

interface TransformState {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

const RESTYLE_OPTIONS = [
  TattooStyle.AMERICAN_TRADITIONAL,
  TattooStyle.REALISM_BW,
  TattooStyle.FINE_LINE,
  TattooStyle.JAPANESE,
  TattooStyle.NEW_SCHOOL,
  TattooStyle.TRIBAL,
];

export const VirtualTryOn: React.FC<VirtualTryOnProps> = ({ designs, initialDesign, onNavigate, onSaveToGallery }) => {
  const [selectedDesign, setSelectedDesign] = useState<GeneratedDesign | undefined>(initialDesign);
  const [bodyImage, setBodyImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRestyling, setIsRestyling] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  
  const [transform, setTransform] = useState<TransformState>({
    x: 0,
    y: 0,
    width: 150,
    height: 150,
    rotation: 0,
  });

  const [history, setHistory] = useState<TransformState[]>([transform]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const tattooInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const bodyImgRef = useRef<HTMLImageElement>(null);

  const dragRef = useRef<{
    active: boolean;
    type: 'move' | 'resize' | 'rotate';
    startX: number;
    startY: number;
    initialTransform: TransformState;
    centerX?: number;
    centerY?: number;
  }>({
    active: false,
    type: 'move',
    startX: 0,
    startY: 0,
    initialTransform: transform
  });

  const handleStart = (
    e: MouseEvent | TouchEvent, 
    type: 'move' | 'resize' | 'rotate'
  ) => {
    e.stopPropagation();
    // preventDefault helps stop scrolling on mobile while dragging
    if (e.cancelable && e.type === 'touchstart') e.preventDefault(); 
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const rect = containerRef.current?.getBoundingClientRect();
    const cx = rect ? rect.left + transform.x + transform.width / 2 : 0;
    const cy = rect ? rect.top + transform.y + transform.height / 2 : 0;

    dragRef.current = {
      active: true,
      type,
      startX: clientX,
      startY: clientY,
      initialTransform: { ...transform },
      centerX: cx,
      centerY: cy
    };

    document.addEventListener('mousemove', handleGlobalMove);
    document.addEventListener('mouseup', handleGlobalEnd);
    document.addEventListener('touchmove', handleGlobalMove, { passive: false });
    document.addEventListener('touchend', handleGlobalEnd);
  };

  const handleGlobalMove = (e: globalThis.MouseEvent | globalThis.TouchEvent) => {
    if (!dragRef.current.active) return;
    
    if (e.type === 'touchmove' && e.cancelable) e.preventDefault();

    const clientX = 'touches' in e ? (e as any).touches[0].clientX : (e as any).clientX;
    const clientY = 'touches' in e ? (e as any).touches[0].clientY : (e as any).clientY;
    
    const { startX, startY, initialTransform, centerX, centerY } = dragRef.current;
    const deltaX = clientX - startX;
    const deltaY = clientY - startY;

    if (dragRef.current.type === 'move') {
      setTransform(prev => ({
        ...prev,
        x: initialTransform.x + deltaX,
        y: initialTransform.y + deltaY
      }));
    } else if (dragRef.current.type === 'resize') {
      const newWidth = Math.max(20, initialTransform.width + deltaX);
      const ratio = initialTransform.height / initialTransform.width;
      const newHeight = newWidth * ratio;
      
      setTransform(prev => ({
        ...prev,
        width: newWidth,
        height: newHeight
      }));
    } else if (dragRef.current.type === 'rotate') {
      if (centerX !== undefined && centerY !== undefined) {
        const startAngle = Math.atan2(startY - centerY, startX - centerX);
        const currentAngle = Math.atan2(clientY - centerY, clientX - centerX);
        const deg = (currentAngle - startAngle) * (180 / Math.PI);
        
        setTransform(prev => ({
          ...prev,
          rotation: (initialTransform.rotation + deg) % 360
        }));
      }
    }
  };

  const handleGlobalEnd = () => {
    if (dragRef.current.active) {
      dragRef.current.active = false;
      document.removeEventListener('mousemove', handleGlobalMove);
      document.removeEventListener('mouseup', handleGlobalEnd);
      document.removeEventListener('touchmove', handleGlobalMove);
      document.removeEventListener('touchend', handleGlobalEnd);
      
      setTransform(current => {
          updateHistory(current);
          return current;
      });
    }
  };

  const updateHistory = (newState: TransformState) => {
    setHistory(prev => {
        const sliced = prev.slice(0, historyIndex + 1);
        return [...sliced, newState];
    });
    setHistoryIndex(prev => prev + 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setTransform(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setTransform(history[newIndex]);
    }
  };

  useEffect(() => {
    if (initialDesign) {
        setSelectedDesign(initialDesign);
    }
  }, [initialDesign]);

  // Handle aspect ratio preservation when placing a new design
  useEffect(() => {
    if (selectedDesign && containerRef.current) {
        const img = new Image();
        img.src = selectedDesign.imageUrl;
        img.onload = () => {
            const aspect = img.naturalWidth / img.naturalHeight;
            const baseSize = 200; // Starting size
            let w, h;
            
            // Calculate dimensions based on aspect ratio
            if (aspect >= 1) {
                w = baseSize;
                h = baseSize / aspect;
            } else {
                h = baseSize;
                w = baseSize * aspect;
            }

            // Center in container
            const { width: cWidth, height: cHeight } = containerRef.current!.getBoundingClientRect();
            
            const newTransform = {
                x: cWidth / 2 - w / 2,
                y: cHeight / 2 - h / 2,
                width: w,
                height: h,
                rotation: 0
            };

            setTransform(newTransform);
            setHistory([newTransform]);
            setHistoryIndex(0);
        };
    }
  }, [bodyImage, selectedDesign]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsImageLoading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
           const rawBase64 = reader.result as string;
           const { processedBase64 } = await prepareImageForModel(rawBase64);
           setBodyImage(processedBase64);
           setResultImage(null);
        } catch (e) {
           console.error("Image processing failed, falling back to raw", e);
           setBodyImage(reader.result as string);
        } finally {
           setIsImageLoading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTattooUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newDesign: GeneratedDesign = {
          id: `custom-upload-${Date.now()}`,
          prompt: 'Custom Upload',
          style: TattooStyle.CUSTOM,
          imageUrl: reader.result as string,
          createdAt: Date.now()
        };
        setSelectedDesign(newDesign);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRestyle = async (style: string) => {
    if (!selectedDesign) return;
    setIsRestyling(true);
    try {
        const newImageUrl = await generateTattooDesign(
            "Redesign this tattoo", 
            style, 
            selectedDesign.imageUrl
        );
        const newDesign: GeneratedDesign = {
            id: `restyle-${Date.now()}`,
            prompt: `Restyle: ${style}`,
            style: style,
            imageUrl: newImageUrl,
            createdAt: Date.now()
        };
        setSelectedDesign(newDesign);
        onSaveToGallery(newDesign); // Save to gallery so it's not lost
    } catch (e) {
        alert("Failed to restyle design.");
    } finally {
        setIsRestyling(false);
    }
  };

  const handleTryOn = async () => {
    if (!bodyImage || !selectedDesign || !bodyImgRef.current || !containerRef.current) return;

    setIsProcessing(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const bodyImg = new Image();
      const tattooImg = new Image();

      await new Promise((resolve) => { bodyImg.onload = resolve; bodyImg.src = bodyImage; });
      await new Promise((resolve) => { tattooImg.onload = resolve; tattooImg.src = selectedDesign.imageUrl; });

      // The canvas size must match the body image natural size 
      canvas.width = bodyImg.naturalWidth;
      canvas.height = bodyImg.naturalHeight;

      if (ctx) {
         ctx.drawImage(bodyImg, 0, 0);

         // CRITICAL: Calculate exact offset of the image within the container
         const containerRect = containerRef.current.getBoundingClientRect();
         const displayedRect = bodyImgRef.current.getBoundingClientRect();
         
         const offsetX = displayedRect.left - containerRect.left;
         const offsetY = displayedRect.top - containerRect.top;
         
         // Calculate scale ratio between displayed image size and actual natural size
         const scaleX = bodyImg.naturalWidth / displayedRect.width;
         const scaleY = bodyImg.naturalHeight / displayedRect.height;
         
         // Adjust transform coordinates: subtract visual offset, then scale to natural dimensions
         const relativeX = transform.x - offsetX;
         const relativeY = transform.y - offsetY;
         
         const tX = relativeX * scaleX;
         const tY = relativeY * scaleY;
         
         const tWidth = transform.width * scaleX;
         const tHeight = transform.height * scaleY;

         ctx.save();
         // Move to center of tattoo position
         ctx.translate(tX + tWidth / 2, tY + tHeight / 2);
         ctx.rotate((transform.rotation * Math.PI) / 180);
         
         // Aggressively boost brightness (220%) and saturation (200%) to prevent muddy colors when multiplying
         // This pre-compensates for the darkening effect of the Multiply blend mode on skin
         ctx.filter = 'brightness(2.2) contrast(1.1) saturate(2.0)';
         
         // Apply multiply blending to handle white backgrounds transparently
         ctx.globalCompositeOperation = 'multiply';
         
         // Draw centered at origin
         ctx.drawImage(tattooImg, -tWidth / 2, -tHeight / 2, tWidth, tHeight);
         ctx.restore();
      }

      const compositeBase64 = canvas.toDataURL('image/jpeg', 0.95);
      const refinedImage = await compositeTattooOnBody(compositeBase64);
      setResultImage(refinedImage);

    } catch (error) {
      console.error(error);
      alert("Failed to create preview. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToGallery = () => {
    if (resultImage) {
      onSaveToGallery({
        id: Date.now().toString(),
        prompt: `Try-On Result: ${selectedDesign?.prompt || 'Custom'}`,
        style: TattooStyle.CUSTOM, 
        imageUrl: resultImage,
        createdAt: Date.now()
      });
      alert("Saved to Gallery!");
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `inkling-tryon-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (!resultImage) return;
    try {
      const response = await fetch(resultImage);
      const blob = await response.blob();
      const file = new File([blob], 'inkling-tryon.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Inkling Tattoo Try-On',
          text: 'Check out this AI tattoo try-on I generated with Inkling!',
        });
      } else {
        alert("Sharing is not supported on this device/browser.");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  // Filter out previous try-on results to prevent recursion
  const selectableDesigns = designs.filter(d => !d.prompt.startsWith('Try-On Result:'));

  return (
    <div className="max-w-7xl mx-auto py-4 px-4 h-full flex flex-col">
       <div className="mb-2 shrink-0">
          <h2 className="text-xl font-display font-medium text-white/80">Virtual Studio</h2>
       </div>

       {/* Mobile Layout: Setup (order-1) First, Preview (order-2) Second */}
       <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 flex-1 min-h-0">
            
            {/* Left Sidebar: Controls - Order 1 on mobile to ensure it appears FIRST */}
            <div className="lg:col-span-1 bg-ink-800 rounded-2xl border border-ink-700 flex flex-col overflow-hidden order-1 lg:order-1 h-[400px] lg:h-full shrink-0">
                
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto min-h-0">
                    <div className="p-4 border-b border-ink-700">
                    <h2 className="text-lg font-display font-medium text-white mb-2">Setup</h2>
                    
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-2 border-2 border-dashed border-ink-600 rounded-xl p-3 hover:border-accent-500 hover:bg-ink-700/50 transition-all cursor-pointer text-center relative overflow-hidden group"
                    >
                        {bodyImage ? (
                        <div className="flex items-center gap-4">
                            <img src={bodyImage} alt="Thumbnail" className="w-12 h-12 object-cover rounded-lg" />
                            <span className="text-sm font-semibold text-white">Change Photo</span>
                        </div>
                        ) : (
                        <div className="flex flex-col items-center gap-1 py-2">
                            <svg className="w-6 h-6 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm text-gray-300 font-medium">Tap to Upload Photo</span>
                        </div>
                        )}
                        <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleFileChange}
                        />
                    </div>
                    </div>
                    
                    {/* Restyle Option for Custom Uploads */}
                    {selectedDesign?.style === TattooStyle.CUSTOM && (
                       <div className="p-4 border-b border-ink-700 bg-ink-900/50">
                          <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide flex items-center gap-2">
                             <svg className="w-4 h-4 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                             Restyle Design (AI)
                          </p>
                          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                             {RESTYLE_OPTIONS.map(style => (
                                <button
                                   key={style}
                                   onClick={() => handleRestyle(style)}
                                   disabled={isRestyling}
                                   className="px-3 py-1.5 bg-ink-700 hover:bg-accent-600 disabled:opacity-50 text-xs rounded-full whitespace-nowrap transition-colors border border-ink-600"
                                >
                                   {style}
                                </button>
                             ))}
                          </div>
                          {isRestyling && <p className="text-xs text-accent-400 mt-1 animate-pulse">Transforming design...</p>}
                       </div>
                    )}

                    <div className="p-4 border-b border-ink-700">
                        <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Select Design</p>
                        
                        <div className="grid grid-cols-4 lg:grid-cols-3 gap-2">
                             {/* Upload Design Button */}
                             <div 
                                onClick={() => tattooInputRef.current?.click()}
                                className="cursor-pointer rounded-lg border-2 border-dashed border-ink-600 hover:border-accent-500 hover:bg-ink-700/50 flex flex-col items-center justify-center aspect-square transition-colors gap-1 group relative overflow-hidden bg-ink-900/50"
                                title="Upload Custom Design"
                             >
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-accent-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                <span className="text-[10px] text-gray-400 font-medium uppercase group-hover:text-white text-center leading-none">Upload<br/>File</span>
                                <input 
                                    type="file" 
                                    ref={tattooInputRef} 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={handleTattooUpload}
                                />
                             </div>

                             {selectableDesigns.map((design) => (
                                <div 
                                key={design.id}
                                onClick={() => setSelectedDesign(design)}
                                className={`
                                    cursor-pointer rounded-lg p-0.5 border-2 transition-all relative aspect-square
                                    ${selectedDesign?.id === design.id 
                                    ? 'border-accent-500 bg-accent-500/10' 
                                    : 'border-transparent hover:bg-ink-700'}
                                `}
                                >
                                <img src={design.imageUrl} className="w-full h-full object-contain bg-white rounded-md" alt={design.prompt} />
                                </div>
                            ))}
                        </div>
                        
                        {selectableDesigns.length === 0 && (
                             <div className="mt-4 text-center">
                                 <p className="text-xs text-gray-500 mb-2">Or create one with AI</p>
                                 <Button onClick={() => onNavigate('generate')} variant="secondary" className="w-full text-xs py-2 h-8">
                                    Go to Generator
                                </Button>
                             </div>
                        )}
                    </div>

                    {selectedDesign && bodyImage && !resultImage && (
                        <div className="p-4 space-y-2">
                            <div className="flex justify-between items-center">
                                <p className="text-xs text-gray-400 uppercase tracking-wide">Adjust</p>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={handleUndo} 
                                        disabled={historyIndex <= 0}
                                        className="p-1.5 rounded-md hover:bg-ink-700 disabled:opacity-30 disabled:hover:bg-transparent text-gray-300"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                                    </button>
                                    <button 
                                        onClick={handleRedo} 
                                        disabled={historyIndex >= history.length - 1}
                                        className="p-1.5 rounded-md hover:bg-ink-700 disabled:opacity-30 disabled:hover:bg-transparent text-gray-300"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                <div className="p-4 border-t border-ink-700 bg-ink-800">
                <Button 
                    className="w-full h-12" 
                    disabled={!bodyImage || !selectedDesign}
                    onClick={handleTryOn}
                    isLoading={isProcessing}
                >
                    {isProcessing ? 'Rendering...' : 'Generate Preview'}
                </Button>
                </div>
            </div>

            {/* Right Area: Preview Canvas - Order 2 on mobile to appear below Setup */}
            <div className="lg:col-span-2 bg-black rounded-2xl flex items-center justify-center overflow-hidden border border-ink-800 relative order-2 lg:order-2 shrink-0 aspect-[4/5] lg:aspect-auto lg:h-full">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-ink-800/50 to-black z-0" />
                
                {resultImage ? (
                // Result State
                <div className="z-10 relative w-full h-full flex flex-col items-center justify-center">
                    <div className="absolute top-4 right-4 z-20 flex flex-wrap gap-2 justify-end px-4">
                        <Button variant="secondary" onClick={() => setResultImage(null)} className="!py-1 !px-3 text-sm bg-white/10 hover:bg-white/20 border-0 text-white backdrop-blur-md">
                        Back
                        </Button>
                        <Button variant="secondary" onClick={handleSaveToGallery} className="!py-1 !px-3 text-sm bg-white/10 hover:bg-white/20 border-0 text-white backdrop-blur-md">
                        Save
                        </Button>
                        <Button variant="secondary" onClick={handleShare} className="!py-1 !px-3 text-sm bg-white/10 hover:bg-white/20 border-0 text-white backdrop-blur-md">
                        Share
                        </Button>
                        <Button variant="primary" onClick={handleDownload} className="!py-1 !px-3 text-sm">
                            Download
                        </Button>
                    </div>
                    <img src={resultImage} alt="Try On Result" className="max-w-full max-h-full object-contain" />
                </div>
                ) : bodyImage ? (
                // Editing State
                <div className="z-10 relative w-full h-full flex items-center justify-center bg-black/50 overflow-hidden" ref={containerRef}>
                    <div className="relative inline-block w-full h-full flex items-center justify-center">
                        <img 
                            ref={bodyImgRef}
                            src={bodyImage} 
                            alt="Original Body" 
                            className="max-w-full max-h-full object-contain pointer-events-none select-none block"
                        />
                        
                        {selectedDesign && (
                            <div 
                                className="absolute cursor-move group touch-none mix-blend-multiply"
                                style={{
                                    top: transform.y,
                                    left: transform.x,
                                    width: transform.width,
                                    height: transform.height,
                                    transform: `rotate(${transform.rotation}deg)`,
                                }}
                                onMouseDown={(e) => handleStart(e, 'move')}
                                onTouchStart={(e) => handleStart(e, 'move')}
                            >
                                <img 
                                    src={selectedDesign.imageUrl} 
                                    alt="Tattoo Overlay" 
                                    // Aggressive visual boost for user preview to match canvas output
                                    className="w-full h-full select-none pointer-events-none filter brightness-200 contrast-110 saturate-200"
                                />
                                
                                <div className="absolute inset-0 border-2 border-accent-500/50 rounded-sm opacity-60 hover:opacity-100 transition-opacity mix-blend-normal">
                                    <div 
                                        className="absolute -top-8 left-1/2 -translate-x-1/2 w-8 h-8 bg-accent-500 rounded-full cursor-grab shadow-lg flex items-center justify-center z-50 hover:scale-110 transition-transform"
                                        onMouseDown={(e) => handleStart(e, 'rotate')}
                                        onTouchStart={(e) => handleStart(e, 'rotate')}
                                    >
                                        <svg className="w-5 h-5 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    </div>
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 h-8 w-0.5 bg-accent-500/50"></div>

                                    <div 
                                        className="absolute -bottom-3 -right-3 w-6 h-6 bg-white border-2 border-accent-500 rounded-full cursor-nwse-resize shadow-md hover:scale-110 transition-transform z-50"
                                        onMouseDown={(e) => handleStart(e, 'resize')}
                                        onTouchStart={(e) => handleStart(e, 'resize')}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {!selectedDesign && (
                        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-black/70 px-4 py-2 rounded-lg backdrop-blur-md border border-white/10 text-white/90 text-sm pointer-events-none whitespace-nowrap">
                            Select a design below
                        </div>
                    )}
                </div>
                ) : (
                <div className="z-10 text-center max-w-md p-8">
                    <div className="mb-6 inline-flex p-4 rounded-full bg-ink-800 border border-ink-700">
                    {isImageLoading ? (
                        <svg className="animate-spin w-8 h-8 text-accent-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    )}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Virtual Mirror</h3>
                    <p className="text-gray-500 text-sm">
                    Upload a photo to start.
                    </p>
                </div>
                )}
            </div>
       </div>
    </div>
  );
};