import { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

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

  const takePhoto = async (source: CameraSource = CameraSource.Prompt): Promise<CapturedImage | null> => {
    setIsCapturing(true);
    setError(null);

    try {
      const image = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: source,
        promptLabelHeader: 'Seleccionar Comprobante',
        promptLabelPhoto: 'Elegir de Galería',
        promptLabelPicture: 'Tomar Foto con Cámara',
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
      if (!err.message?.includes('cancelled') && !err.message?.includes('User cancelled')) {
        setError(err.message || 'Error al capturar imagen');
      }
      return null;
    } finally {
      setIsCapturing(false);
    }
  };

  const clearPhoto = () => setPhoto(null);

  return {
    photo,
    setPhoto,
    takePhoto,
    clearPhoto,
    isCapturing,
    error,
  };
}
