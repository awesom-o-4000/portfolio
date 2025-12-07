import React, { useState, useEffect } from 'react';
import { AppStep, StickerPack, StickerVariation } from './types';
import { Header } from './components/Header';
import { UploadSection } from './components/UploadSection';
import { ProcessingView } from './components/ProcessingView';
import { ResultView } from './components/ResultView';
import { Gallery } from './components/Gallery';
import { generate3DSticker, tweakSticker } from './services/gemini';
import { savePack, getPacks, deletePack, updatePack, updateMainStickerInPack } from './services/storage';
import { AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);
  
  // Current active pack being edited/viewed
  const [currentPack, setCurrentPack] = useState<StickerPack | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [packs, setPacks] = useState<StickerPack[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Dummy login state

  useEffect(() => {
    setPacks(getPacks());
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setStep(AppStep.GALLERY);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setStep(AppStep.UPLOAD);
  };

  const saveNewPack = (source: string, generated: string) => {
    const newPack: StickerPack = {
      id: Date.now().toString(),
      sourceImage: source,
      timestamp: Date.now(),
      stickers: [{ emotion: 'Main', image: generated }]
    };
    const updatedPacks = savePack(newPack);
    if (updatedPacks) {
      setPacks(updatedPacks);
      setCurrentPack(newPack);
    }
  };

  const handleUpdatePack = (variations: StickerVariation[]) => {
    if (!currentPack) return;
    const updatedList = updatePack(currentPack.id, variations);
    setPacks(updatedList);
    // Update current view
    const updatedPack = updatedList.find(p => p.id === currentPack.id);
    if (updatedPack) setCurrentPack(updatedPack);
  };

  const handleImageSelected = async (base64: string) => {
    setStep(AppStep.PROCESSING);
    setError(null);

    try {
      const result = await generate3DSticker(base64);
      saveNewPack(base64, result);
      setStep(AppStep.RESULT);
    } catch (err: any) {
      console.error(err);
      setError("We couldn't generate the sticker right now. Please try a different photo or check your connection.");
      setStep(AppStep.ERROR);
    }
  };

  const handleTweak = async (instruction: string) => {
    if (!currentPack) return;
    const previousImage = currentPack.stickers[0].image;
    setStep(AppStep.PROCESSING);
    
    try {
      const result = await tweakSticker(previousImage, instruction);
      const updatedPacks = updateMainStickerInPack(currentPack.id, result);

      if (updatedPacks) {
        setPacks(updatedPacks);
        const updatedCurrentPack = updatedPacks.find(p => p.id === currentPack.id);
        setCurrentPack(updatedCurrentPack || null);
      } else {
        throw new Error("Storage update failed during tweak.");
      }
      setStep(AppStep.RESULT);
    } catch (err: any) {
      console.error(err);
      setError("Failed to tweak the sticker. Returning to previous version.");
      setStep(AppStep.RESULT);
    }
  };

  const handleDeleteFromGallery = (id: string) => {
    const updated = deletePack(id);
    setPacks(updated);
    if (currentPack?.id === id) {
      setCurrentPack(null);
      setStep(AppStep.GALLERY); // fallback
    }
  };

  const handleSelectFromGallery = (pack: StickerPack) => {
    setCurrentPack(pack);
    setStep(AppStep.RESULT);
  };

  const handleReset = () => {
    setStep(AppStep.UPLOAD);
    setCurrentPack(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-violet-50 text-gray-900 pb-10 font-sans selection:bg-pink-200">
      <Header 
        isLoggedIn={isLoggedIn}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
      
      <main className="max-w-md mx-auto px-4 pb-4">
        
        {step === AppStep.UPLOAD && (
          <UploadSection onImageSelected={handleImageSelected} />
        )}

        {step === AppStep.PROCESSING && (
           <ProcessingView />
        )}

        {step === AppStep.RESULT && currentPack && (
          <ResultView 
            pack={currentPack}
            onReset={handleReset}
            onTweak={handleTweak}
            onUpdatePack={handleUpdatePack}
          />
        )}

        {step === AppStep.GALLERY && (
          <Gallery 
            items={packs}
            onSelect={handleSelectFromGallery}
            onDelete={handleDeleteFromGallery}
            onBack={() => {
              if (currentPack) setStep(AppStep.RESULT);
              else setStep(AppStep.UPLOAD);
            }}
          />
        )}

        {step === AppStep.ERROR && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 text-center animate-fade-in">
             <div className="bg-red-100 p-6 rounded-full">
                <AlertCircle className="w-12 h-12 text-red-500" />
             </div>
             <div className="space-y-2">
               <h3 className="text-xl font-bold text-gray-900">Oops!</h3>
               <p className="text-gray-600 max-w-xs mx-auto">{error}</p>
             </div>
             <button 
               onClick={handleReset}
               className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
             >
               Try Again
             </button>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;