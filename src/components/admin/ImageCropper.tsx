import { useState, useCallback } from 'react';
import Cropper, { Area, Point } from 'react-easy-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { RotateCw, ZoomIn, Crop, X } from 'lucide-react';
import { cropImage } from '@/lib/image-optimization';

interface ImageCropperProps {
  imageUrl: string;
  isOpen: boolean;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
  onSkip: () => void;
}

const ASPECT_RATIOS = [
  { label: 'Free', value: undefined },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
  { label: '3:4', value: 3 / 4 },
];

export const ImageCropper = ({ 
  imageUrl, 
  isOpen, 
  onCropComplete, 
  onCancel,
  onSkip 
}: ImageCropperProps) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = useCallback((location: Point) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const onCropAreaComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleApplyCrop = async () => {
    if (!croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      const croppedBlob = await cropImage(imageUrl, {
        x: croppedAreaPixels.x,
        y: croppedAreaPixels.y,
        width: croppedAreaPixels.width,
        height: croppedAreaPixels.height,
      }, rotation);
      onCropComplete(croppedBlob);
    } catch (error) {
      console.error('Crop error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetCrop = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setAspectRatio(undefined);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Crop className="w-5 h-5" />
            Crop Image
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 relative bg-black/90 min-h-0">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspectRatio}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropAreaComplete}
            showGrid
            style={{
              containerStyle: {
                width: '100%',
                height: '100%',
              },
            }}
          />
        </div>

        <div className="px-6 py-4 border-t space-y-4 bg-background">
          {/* Aspect Ratio */}
          <div className="flex items-center gap-4">
            <Label className="text-sm font-medium min-w-20">Aspect Ratio</Label>
            <div className="flex gap-2">
              {ASPECT_RATIOS.map((ratio) => (
                <Button
                  key={ratio.label}
                  variant={aspectRatio === ratio.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAspectRatio(ratio.value)}
                >
                  {ratio.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Zoom */}
          <div className="flex items-center gap-4">
            <Label className="text-sm font-medium min-w-20 flex items-center gap-2">
              <ZoomIn className="w-4 h-4" />
              Zoom
            </Label>
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={([value]) => setZoom(value)}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground w-12">{zoom.toFixed(1)}x</span>
          </div>

          {/* Rotation */}
          <div className="flex items-center gap-4">
            <Label className="text-sm font-medium min-w-20 flex items-center gap-2">
              <RotateCw className="w-4 h-4" />
              Rotation
            </Label>
            <Button variant="outline" size="sm" onClick={handleRotate}>
              Rotate 90°
            </Button>
            <span className="text-sm text-muted-foreground">{rotation}°</span>
            <Button variant="ghost" size="sm" onClick={resetCrop} className="ml-auto">
              Reset
            </Button>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t gap-2">
          <Button variant="ghost" onClick={onCancel} disabled={isProcessing}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button variant="outline" onClick={onSkip} disabled={isProcessing}>
            Skip Crop
          </Button>
          <Button onClick={handleApplyCrop} disabled={isProcessing || !croppedAreaPixels}>
            {isProcessing ? 'Processing...' : 'Apply Crop'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
