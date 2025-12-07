import React, { useState } from 'react';
import { Header } from './components/Header';
import { DesignGenerator } from './components/DesignGenerator';
import { Gallery } from './components/Gallery';
import { VirtualTryOn } from './components/VirtualTryOn';
import { ViewState, GeneratedDesign, TattooStyle } from './types';

const App: React.FC = () => {
  // No API key state needed for Flash models as they use the system environment key
  const [currentView, setCurrentView] = useState<ViewState>('generate');
  const [designs, setDesigns] = useState<GeneratedDesign[]>([]);
  const [selectedForTryOn, setSelectedForTryOn] = useState<GeneratedDesign | undefined>(undefined);

  const handleDesignGenerated = (design: GeneratedDesign) => {
    setDesigns(prev => [design, ...prev]);
  };

  const handleSelectForTryOn = (design: GeneratedDesign) => {
    setSelectedForTryOn(design);
    setCurrentView('try-on');
  };

  const handleDeleteDesign = (id: string) => {
    setDesigns(prev => prev.filter(d => d.id !== id));
  };

  const handleUploadDesign = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const newDesign: GeneratedDesign = {
          id: Date.now().toString(),
          prompt: 'Custom Upload',
          style: TattooStyle.CUSTOM,
          imageUrl: reader.result,
          createdAt: Date.now()
        };
        setDesigns(prev => [newDesign, ...prev]);
        setCurrentView('gallery');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-dvh bg-ink-950 text-gray-100 flex flex-col">
      <Header currentView={currentView} onNavigate={setCurrentView} />
      
      {/* pt-16 ensures content is not hidden behind the fixed/sticky header */}
      <main className="flex-1 relative pt-16 flex flex-col">
        {/* Background Ambient Glow */}
        <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-accent-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className={currentView === 'generate' ? 'block' : 'hidden'}>
          <DesignGenerator 
            onDesignGenerated={handleDesignGenerated} 
            onViewGallery={() => setCurrentView('gallery')}
            onTryOn={(design) => handleSelectForTryOn(design)}
          />
        </div>

        <div className={currentView === 'gallery' ? 'block' : 'hidden'}>
          <Gallery 
            designs={designs} 
            onSelectForTryOn={handleSelectForTryOn}
            onDelete={handleDeleteDesign}
            onUpload={handleUploadDesign}
          />
        </div>

        <div className={currentView === 'try-on' ? 'block flex-1 h-full' : 'hidden'}>
          <VirtualTryOn 
            designs={designs} 
            initialDesign={selectedForTryOn} 
            onNavigate={setCurrentView}
            onSaveToGallery={handleDesignGenerated}
          />
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-gray-600 border-t border-ink-900 bg-ink-950 mt-auto">
        <p>Powered by Google Gemini 2.5 Flash Image</p>
      </footer>
    </div>
  );
};

export default App;