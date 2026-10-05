import { useState } from 'react';

export interface CapturedImage {
  base64String?: string;
  dataUrl?: string;
  webPath?: string;
  format?: string;
}

/**
 * Redimensiona y comprime la imagen para optimizar memoria en dispositivos móviles
 * y acelerar la transferencia al servidor sin perder legibilidad.
 */
function compressImage(file: File, maxWidth = 1600, maxHeight = 1600, quality = 0.85): Promise<CapturedImage> {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Error al leer el archivo seleccionado'));
      reader.onload = () => {
        try {
          const img = new Image();
          img.onerror = () => reject(new Error('Error al decodificar la imagen'));
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
            } catch (canvasErr: any) {
              console.warn('[compressImage] Fallback a imagen directa:', canvasErr);
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

  /**
   * Abre la cámara o la galería de forma nativa y segura.
   */
  const openImagePicker = (mode: 'camera' | 'gallery' | 'any' = 'any'): Promise<CapturedImage | null> => {
    return new Promise((resolve) => {
      try {
        setError(null);
        setIsCapturing(true);

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        // En iOS/Android, capture="environment" abre directamente la cámara
        if (mode === 'camera') {
          input.setAttribute('capture', 'environment');
        }

        // Posicionado sutilmente en el DOM para cumplir políticas de seguridad de iOS WebKit
        input.style.position = 'fixed';
        input.style.top = '0px';
        input.style.left = '0px';
        input.style.width = '1px';
        input.style.height = '1px';
        input.style.opacity = '0.01';
        document.body.appendChild(input);

        let isFinished = false;

        const cleanup = () => {
          if (!isFinished) {
            isFinished = true;
            setIsCapturing(false);
            if (document.body.contains(input)) {
              document.body.removeChild(input);
            }
          }
        };

        input.onchange = async (e: any) => {
          try {
            const file = e.target?.files?.[0];
            if (!file) {
              cleanup();
              resolve(null);
              return;
            }

            const compressed = await compressImage(file);
            setPhoto(compressed);
            cleanup();
            resolve(compressed);
          } catch (err: any) {
            console.error('Error procesando foto:', err);
            setError(err.message || 'No se pudo procesar la imagen seleccionada');
            cleanup();
            resolve(null);
          }
        };

        // Si el usuario cancela en el selector de iOS
        window.addEventListener(
          'focus',
          () => {
            setTimeout(() => {
              if (!input.files || input.files.length === 0) {
                cleanup();
              }
            }, 1200);
          },
          { once: true }
        );

        input.click();
      } catch (triggerErr: any) {
        console.error('Error al invocar selector:', triggerErr);
        setError(triggerErr.message || 'Error al abrir la cámara/galería');
        setIsCapturing(false);
        resolve(null);
      }
    });
  };

  const takePhoto = (mode: 'camera' | 'gallery' | 'any' = 'camera') => openImagePicker(mode);
  const selectFromFile = () => openImagePicker('gallery');

  const clearPhoto = () => {
    setPhoto(null);
    setError(null);
  };

  return {
    photo,
    setPhoto,
    takePhoto,
    selectFromFile,
    clearPhoto,
    isCapturing,
    error,
  };
}
