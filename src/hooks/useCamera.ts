import { useState } from 'react';

export interface CapturedImage {
  base64String?: string;
  dataUrl?: string;
  webPath?: string;
  format?: string;
}

/**
 * Redimensiona y comprime una imagen para evitar consumo excesivo de memoria en iOS/Android
 * y asegurar que el comprobante se transfiera rápidamente al servidor.
 */
function compressImage(file: File, maxWidth = 1600, maxHeight = 1600, quality = 0.85): Promise<CapturedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Error al leer el archivo de imagen'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Error al cargar la imagen para procesamiento'));
      img.onload = () => {
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
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function useCamera() {
  const [photo, setPhoto] = useState<CapturedImage | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Selector nativo que activa el menú oficial del sistema en iOS y Android:
   * "Tomar Foto", "Fototeca / Galería" o "Elegir Archivo".
   * Es 100% estable, no se cierra y nunca crashea la app.
   */
  const selectFromFile = (): Promise<CapturedImage | null> => {
    return new Promise((resolve) => {
      setError(null);
      setIsCapturing(true);

      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';

      let resolved = false;

      input.onchange = async (e: any) => {
        resolved = true;
        const file = e.target?.files?.[0];
        if (!file) {
          setIsCapturing(false);
          resolve(null);
          return;
        }

        try {
          const compressed = await compressImage(file);
          setPhoto(compressed);
          setIsCapturing(false);
          resolve(compressed);
        } catch (err: any) {
          console.error('Error procesando imagen:', err);
          setError('Error al procesar la imagen seleccionada');
          setIsCapturing(false);
          resolve(null);
        }
      };

      // Si el usuario cancela el selector nativo
      window.addEventListener(
        'focus',
        () => {
          setTimeout(() => {
            if (!resolved) {
              setIsCapturing(false);
            }
          }, 1000);
        },
        { once: true }
      );

      input.click();
    });
  };

  /**
   * takePhoto invoca directamente el selector nativo infalible
   */
  const takePhoto = async (): Promise<CapturedImage | null> => {
    return selectFromFile();
  };

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
