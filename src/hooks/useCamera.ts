import React, { useState } from 'react';

export interface CapturedImage {
  base64String?: string;
  dataUrl?: string;
  webPath?: string;
  format?: string;
}

/**
 * Comprime y redimensiona la imagen de forma segura para no saturar memoria en móviles.
 */
function compressImage(file: File, maxWidth = 1600, maxHeight = 1600, quality = 0.85): Promise<CapturedImage> {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Error al leer el archivo seleccionado'));
      reader.onload = () => {
        try {
          const img = new Image();
          img.onerror = () => reject(new Error('Error al cargar la imagen'));
          img.onload = () => {
            try {
              let width = img.width;
              let height = img.height;

              if (width > maxWidth || height > maxHeight) {
                if (width > height) {
                  height = Math.round((height * maxWidth) / width);
                  width = maxWidth;
                } else {
                  width = Math.round((width * maxHeight) / height);
                  height = maxHeight;
                }
              }

              const canvas = document.createElement('canvas');
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              if (!ctx) {
                const rawDataUrl = reader.result as string;
                resolve({
                  dataUrl: rawDataUrl,
                  base64String: rawDataUrl.split(',')[1],
                  format: file.type.split('/')[1] || 'jpeg',
                });
                return;
              }

              ctx.drawImage(img, 0, 0, width, height);
              const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
              const base64String = compressedDataUrl.split(',')[1];

              resolve({
                dataUrl: compressedDataUrl,
                base64String,
                format: 'jpeg',
              });
            } catch (canvasErr) {
              console.warn('[compressImage] Fallback directo:', canvasErr);
              const rawDataUrl = reader.result as string;
              resolve({
                dataUrl: rawDataUrl,
                base64String: rawDataUrl.split(',')[1],
                format: file.type.split('/')[1] || 'jpeg',
              });
            }
          };
          img.src = reader.result as string;
        } catch (imgErr) {
          reject(imgErr);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      reject(err);
    }
  });
}

export function useCamera() {
  const [photo, setPhoto] = useState<CapturedImage | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = async (file: File): Promise<CapturedImage | null> => {
    if (!file) return null;
    setIsCapturing(true);
    setError(null);
    try {
      const compressed = await compressImage(file);
      setPhoto(compressed);
      return compressed;
    } catch (err: any) {
      console.error('Error procesando archivo de imagen:', err);
      setError(err.message || 'Error al procesar la imagen seleccionada');
      return null;
    } finally {
      setIsCapturing(false);
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
    // Reiniciar para permitir seleccionar el mismo archivo si es necesario
    e.target.value = '';
  };

  const clearPhoto = () => {
    setPhoto(null);
    setError(null);
  };

  return {
    photo,
    setPhoto,
    processFile,
    handleInputChange,
    clearPhoto,
    isCapturing,
    error,
  };
}
