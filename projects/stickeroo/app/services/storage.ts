
import { StickerPack, StickerVariation } from '../types';

const STORAGE_KEY = 'sticker_maker_packs_v2';
const MAX_PACKS = 8; // Reduce item count as packs are larger

export const getPacks = (): StickerPack[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to load history", e);
    return [];
  }
};

export const savePack = (pack: StickerPack): StickerPack[] | null => {
  try {
    const current = getPacks();
    const updated = [pack, ...current].slice(0, MAX_PACKS); // Add to beginning and trim
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Failed to save pack (quota likely exceeded)", e);
    return null;
  }
};

export const updateMainStickerInPack = (packId: string, newMainStickerImage: string): StickerPack[] | null => {
  try {
    const current = getPacks();
    const packIndex = current.findIndex(p => p.id === packId);
    if (packIndex > -1) {
      // Create a new pack object to avoid mutation
      const updatedPack = {
        ...current[packIndex],
        stickers: [...current[packIndex].stickers] // shallow copy stickers array
      };
      
      // Replace the main sticker
      updatedPack.stickers[0] = { emotion: 'Main', image: newMainStickerImage };
      updatedPack.timestamp = Date.now(); // Update timestamp

      // Replace the old pack with the updated one
      current[packIndex] = updatedPack;

      // Sort to bring the updated pack to the front
      current.sort((a, b) => b.timestamp - a.timestamp);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      return current;
    }
    return current; // Return original list if not found
  } catch (e) {
    console.error("Failed to update main sticker", e);
    return null;
  }
}

export const updatePack = (id: string, newVariations: StickerVariation[]) => {
  try {
    const current = getPacks();
    const packIndex = current.findIndex(p => p.id === id);
    if (packIndex >= 0) {
      // Merge new variations avoiding duplicates by emotion
      const existingVars = current[packIndex].stickers;
      const mergedVars = [...existingVars];
      
      newVariations.forEach(nv => {
        if (!mergedVars.some(ev => ev.emotion === nv.emotion)) {
          mergedVars.push(nv);
        }
      });
      
      current[packIndex].stickers = mergedVars;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      return current;
    }
    return current;
  } catch (e) {
    console.error("Failed to update pack", e);
    return getPacks();
  }
}

export const deletePack = (id: string): StickerPack[] => {
  try {
    const current = getPacks();
    const updated = current.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    return [];
  }
};
