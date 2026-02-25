import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";

interface ExerciseImageUploadProps {
  exerciseName: string;
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
  onImageRemoved?: () => void;
}

export function ExerciseImageUpload({
  exerciseName,
  currentImageUrl,
  onImageUploaded,
  onImageRemoved,
}: ExerciseImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sanitizeFileName = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a JPEG, PNG, WebP, or GIF image");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Please sign in to upload images");
        setIsUploading(false);
        return;
      }

      // Create unique file name
      const fileExt = file.name.split(".").pop();
      const sanitizedName = sanitizeFileName(exerciseName);
      const fileName = `${user.id}/${sanitizedName}-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("exercise-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        setError("Failed to upload image. Please try again.");
        setIsUploading(false);
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("exercise-images")
        .getPublicUrl(fileName);

      // Save to user_exercise_images table
      const { error: dbError } = await supabase
        .from("user_exercise_images")
        .upsert({
          user_id: user.id,
          exercise_name: exerciseName,
          image_url: publicUrl,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id,exercise_name",
        });

      if (dbError) {
        console.error("Database error:", dbError);
        // Still use the uploaded URL even if DB save fails
      }

      onImageUploaded(publicUrl);
    } catch (err) {
      console.error("Upload error:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = async () => {
    if (!onImageRemoved) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Remove from database
        await supabase
          .from("user_exercise_images")
          .delete()
          .eq("user_id", user.id)
          .eq("exercise_name", exerciseName);
      }
      onImageRemoved();
    } catch (err) {
      console.error("Remove error:", err);
    }
  };

  const isCustomImage = currentImageUrl?.includes("exercise-images");

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex-1"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Camera className="w-4 h-4 mr-2" />
              {currentImageUrl ? "Change Image" : "Upload Image"}
            </>
          )}
        </Button>

        {isCustomImage && onImageRemoved && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemoveImage}
            className="text-destructive hover:text-destructive"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <p className="text-xs text-muted-foreground">
        JPEG, PNG, WebP or GIF • Max 5MB
      </p>
    </div>
  );
}