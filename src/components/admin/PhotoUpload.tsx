import { useState, useCallback } from 'react';
import { Upload, Link as LinkIcon, Loader2, CheckCircle, X, Crop } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { optimizeImage, optimizeBlob, getOptimizedFileName, formatFileSize } from '@/lib/image-optimization';
import { ImageCropper } from './ImageCropper';
import { toast } from 'sonner';

interface PhotoUploadProps {
  onUpload: (url: string) => void;
  bucketName?: string;
}

export const PhotoUpload = ({ onUpload, bucketName = 'events' }: PhotoUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [optimizedSize, setOptimizedSize] = useState<number>(0);
  
  // Cropper state
  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cropperImageUrl, setCropperImageUrl] = useState<string>('');

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setOriginalSize(file.size);
    
    // Create URL for cropper
    const url = URL.createObjectURL(file);
    setCropperImageUrl(url);
    setShowCropper(true);
  };

  const uploadBlob = async (blob: Blob, fileName: string) => {
    setIsUploading(true);
    setUploadProgress('Uploading...');

    try {
      const filePath = `photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, blob, {
          contentType: 'image/webp',
          cacheControl: '31536000',
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      setUploadProgress('Complete!');
      toast.success('Image uploaded!');
      onUpload(publicUrl);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
      setUploadProgress('');
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setShowCropper(false);
    setIsUploading(true);
    setUploadProgress('Optimizing...');

    try {
      // Optimize the cropped image
      const { blob: optimizedBlob } = await optimizeBlob(croppedBlob, {
        maxWidth: 2048,
        quality: 0.85,
        format: 'webp',
      });

      setOptimizedSize(optimizedBlob.size);
      setPreviewUrl(URL.createObjectURL(optimizedBlob));

      const fileName = getOptimizedFileName(selectedFile?.name || 'cropped', 'webp');
      await uploadBlob(optimizedBlob, fileName);
    } catch (error) {
      console.error('Processing error:', error);
      toast.error('Failed to process image');
      setIsUploading(false);
    }
  };

  const handleSkipCrop = async () => {
    setShowCropper(false);
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress('Optimizing...');

    try {
      setPreviewUrl(URL.createObjectURL(selectedFile));

      const { blob: optimizedBlob } = await optimizeImage(selectedFile, {
        maxWidth: 2048,
        quality: 0.85,
        format: 'webp',
      });

      setOptimizedSize(optimizedBlob.size);

      const fileName = getOptimizedFileName(selectedFile.name, 'webp');
      await uploadBlob(optimizedBlob, fileName);
    } catch (error) {
      console.error('Processing error:', error);
      toast.error('Failed to process image');
      setIsUploading(false);
    }
  };

  const handleCropperCancel = () => {
    setShowCropper(false);
    if (cropperImageUrl) {
      URL.revokeObjectURL(cropperImageUrl);
    }
    setCropperImageUrl('');
    setSelectedFile(null);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    try {
      new URL(urlInput);
      onUpload(urlInput.trim());
      setUrlInput('');
      toast.success('URL added!');
    } catch {
      toast.error('Please enter a valid URL');
    }
  };

  const clearPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setOriginalSize(0);
    setOptimizedSize(0);
    setSelectedFile(null);
  };

  return (
    <>
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload File</TabsTrigger>
          <TabsTrigger value="url">Paste URL</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          {/* Drop zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />

            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">{uploadProgress}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drag and drop an image, or click to browse
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
                  <Crop className="w-3 h-3" />
                  <span>Crop, optimize & convert to WebP</span>
                </div>
              </div>
            )}
          </div>

          {/* Preview */}
          {previewUrl && (
            <div className="relative rounded-lg overflow-hidden border border-border">
              <button
                onClick={clearPreview}
                className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-48 object-cover"
              />
              {optimizedSize > 0 && (
                <div className="p-3 bg-muted/50 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Optimized</span>
                  </div>
                  <span className="text-muted-foreground">
                    {formatFileSize(originalSize)} → {formatFileSize(optimizedSize)}
                    <span className="ml-2 text-green-600">
                      ({Math.round((1 - optimizedSize / originalSize) * 100)}% smaller)
                    </span>
                  </span>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="url" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image-url">Image URL</Label>
            <div className="flex gap-2">
              <Input
                id="image-url"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
              />
              <Button onClick={handleUrlSubmit}>
                <LinkIcon className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Note: External URLs won't be optimized
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Image Cropper Modal */}
      <ImageCropper
        imageUrl={cropperImageUrl}
        isOpen={showCropper}
        onCropComplete={handleCropComplete}
        onCancel={handleCropperCancel}
        onSkip={handleSkipCrop}
      />
    </>
  );
};
