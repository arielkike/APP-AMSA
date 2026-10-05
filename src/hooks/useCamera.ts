import { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

export interface CapturedImage {
  base64String?: string;
  dataUrl?: string;
  webPath?: string;
  format?: string;
}

export function useCamera() {
  const [photo, setPhoto] = useState<CapturedImage | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const selectFromFile = (): Promise<CapturedImage | null> => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e: any) => {
        const file = e.target?.files?.[0];
        if (!file) {
          resolve(null);
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          const base64String = dataUrl.split(',')[1];
          const captured: CapturedImage = {
            dataUrl,
            base64String,
            format: file.type.split('/')[1] || 'jpeg',
          };
          setPhoto(captured);
          resolve(captured);
        };
        reader.onerror = () => {
          setError('Error al leer el archivo seleccionado');
          resolve(null);
        };
        reader.readAsDataURL(file);
      };
      input.click();
    });
  };

  const takePhoto = async (source: CameraSource = CameraSource.Prompt): Promise<CapturedImage | null> => {
    setIsCapturing(true);
    setError(null);

    // Si es navegador web o falla el bridge nativo, usamos file input directo
    if (!Capacitor.isNativePlatform()) {
      try {
        const result = await selectFromFile();
        return result;
      } finally {
        setIsCapturing(false);
      }
    }

    try {
      // Verificar o solicitar permisos en iOS/Android
      try {
        const check = await Camera.checkPermissions();
        if (check.camera !== 'granted' || check.photos !== 'granted') {
          await Camera.requestPermissions();
        }
      } catch (permErr) {
        console.warn('Permisos de cámara automáticos:', permErr);
      }

      const image = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: source,
        promptLabelHeader: 'Seleccionar Comprobante',
        promptLabelPhoto: 'Elegir de Galería',
        promptLabelPicture: 'Tomar Foto con Cámara',
        promptLabelCancel: 'Cancelar',
      });

      const captured: CapturedImage = {
        dataUrl: image.dataUrl,
        base64String: image.dataUrl?.split(',')[1],
        webPath: image.webPath,
        format: image.format,
      };

      setPhoto(captured);
      return captured;
    } catch (err: any) {
      console.warn('Fallo en Camera.getPhoto, usando fallback file input:', err);
      // Fallback infalible con selector nativo del sistema
      try {
        return await selectFromFile();
      } catch (fallbackErr) {
        if (!err.message?.includes('cancelled') && !err.message?.includes('User cancelled')) {
          setError(err.message || 'Error al capturar imagen');
        }
        return null;
      }
    } finally {
      setIsCapturing(false);
    }
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
