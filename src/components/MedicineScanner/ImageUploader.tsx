import { useState, useRef, useCallback } from "react";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ImageUploaderProps {
  onImageCapture: (base64Image: string) => void;
  isAnalyzing: boolean;
}

export function ImageUploader({ onImageCapture, isAnalyzing }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate that it's actually an image
      if (!file.type.startsWith("image/")) {
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreview(base64);
      };
      reader.onerror = () => {
        console.error("Failed to read file");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraClick = useCallback(() => {
    const input = cameraInputRef.current;
    if (!input) return;
    // Reset value so onChange fires even if the same photo is taken again
    input.value = "";
    // Small delay to ensure the reset is processed before click on some mobile browsers
    setTimeout(() => {
      input.click();
    }, 10);
  }, []);

  const handleGalleryClick = useCallback(() => {
    const input = fileInputRef.current;
    if (!input) return;
    // Reset value so onChange fires even if the same file is selected again
    input.value = "";
    setTimeout(() => {
      input.click();
    }, 10);
  }, []);

  const handleAnalyze = () => {
    if (preview) {
      onImageCapture(preview);
    }
  };

  const handleClear = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      {!preview ? (
        <div className="grid grid-cols-2 gap-4">
          {/* Camera Button */}
          <Card
            className="cursor-pointer border-2 border-dashed border-primary/30 bg-medicine-peach/50 hover:border-primary hover:bg-medicine-peach transition-all duration-300"
            onClick={handleCameraClick}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <div className="mb-3 rounded-full bg-primary/10 p-4">
                <Camera className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Take Photo</h3>
              <p className="mt-1 text-sm text-muted-foreground">Use your camera</p>
            </CardContent>
          </Card>

          {/* Gallery Button */}
          <Card
            className="cursor-pointer border-2 border-dashed border-accent/30 bg-medicine-mint/50 hover:border-accent hover:bg-medicine-mint transition-all duration-300"
            onClick={handleGalleryClick}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <div className="mb-3 rounded-full bg-accent/10 p-4">
                <Upload className="h-8 w-8 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground">Upload Image</h3>
              <p className="mt-1 text-sm text-muted-foreground">From gallery</p>
            </CardContent>
          </Card>

          {/* Camera input - uses capture attribute to open camera directly on mobile */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/heic,image/heif"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
            aria-label="Take a photo with camera"
          />
          {/* Gallery input - no capture attribute so it opens file picker / gallery */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/heic,image/heif"
            className="hidden"
            onChange={handleFileChange}
            aria-label="Choose image from gallery"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <CardContent className="p-0 relative">
              <img
                src={preview}
                alt="Medicine preview"
                className="w-full h-64 object-contain bg-muted"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 rounded-full"
                onClick={handleClear}
                disabled={isAnalyzing}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full h-14 text-lg font-semibold rounded-xl shadow-lg"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing Medicine...
              </>
            ) : (
              "Analyze Medicine"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
