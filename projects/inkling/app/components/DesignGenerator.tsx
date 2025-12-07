
import React, { useState, useRef } from 'react';
import { TattooStyle, GeneratedDesign } from '../types';
import { generateTattooDesign, describeTattooImage } from '../services/gemini';
import { Button } from './Button';

interface DesignGeneratorProps {
  onDesignGenerated: (design: GeneratedDesign) => void;
  onViewGallery: () => void;
  onTryOn: (design: GeneratedDesign) => void;
}

// Concepts with added color descriptors to ensure vibrant results
const SURPRISE_PROMPTS = [
  "A majestic wolf head with glowing blue eyes",
  "A golden pocket watch with emerald gears",
  "A vibrant coral reef scene with tropical fish",
  "A psychedelic mushroom forest in neon colors",
  "A neon blue jellyfish glowing in the dark",
  "A phoenix rising in flames of orange, red and purple",
  "A dragon with iridescent scales coiling around a sword",
  "A vintage ship with deep red sails on a blue sea",
  "A peacock displaying colorful turquoise and purple feathers",
  "A tiger with burning bright orange fur and green eyes",
  "A heart glowing with radioactive green light",
  "A koi fish swimming in a splash of azure water",
  "A sun and moon with gold and silver details",
  "A colorful cosmic nebula shaped like a skull",
  "A skeleton wearing a royal purple velvet robe",
  "A raygun blasting bright pink energy",
  "A moth with wings looking like a stained glass window",
  "A bouquet of vibrant wildflowers and berries",
  "A panther with piercing emerald eyes",
  "A stained glass window pattern with ruby and sapphire shards",
  "A ship sailing on a sea of colorful stars",
  "A stack of colorful ancient spellbooks",
  "A three-eyed cat with galaxy-colored fur",
  "A medusa head with bright green snakes",
  "A hand holding a lightning bolt of pure yellow energy",
  "A iridescent stag beetle with metallic shell",
  "A melting clock with surreal pastel colors",
  "A diver meeting a giant red squid",
  "A UFO beaming up a cow with pink light",
  "A sacred heart burning with intense red fire",
  "A samurai helmet with gold and crimson accents",
  "A pair of red translucent dice showing snake eyes",
  "A spider web with rainbow dew drops",
  "A marble statue bust with gold kintsugi cracks",
  "An hourglass with flowing electric blue sand"
];

// Styles that usually involve vibrant color
const COLORED_STYLES = [
  TattooStyle.AMERICAN_TRADITIONAL,
  TattooStyle.JAPANESE,
  TattooStyle.NEO_TRADITIONAL,
  TattooStyle.NEW_SCHOOL,
  TattooStyle.REALISM_COLOR,
  TattooStyle.WATERCOLOR,
  TattooStyle.GLITCH,
  TattooStyle.EMBROIDERY,
  TattooStyle.CHROME,
  TattooStyle.BIOMECHANICAL,
  TattooStyle.CYBER_SIGILISM // Sometimes neon
];

const getStyleImage = (style: string) => {
  // Simulating thumbnails based on style names. 
  const encoded = encodeURIComponent(style);
  return `https://placehold.co/300x300/1e1e1e/e5e5e5/png?text=${encoded}&font=roboto`;
};

export const DesignGenerator: React.FC<DesignGeneratorProps> = ({ onDesignGenerated, onViewGallery, onTryOn }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyles, setSelectedStyles] = useState<TattooStyle[]>([]);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<GeneratedDesign | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage(reader.result as string);
        setSelectedStyles([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleStyle = (style: TattooStyle) => {
    if (referenceImage) return; 
    setSelectedStyles(prev => {
      if (prev.includes(style)) {
        return prev.filter(s => s !== style);
      } else {
        return [...prev, style];
      }
    });
  };

  const executeGeneration = async (styleParam: string) => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedResult(null);

    try {
      let finalStyleParam = styleParam;
      if (referenceImage) {
        finalStyleParam = "Custom Style based on Reference Image";
      } else if (!finalStyleParam) {
         finalStyleParam = "Appropriate Style for Concept"; 
      }

      const base64Image = await generateTattooDesign(prompt, finalStyleParam, referenceImage || undefined);
      
      const newDesign: GeneratedDesign = {
        id: Date.now().toString(),
        prompt,
        style: finalStyleParam || "AI Chosen",
        imageUrl: base64Image,
        createdAt: Date.now()
      };
      
      onDesignGenerated(newDesign);
      setGeneratedResult(newDesign);

    } catch (err: any) {
      setError(err.message || 'Failed to generate design. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = () => {
    const styleParam = selectedStyles.length > 0 ? selectedStyles.join(", ") : "";
    executeGeneration(styleParam);
  };

  const handleRegenerate = () => {
    if (referenceImage) {
      executeGeneration("Custom Style based on Reference Image");
      return;
    }

    // Pick a DIFFERENT style than currently selected
    const allStyles = Object.values(TattooStyle).filter(s => s !== TattooStyle.CUSTOM);
    const availableStyles = allStyles.filter(s => !selectedStyles.includes(s));
    
    // User requested colorful regenerations.
    // 80% chance to pick a colored style if available
    const availableColored = availableStyles.filter(s => COLORED_STYLES.includes(s));
    const availableOther = availableStyles.filter(s => !COLORED_STYLES.includes(s));

    let pickedStyle: TattooStyle;
    const roll = Math.random();

    if (roll < 0.8 && availableColored.length > 0) {
        pickedStyle = availableColored[Math.floor(Math.random() * availableColored.length)];
    } else if (availableOther.length > 0) {
        pickedStyle = availableOther[Math.floor(Math.random() * availableOther.length)];
    } else {
        // Fallback to random colored style if constraints fail
        pickedStyle = COLORED_STYLES[Math.floor(Math.random() * COLORED_STYLES.length)];
    }

    setSelectedStyles([pickedStyle]);
    executeGeneration(pickedStyle);
  };

  const handleSurpriseMe = async () => {
    if (referenceImage) {
      setIsAnalyzing(true);
      try {
        const desc = await describeTattooImage(referenceImage);
        setPrompt(desc);
        setSelectedStyles([]); 
      } catch (err) {
        setPrompt("A unique tattoo design based on the reference image.");
      } finally {
        setIsAnalyzing(false);
      }
      return;
    }

    // 1. Pick a pure concept (now with more color descriptors)
    const randomPrompt = SURPRISE_PROMPTS[Math.floor(Math.random() * SURPRISE_PROMPTS.length)];
    setPrompt(randomPrompt);

    // 2. Pick a random style, leaning towards colored designs (70% chance)
    const allStyles = Object.values(TattooStyle).filter(s => s !== TattooStyle.CUSTOM);
    const otherStyles = allStyles.filter(s => !COLORED_STYLES.includes(s));
    
    let pickedStyle: TattooStyle;
    const roll = Math.random();

    if (roll < 0.7 && COLORED_STYLES.length > 0) {
      pickedStyle = COLORED_STYLES[Math.floor(Math.random() * COLORED_STYLES.length)];
    } else {
      pickedStyle = otherStyles[Math.floor(Math.random() * otherStyles.length)];
    }

    setSelectedStyles([pickedStyle]);
  };

  if (generatedResult) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 animate-fade-in">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-display font-bold text-white mb-2">Design Ready</h2>
          <p className="text-gray-400">What would you like to do next?</p>
        </div>

        <div className="bg-ink-800 rounded-2xl p-6 border border-ink-700 shadow-2xl flex flex-col items-center">
           <div className="w-64 h-64 bg-white rounded-lg mb-8 p-2 flex items-center justify-center">
             <img src={generatedResult.imageUrl} alt="Result" className="max-w-full max-h-full object-contain" />
           </div>

           <div className="flex flex-wrap gap-4 justify-center w-full">
              <Button 
                onClick={handleRegenerate} 
                variant="secondary"
                isLoading={isGenerating}
                className="flex-1 min-w-[150px]"
                title="Generate again with a colorful style"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Regenerate ({selectedStyles[0] || 'New Style'})
              </Button>
              <Button 
                onClick={() => onTryOn(generatedResult)} 
                variant="primary"
                className="flex-1 min-w-[150px]"
              >
                Try On Now
              </Button>
           </div>
           
           <div className="mt-4 pt-4 border-t border-ink-700 w-full flex justify-center">
             <button 
               onClick={() => setGeneratedResult(null)}
               className="text-sm text-gray-400 hover:text-white underline mr-6"
             >
               Start New Design
             </button>
             <button 
               onClick={onViewGallery}
               className="text-sm text-gray-400 hover:text-white underline"
             >
               Go to Gallery
             </button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 animate-fade-in">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-5xl font-display font-bold mb-4 text-white">
          Dream It. Ink It.
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Describe your idea, choose an art style, and let AI craft your perfect custom tattoo design.
        </p>
      </div>

      <div className="bg-ink-800/50 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-ink-700 shadow-2xl">
        {/* Prompt Input Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-semibold text-gray-200 uppercase tracking-wider">
              Concept
            </label>
            <button 
              onClick={handleSurpriseMe}
              disabled={isAnalyzing}
              className="text-xs text-accent-500 hover:text-accent-400 font-bold flex items-center gap-1 transition-colors disabled:opacity-50 uppercase tracking-wide"
            >
              {isAnalyzing ? (
                 <>Analyzing...</>
              ) : (
                 <>
                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                   {referenceImage ? 'Surprise Me (From Ref)' : 'Surprise Me'}
                 </>
              )}
            </button>
          </div>
          <div className="relative">
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A roaring lion surrounded by roses, clock face in background..."
                className="w-full bg-ink-900/80 border border-ink-600 rounded-xl p-4 text-white placeholder-gray-600 focus:ring-2 focus:ring-accent-500 focus:border-transparent outline-none resize-none h-32 transition-all font-sans text-lg"
            />
          </div>
        </div>

        {/* Reference Upload */}
        <div className="mb-8">
           <label className="block text-sm font-semibold text-gray-200 uppercase tracking-wider mb-3">
            Reference (Optional)
          </label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`flex items-center gap-4 p-4 rounded-xl border border-dashed transition-all cursor-pointer group
                ${referenceImage 
                  ? 'border-accent-500 bg-accent-500/10' 
                  : 'border-ink-600 hover:bg-ink-700/50 hover:border-gray-500'
                }
            `}
          >
             <div className="w-14 h-14 bg-ink-900 rounded-lg flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                {referenceImage ? (
                  <img src={referenceImage} alt="Ref" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-6 h-6 text-gray-500 group-hover:text-gray-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
             </div>
             <div className="flex-1">
                <span className={`text-sm font-medium ${referenceImage ? 'text-accent-200' : 'text-gray-400 group-hover:text-gray-200'}`}>
                  {referenceImage ? 'Style locked to reference image' : 'Upload a sketch or style reference'}
                </span>
                {referenceImage && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setReferenceImage(null); }}
                    className="ml-3 text-xs text-red-400 hover:text-red-300 underline"
                  >
                    Remove
                  </button>
                )}
             </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            hidden 
            accept="image/*" 
            onChange={handleFileChange}
          />
        </div>

        {/* Style Selection Carousel */}
        <div className={`mb-10 transition-opacity duration-300 ${referenceImage ? 'opacity-40 pointer-events-none grayscale' : 'opacity-100'}`}>
          <div className="flex justify-between items-end mb-4">
             <label className="block text-sm font-semibold text-gray-200 uppercase tracking-wider">
                Art Style
             </label>
             {selectedStyles.length > 0 && (
               <span className="text-xs font-bold text-accent-500 bg-accent-500/10 px-2 py-1 rounded">
                 {selectedStyles.join(", ")}
               </span>
             )}
          </div>
          
          <div className="flex overflow-x-auto pb-6 gap-4 snap-x scrollbar-hide -mx-2 px-2">
            {Object.values(TattooStyle)
              .filter(style => style !== TattooStyle.CUSTOM)
              .map((style) => {
                const isSelected = selectedStyles.includes(style);
                return (
                  <div
                    key={style}
                    onClick={() => toggleStyle(style)}
                    className={`
                      flex-shrink-0 w-36 cursor-pointer group relative
                      rounded-xl overflow-hidden border-2 transition-all snap-start shadow-lg
                      ${isSelected 
                        ? 'border-accent-500 ring-2 ring-accent-500/30 scale-105 z-10' 
                        : 'border-ink-800 hover:border-gray-500 hover:scale-[1.02]'}
                    `}
                  >
                    <div className="aspect-[4/5] bg-ink-900 relative">
                       <img 
                        src={getStyleImage(style)} 
                        alt={style}
                        loading="lazy"
                        className={`w-full h-full object-cover transition-all duration-300
                          ${isSelected ? 'opacity-100 blur-0' : 'opacity-60 blur-[1px] group-hover:blur-0 group-hover:opacity-90'}
                        `} 
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                       
                       {isSelected && (
                         <div className="absolute top-2 right-2 w-6 h-6 bg-accent-500 rounded-full flex items-center justify-center shadow-lg animate-bounce-short">
                           <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                         </div>
                       )}
                       
                       <div className="absolute bottom-0 left-0 w-full p-3 text-center">
                          <span className={`text-xs font-bold uppercase leading-tight tracking-wide block
                            ${isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'}
                          `}>
                            {style}
                          </span>
                       </div>
                    </div>
                  </div>
                );
            })}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-xl text-red-200 text-sm flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}

        <Button 
          onClick={handleGenerate} 
          isLoading={isGenerating} 
          disabled={!prompt.trim()}
          className="w-full text-lg h-16 rounded-xl font-bold tracking-wide shadow-xl shadow-accent-600/20"
        >
          {isGenerating ? 'Designing...' : 'GENERATE TATTOO'}
        </Button>
      </div>
    </div>
  );
};
