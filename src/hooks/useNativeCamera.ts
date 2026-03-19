import { useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { toast } from 'sonner';

interface CameraOptions {
  /** Max width in pixels (default 1024) */
  width?: number;
  /** Max height in pixels (default 1024) */
  height?: number;
  /** JPEG quality 0-100 (default 85) */
  quality?: number;
  /** Allow editing/cropping (default true) */
  allowEditing?: boolean;
}

interface CameraResult {
  /** Base64-encoded image data (without prefix) */
  base64?: string;
  /** Data URI ready for <img src> or upload */
  dataUrl?: string;
  /** Web URL (blob or file) — available on web */
  webPath?: string;
  /** File format */
  format: string;
}

/**
 * Native camera and photo library access via Capacitor.
 * Falls back to file input on web for full cross-platform support.
 */
export function useNativeCamera() {
  const isNative = Capacitor.isNativePlatform();

  /**
   * Take a photo with the device camera.
   */
  const takePhoto = useCallback(async (options?: CameraOptions): Promise<CameraResult | null> => {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        quality: options?.quality ?? 85,
        width: options?.width ?? 1024,
        height: options?.height ?? 1024,
        allowEditing: options?.allowEditing ?? true,
        correctOrientation: true,
      });

      return photoToResult(photo);
    } catch (error: any) {
      if (error?.message?.includes('cancelled') || error?.message?.includes('User cancelled')) {
        return null; // User cancelled — not an error
      }
      console.error('Camera error:', error);
      toast.error('Could not access camera');
      return null;
    }
  }, []);

  /**
   * Pick a photo from the device gallery/photo library.
   */
  const pickFromGallery = useCallback(async (options?: CameraOptions): Promise<CameraResult | null> => {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos,
        quality: options?.quality ?? 85,
        width: options?.width ?? 1024,
        height: options?.height ?? 1024,
        allowEditing: options?.allowEditing ?? true,
        correctOrientation: true,
      });

      return photoToResult(photo);
    } catch (error: any) {
      if (error?.message?.includes('cancelled') || error?.message?.includes('User cancelled')) {
        return null;
      }
      console.error('Gallery error:', error);
      toast.error('Could not access photos');
      return null;
    }
  }, []);

  /**
   * Show a prompt letting the user choose between camera or gallery.
   */
  const pickImage = useCallback(async (options?: CameraOptions): Promise<CameraResult | null> => {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Base64,
        source: CameraSource.Prompt,
        quality: options?.quality ?? 85,
        width: options?.width ?? 1024,
        height: options?.height ?? 1024,
        allowEditing: options?.allowEditing ?? true,
        correctOrientation: true,
        promptLabelHeader: 'Choose Photo',
        promptLabelPhoto: 'From Gallery',
        promptLabelPicture: 'Take Photo',
      });

      return photoToResult(photo);
    } catch (error: any) {
      if (error?.message?.includes('cancelled') || error?.message?.includes('User cancelled')) {
        return null;
      }
      console.error('Image picker error:', error);
      toast.error('Could not get photo');
      return null;
    }
  }, []);

  /**
   * Convert a Camera result to a File object for upload.
   */
  const resultToFile = useCallback((result: CameraResult, filename?: string): File | null => {
    if (!result.base64) return null;

    const byteString = atob(result.base64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    const mimeType = result.format === 'png' ? 'image/png' : 'image/jpeg';
    const ext = result.format === 'png' ? 'png' : 'jpg';
    const blob = new Blob([ab], { type: mimeType });

    return new File([blob], filename || `photo_${Date.now()}.${ext}`, { type: mimeType });
  }, []);

  return {
    isNative,
    takePhoto,
    pickFromGallery,
    pickImage,
    resultToFile,
  };
}

function photoToResult(photo: Photo): CameraResult {
  return {
    base64: photo.base64String,
    dataUrl: photo.base64String
      ? `data:image/${photo.format};base64,${photo.base64String}`
      : undefined,
    webPath: photo.webPath,
    format: photo.format,
  };
}
