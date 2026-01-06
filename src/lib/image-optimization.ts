export interface OptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg';
}

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function getRotatedCanvas(
  image: HTMLImageElement,
  rotation: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  const angleRad = (rotation * Math.PI) / 180;
  const sin = Math.abs(Math.sin(angleRad));
  const cos = Math.abs(Math.cos(angleRad));

  // Calculate new dimensions after rotation
  canvas.width = Math.floor(image.width * cos + image.height * sin);
  canvas.height = Math.floor(image.width * sin + image.height * cos);

  // Move to center and rotate
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(angleRad);
  ctx.drawImage(image, -image.width / 2, -image.height / 2);

  return canvas;
}

export async function cropImage(
  imageUrl: string,
  cropArea: CropArea,
  rotation: number = 0
): Promise<Blob> {
  const image = await loadImageFromUrl(imageUrl);

  // Get rotated image if needed
  const sourceCanvas = rotation !== 0 ? getRotatedCanvas(image, rotation) : null;
  const source = sourceCanvas || image;

  // Create output canvas with crop dimensions
  const canvas = document.createElement('canvas');
  canvas.width = cropArea.width;
  canvas.height = cropArea.height;

  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    source,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    cropArea.width,
    cropArea.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          // Fallback to JPEG
          canvas.toBlob(
            (jpegBlob) => {
              if (jpegBlob) resolve(jpegBlob);
              else reject(new Error('Failed to crop image'));
            },
            'image/jpeg',
            0.9
          );
        }
      },
      'image/webp',
      0.9
    );
  });
}

export async function optimizeImage(
  file: File,
  options: OptimizeOptions = {}
): Promise<{ blob: Blob; width: number; height: number }> {
  const { maxWidth = 2048, maxHeight = 2048, quality = 0.85, format = 'webp' } = options;

  const img = await loadImage(file);

  // Calculate new dimensions maintaining aspect ratio
  let { width, height } = img;
  
  if (width > maxWidth) {
    height = Math.round((height * maxWidth) / width);
    width = maxWidth;
  }
  
  if (height > maxHeight) {
    width = Math.round((width * maxHeight) / height);
    height = maxHeight;
  }

  // Create canvas and draw resized image
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Enable image smoothing for better quality
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  // Convert to WebP with fallback to JPEG
  const mimeType = format === 'webp' ? 'image/webp' : 'image/jpeg';

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve({ blob, width, height });
        } else if (format === 'webp') {
          // Fallback to JPEG if WebP fails
          canvas.toBlob(
            (jpegBlob) => {
              if (jpegBlob) {
                resolve({ blob: jpegBlob, width, height });
              } else {
                reject(new Error('Failed to convert image'));
              }
            },
            'image/jpeg',
            quality
          );
        } else {
          reject(new Error('Failed to convert image'));
        }
      },
      mimeType,
      quality
    );
  });
}

export async function optimizeBlob(
  blob: Blob,
  options: OptimizeOptions = {}
): Promise<{ blob: Blob; width: number; height: number }> {
  const file = new File([blob], 'cropped.webp', { type: blob.type });
  return optimizeImage(file, options);
}

export function getOptimizedFileName(originalName: string, format: 'webp' | 'jpeg' = 'webp'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = format === 'webp' ? 'webp' : 'jpg';
  return `${timestamp}-${random}.${extension}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
