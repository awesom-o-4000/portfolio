
import JSZip from 'jszip';
import { StickerVariation } from '../types';

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
};

export const resizeImage = (base64Str: string, maxWidth = 1024, format: 'jpeg' | 'png' = 'jpeg'): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height *= maxWidth / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
        const quality = format === 'png' ? 1.0 : 0.85;
        resolve(canvas.toDataURL(mimeType, quality));
      } else {
        resolve(base64Str); // Fallback
      }
    };
    img.onerror = () => resolve(base64Str);
  });
};

export const removeWhiteBackground = (base64Str: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(base64Str);
        return;
      }

      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const width = canvas.width;
      const height = canvas.height;

      // Flood Fill Algorithm:
      // Start from corners and only remove white pixels connected to the outside.
      // This preserves white pixels inside the character (eyes, teeth, highlights).
      
      // Increased threshold to 60 to eat up floor shadows/reflections in glossy 3D renders
      const threshold = 60; 
      
      const isBackground = (r: number, g: number, b: number) => {
        return r > (255 - threshold) && 
               g > (255 - threshold) && 
               b > (255 - threshold);
      };

      // Stack for DFS (Iterative to avoid recursion limit)
      const stack: [number, number][] = [];
      
      // Start checking from 4 corners
      const startPoints = [[0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1]];
      
      for (const p of startPoints) {
        const idx = (p[1] * width + p[0]) * 4;
        // If corner is white, it's background, start filling
        if (data[idx+3] !== 0 && isBackground(data[idx], data[idx+1], data[idx+2])) {
           stack.push([p[0], p[1]]);
        }
      }

      // We use the Alpha channel itself as the "visited" map. 
      // If Alpha is 0, it's already visited/removed.

      while (stack.length > 0) {
        const [cx, cy] = stack.pop()!;
        const pixelIdx = (cy * width + cx) * 4;

        if (data[pixelIdx + 3] === 0) continue; // Already processed

        // Remove pixel
        data[pixelIdx + 3] = 0;

        // Check neighbors
        const neighbors = [
          [cx + 1, cy], [cx - 1, cy], 
          [cx, cy + 1], [cx, cy - 1]
        ];

        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const nIdx = (ny * width + nx) * 4;
            // If neighbor is not transparent AND is considered white background
            if (data[nIdx + 3] !== 0) {
               if (isBackground(data[nIdx], data[nIdx + 1], data[nIdx + 2])) {
                 stack.push([nx, ny]);
               }
            }
          }
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(base64Str);
  });
};

export const centerAndMaximizeSticker = (base64Str: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(base64Str);
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;
      let found = false;

      // Scan for non-transparent pixels
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const alpha = data[(y * canvas.width + x) * 4 + 3];
          // Increased threshold to 50 to ignore faint halos/shadows when centering
          if (alpha > 50) { 
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
            found = true;
          }
        }
      }

      if (!found) {
        resolve(base64Str); // Return original if empty
        return;
      }

      // Calculate dimensions of the actual content
      const contentWidth = maxX - minX;
      const contentHeight = maxY - minY;
      
      // We want a square output that tightly fits the content with a small padding
      const maxDim = Math.max(contentWidth, contentHeight);
      const padding = Math.floor(maxDim * 0.05);
      const targetSize = maxDim + (padding * 2);

      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = targetSize;
      finalCanvas.height = targetSize;
      const finalCtx = finalCanvas.getContext('2d');
      
      if (finalCtx) {
        const destX = (targetSize - contentWidth) / 2;
        const destY = (targetSize - contentHeight) / 2;
        
        finalCtx.drawImage(
          canvas, 
          minX, minY, contentWidth, contentHeight, 
          destX, destY, contentWidth, contentHeight
        );
        resolve(finalCanvas.toDataURL('image/png'));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => resolve(base64Str);
  });
};

/**
 * Converts an image to WhatsApp-compatible WebP format:
 * - Exactly 512x512 pixels
 * - < 100 KB file size
 * - WebP format
 * - Aspect Ratio preserved (contain)
 */
export const convertToWhatsAppWebP = (base64Str: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // Calculate dimensions to FIT inside 512x512 (contain)
      const scale = Math.min(512 / img.width, 512 / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      const x = (512 - w) / 2;
      const y = (512 - h) / 2;

      // Draw image scaled to 512x512 transparent canvas
      ctx.clearRect(0, 0, 512, 512);
      ctx.drawImage(img, x, y, w, h);

      // Recursive function to reduce quality until size is < 100KB
      const optimizeSize = (quality: number) => {
        const webpDataUrl = canvas.toDataURL('image/webp', quality);
        
        // Estimate size in bytes (base64 length * 0.75)
        const base64Content = webpDataUrl.split(',')[1];
        const sizeInBytes = Math.ceil(base64Content.length * 0.75);
        
        // WhatsApp requires strict < 100KB
        if (sizeInBytes < 100 * 1024 || quality <= 0.1) {
          resolve(webpDataUrl);
        } else {
          // Reduce quality and try again
          optimizeSize(quality - 0.1);
        }
      };
      
      optimizeSize(0.9); // Start with 90% quality
    };
    img.onerror = (e) => reject(e);
  });
};

export const createStickerPackZip = async (stickers: StickerVariation[]): Promise<Blob> => {
  const zip = new JSZip();
  // Standard naming often used by importers
  const folder = zip.folder("sticker_pack");

  for (let i = 0; i < stickers.length; i++) {
    const sticker = stickers[i];
    try {
      // Ensure strict WhatsApp format
      const webpBase64 = await convertToWhatsAppWebP(sticker.image);
      const base64Data = webpBase64.split(',')[1];
      
      // Filename: 01_happy.webp, 02_love.webp, etc.
      const filename = `${String(i + 1).padStart(2, '0')}_${sticker.emotion.toLowerCase().replace(/[^a-z0-9]/g, '_')}.webp`;
      folder?.file(filename, base64Data, { base64: true });
    } catch (e) {
      console.error(`Skipping sticker ${sticker.emotion} due to conversion error`, e);
    }
  }

  return await zip.generateAsync({ type: "blob" });
};
