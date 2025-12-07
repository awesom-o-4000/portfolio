import React, { useState, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { Feed } from './components/Feed';
import { Profile } from './components/Profile';
import { Jobs } from './components/Jobs';
import { CreatorsList } from './components/CreatorsList';
import { Community } from './components/Community';
import { SearchView } from './components/SearchView';
import { HireModal } from './components/HireModal';
import { ArtworkDetail } from './components/ArtworkDetail';
import { CreateProfile } from './components/CreateProfile';
import { CREATORS, ARTWORKS } from './constants';
import { ViewType } from './types';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('feed');
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null);
  const [selectedArtworkId, setSelectedArtworkId] = useState<string | null>(null);
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);

  // Derived state
  const selectedCreator = useMemo(() => 
    CREATORS.find(c => c.id === selectedCreatorId), 
  [selectedCreatorId]);

  const selectedArtwork = useMemo(() => 
    ARTWORKS.find(a => a.id === selectedArtworkId),
  [selectedArtworkId]);

  const creatorArtworks = useMemo(() => 
    selectedCreatorId ? ARTWORKS.filter(a => a.creatorId === selectedCreatorId) : [], 
  [selectedCreatorId]);

  // Derived creator for the artwork view (if artwork is selected)
  const artworkCreator = useMemo(() => 
    selectedArtwork ? CREATORS.find(c => c.id === selectedArtwork.creatorId) : null,
  [selectedArtwork]);

  // Handlers
  const handleSelectCreator = (id: string) => {
    setSelectedCreatorId(id);
    setCurrentView('profile');
    window.scrollTo(0,0);
  };

  const handleSelectArtwork = (id: string) => {
    setSelectedArtworkId(id);
    setCurrentView('artwork');
    window.scrollTo(0,0);
  }

  const handleProfileClick = () => {
    // Default to the first creator if no specific creator is selected, or pretend it's the current user
    if (!selectedCreatorId) {
        setSelectedCreatorId('c1'); 
    }
    setCurrentView('profile');
    window.scrollTo(0, 0);
  };

  const handleBackToFeed = () => {
    setCurrentView('feed');
  };

  const handleBackFromArtwork = () => {
    // If we came from a profile, go back to profile, otherwise feed
    // Simple heuristic: if we have a selectedCreatorId and it matches, go back there
    if (selectedCreatorId) {
        setCurrentView('profile');
    } else {
        setCurrentView('feed');
    }
  }

  const handleOpenHire = () => {
    setIsHireModalOpen(true);
  };

  const handleCloseHire = () => {
    setIsHireModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-gray-100 font-sans selection:bg-primary/30 selection:text-white">
      <Navbar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        onProfileClick={handleProfileClick}
      />

      <main className="relative">
        {currentView === 'feed' && (
          <div className="animate-in fade-in">
            <Feed 
              artworks={ARTWORKS} 
              creators={CREATORS} 
              onSelectCreator={handleSelectCreator} 
              onSelectArtwork={handleSelectArtwork}
            />
          </div>
        )}

        {currentView === 'search' && (
          <div className="animate-in fade-in">
             <SearchView />
          </div>
        )}

        {currentView === 'jobs' && (
          <div className="animate-in fade-in">
            <Jobs />
          </div>
        )}

        {currentView === 'creators' && (
          <div className="animate-in fade-in">
             <CreatorsList creators={CREATORS} onSelectCreator={handleSelectCreator} />
          </div>
        )}

        {currentView === 'community' && (
          <div className="animate-in fade-in">
            <Community />
          </div>
        )}

        {currentView === 'create-profile' && (
          <div className="animate-in fade-in">
            <CreateProfile />
          </div>
        )}

        {currentView === 'profile' && selectedCreator && (
          <div className="animate-in slide-in-from-right-10">
            <Profile 
              creator={selectedCreator} 
              artworks={creatorArtworks}
              onBack={handleBackToFeed}
              onHire={handleOpenHire}
              onSelectArtwork={handleSelectArtwork}
            />
          </div>
        )}

        {currentView === 'artwork' && selectedArtwork && artworkCreator && (
          <div className="animate-in zoom-in">
            <ArtworkDetail 
               artwork={selectedArtwork}
               creator={artworkCreator}
               onBack={handleBackFromArtwork}
               onSelectCreator={handleSelectCreator}
            />
          </div>
        )}
      </main>

      {selectedCreator && (
        <HireModal 
          isOpen={isHireModalOpen} 
          onClose={handleCloseHire} 
          creator={selectedCreator}
        />
      )}
    </div>
  );
}

export default App;