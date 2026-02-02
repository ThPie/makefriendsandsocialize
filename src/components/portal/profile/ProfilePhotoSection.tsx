import { Camera, Loader2, X } from "lucide-react";

interface ProfilePhotoSectionProps {
    avatarUrls: string[];
    isUploading: boolean;
    initials: string;
    handleImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    removePhoto: (index: number) => Promise<void>;
}

export const ProfilePhotoSection = ({
    avatarUrls,
    isUploading,
    initials,
    handleImageSelect,
    removePhoto,
}: ProfilePhotoSectionProps) => {
    return (
        <div className="bg-card border border-border/50 rounded-2xl p-6">
            <h2 className="font-display text-xl text-foreground mb-4">Profile Photos</h2>
            <div className="flex flex-wrap gap-4">
                {/* Existing photos */}
                {avatarUrls.map((url, index) => (
                    <div key={index} className="relative group h-32 w-32 rounded-lg overflow-hidden bg-muted">
                        <img
                            src={url}
                            alt={`Profile photo ${index + 1}`}
                            className="h-full w-full object-cover object-center"
                            loading="lazy"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                        {/* Fallback behind the image */}
                        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground -z-10">
                            {initials}
                        </div>
                        <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ))}

                {/* Upload button */}
                {avatarUrls.length < 3 && (
                    <label className="h-32 w-32 rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors">
                        {isUploading ? (
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        ) : (
                            <>
                                <Camera className="h-6 w-6 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Add Photo</span>
                            </>
                        )}
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleImageSelect}
                            className="hidden"
                            disabled={isUploading}
                        />
                    </label>
                )}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
                Upload up to 3 high-quality photos. Portrait orientation recommended.
            </p>
        </div>
    );
};
