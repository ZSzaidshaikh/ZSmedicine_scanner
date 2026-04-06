import React, { useEffect, useRef, useState, useCallback } from "react";
import { Camera, RotateCw, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CameraPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (image: string) => void;
  onFallback?: () => void;
}

export function CameraPreview({ isOpen, onClose, onCapture, onFallback }: CameraPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [isLoading, setIsLoading] = useState(true);

  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const startStream = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    // Check if the browser supports mediaDevices
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const isSecureContext = window.isSecureContext;
      setError(
        !isSecureContext 
          ? "Camera requires a secure (HTTPS) connection. Please try 'Use System Camera'." 
          : "Your browser doesn't support camera access. Please try 'Use System Camera'."
      );
      setIsLoading(false);
      return;
    }

    try {
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Unable to access camera. Please check permissions.");
      toast({
        title: "Camera Error",
        description: "Please allow camera access to take photos of your medicine.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [facingMode]);

  useEffect(() => {
    if (isOpen) {
      startStream();
    } else {
      stopStream();
    }
    return () => stopStream();
  }, [isOpen, startStream, stopStream]);

  const toggleCamera = () => {
    stopStream();
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = canvas.toDataURL("image/jpeg", 0.8);
        onCapture(imageData);
        onClose();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-black border-none gap-0">
        <DialogHeader className="p-4 absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent">
          <DialogTitle className="text-white flex items-center justify-between">
            <span>Scan Medicine</span>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="relative aspect-[3/4] flex items-center justify-center bg-black">
          {error ? (
            <div className="text-center p-6 text-white space-y-4">
              <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
              <p className="text-sm opacity-90">{error}</p>
              <div className="flex flex-col gap-3">
                <Button onClick={startStream} variant="outline" className="text-white border-white hover:bg-white/10">
                  Try Again
                </Button>
                {onFallback && (
                  <Button 
                    onClick={() => {
                      onClose();
                      onFallback();
                    }} 
                    variant="default" 
                    className="bg-primary text-primary-foreground"
                  >
                    Use System Camera
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={cn(
                  "w-full h-full object-cover transition-opacity duration-300",
                  isLoading ? "opacity-0" : "opacity-100",
                  facingMode === "user" ? "-scale-x-100" : ""
                )}
              />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              
              {/* Scan Frame Overlay */}
              {!isLoading && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-[80%] h-[60%] border-2 border-white/50 rounded-2xl relative">
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-6 bg-black flex items-center justify-around">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 rounded-full h-12 w-12"
            onClick={toggleCamera}
            disabled={isLoading || !!error}
          >
            <RotateCw className="h-6 w-6" />
          </Button>

          <Button
            size="icon"
            className="h-16 w-16 rounded-full bg-white hover:bg-white/90 border-4 border-primary/20 transition-transform active:scale-90"
            onClick={captureImage}
            disabled={isLoading || !!error}
          >
            <div className="h-12 w-12 rounded-full border-2 border-black/10" />
            <Camera className="absolute h-6 w-6 text-black" />
          </Button>

          <div className="w-12 h-12" /> {/* Spacer */}
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}
