export interface OptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg';
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
