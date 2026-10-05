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
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Error al decodificar la imagen'));
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
   * Abre la cámara o la galería de manera infalible en iOS / Android / Web.
   * Al agregar el input al DOM antes del click, iOS WebKit permite activar la cámara en vivo
   * con capture="environment".
   */
  const openImagePicker = (mode: 'camera' | 'gallery' | 'any' = 'any'): Promise<CapturedImage | null> => {
    return new Promise((resolve) => {
      setError(null);
      setIsCapturing(true);

      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';

      // En iOS/Android, capture="environment" abre directamente el visor de la cámara trasera
      if (mode === 'camera') {
        input.setAttribute('capture', 'environment');
      }

      // Estilos para ocultar pero mantener presente en el DOM (requerido por seguridad en iOS WebKit)
      input.style.position = 'fixed';
      input.style.top = '-9999px';
      input.style.left = '-9999px';
      input.style.opacity = '0';
      input.style.pointerEvents = 'none';
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
        const file = e.target?.files?.[0];
        if (!file) {
          cleanup();
          resolve(null);
          return;
        }

        try {
          const compressed = await compressImage(file);
          setPhoto(compressed);
          cleanup();
          resolve(compressed);
        } catch (err: any) {
          console.error('Error procesando foto:', err);
          setError('No se pudo procesar la imagen seleccionada');
          cleanup();
          resolve(null);
        }
      };

      // Limpieza si el usuario cancela o regresa a la app
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

      // Disparar apertura nativa
      input.click();
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
