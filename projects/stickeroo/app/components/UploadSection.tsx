import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon } from 'lucide-react';
import { fileToBase64, resizeImage } from '../utils/imageUtils';
import { logoSrc } from '../assets/logo';

interface UploadSectionProps {
  onImageSelected: (base64: string) => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({ onImageSelected }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64 = await fileToBase64(e.target.files[0]);
        // Resize to avoid huge payloads
        const resized = await resizeImage(base64, 1024);
        onImageSelected(resized);
      } catch (err) {
        console.error("Error reading file", err);
        alert("Failed to read file");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-start pt-0 min-h-[60vh] gap-8 animate-fade-in-up">
      <div className="text-center space-y-4 max-w-xs">
        <div className="relative mx-auto w-56 h-56 flex items-center justify-center">
            <img 
              src={logoSrc} 
              alt="Mascot" 
              className="w-full h-full object-contain"
            />
        </div>
        <div className="space-y-2 py-2">
          <h1 className="text-4xl font-black text-primary tracking-tight leading-tight">
            <span className="block">Create</span>
            <span className="text-secondary">3d Stickers</span>
          </h1>
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={() => cameraInputRef.current?.click()}
          className="group relative w-full flex items-center justify-center gap-3 bg-primary text-white p-4 rounded-2xl shadow-xl shadow-purple-200 hover:shadow-2xl transition-all active:scale-95 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Camera className="relative z-10 w-6 h-6" />
          <span className="relative z-10 font-bold text-lg">Take a Photo</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-3 bg-white text-primary border-2 border-purple-100 p-4 rounded-2xl hover:bg-purple-50 transition-all active:scale-95"
        >
          <ImageIcon className="w-6 h-6 text-secondary" />
          <span className="font-bold text-lg">Upload</span>
        </button>
      </div>

      {/* Hidden Inputs */}
      <input
        type="file"
        accept="image/*"
        capture="user"
        ref={cameraInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};