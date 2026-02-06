import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Camera, RefreshCw, Power, Download, Check } from 'lucide-react';
import { toast } from "sonner";

interface GeoTaggedCameraProps {
    onCapture: (file: File) => void;
    onSubmit?: (file: File) => void;
    location: { lat: number; lng: number } | null;
    address?: string;
}

export const GeoTaggedCamera: React.FC<GeoTaggedCameraProps> = ({
    onCapture,
    onSubmit,
    location,
    address = "Location details unavailable"
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [image, setImage] = useState<string | null>(null);
    const [capturedFile, setCapturedFile] = useState<File | null>(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [showReviewDialog, setShowReviewDialog] = useState(false);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            });
            setStream(mediaStream);
            setCameraActive(true);
        } catch (err) {
            console.error("Error accessing camera:", err);
            toast.error("Could not access camera. Please check permissions.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            setCameraActive(false);
        }
    };

    useEffect(() => {
        return () => stopCamera();
    }, []);

    useEffect(() => {
        if (cameraActive && stream && videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [cameraActive, stream]);

    const wrapText = (
        ctx: CanvasRenderingContext2D,
        text: string,
        x: number,
        y: number,
        maxWidth: number,
        lineHeight: number
    ): number => {
        const words = text.split(' ');
        let line = '';
        let currentY = y;

        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;

            if (testWidth > maxWidth && i > 0) {
                ctx.fillText(line, x, currentY);
                line = words[i] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, currentY);
        return currentY + lineHeight;
    };

    const drawCornerOverlay = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        if (!location) return;

        const padding = 20;
        const cardWidth = Math.min(width * 0.45, 400);
        const minCardHeight = 140;
        const cardX = width - cardWidth - padding;

        // Calculate dynamic card height based on address length
        ctx.font = '11px sans-serif';
        const addressLines = Math.ceil(ctx.measureText(address).width / (cardWidth - 30));
        const cardHeight = minCardHeight + (addressLines > 1 ? (addressLines - 1) * 18 : 0);
        const cardY = height - cardHeight - padding;

        // Draw semi-transparent background with better styling
        ctx.save();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.90)';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 12);
        ctx.fill();
        ctx.restore();

        // Header
        ctx.fillStyle = '#60a5fa';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('📍 CAPTURE', cardX + 15, cardY + 28);

        // Date and Time
        const now = new Date();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(
            `${now.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            })} • ${now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            })}`,
            cardX + 15,
            cardY + 52
        );

        // Coordinates section
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Coordinates:', cardX + 15, cardY + 72);

        ctx.font = '11px monospace';
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText(`${location.lat.toFixed(6)}°N, ${location.lng.toFixed(6)}°E`, cardX + 15, cardY + 88);

        // Location address section with wrapping
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Location:', cardX + 15, cardY + 108);

        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#ffffff';
        wrapText(ctx, address, cardX + 15, cardY + 124, cardWidth - 30, 16);
    };

    const captureImage = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        drawCornerOverlay(context, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
            if (blob) {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const file = new File([blob], `attendance_${timestamp}.png`, { type: 'image/png' });
                const imageUrl = URL.createObjectURL(blob);

                setImage(imageUrl);
                setCapturedFile(file);
                onCapture(file);
                setShowReviewDialog(true);
                stopCamera();

                toast.success("Image captured successfully!");
            }
        }, 'image/png', 0.95);
    };

    const handleRetake = () => {
        setImage(null);
        setCapturedFile(null);
        setShowReviewDialog(false);
        startCamera();
    };

    const handleDownload = () => {
        if (!image || !capturedFile) return;

        const link = document.createElement('a');
        link.href = image;
        link.download = capturedFile.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Image downloaded successfully!");
    };

    const handleSubmit = () => {
        if (!capturedFile) return;

        if (onSubmit) {
            onSubmit(capturedFile);
        }

        toast.success("Image submitted successfully!");
        setShowReviewDialog(false);
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-4">
            {/* Camera/Image Display */}
            <div className="relative w-full aspect-video bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex items-center justify-center">
                {!cameraActive && !image ? (
                    <div className="text-center space-y-4">
                        <div className="text-slate-400 mb-4">
                            <Camera className="mx-auto h-16 w-16 mb-3 opacity-50" />
                            <p className="text-sm">Click below to start capturing attendance</p>
                        </div>
                        <Button
                            onClick={startCamera}
                            className="bg-blue-600 hover:bg-blue-700 h-12 px-8 rounded-xl text-base font-semibold"
                        >
                            <Camera className="mr-2 h-5 w-5" />
                            Start Camera
                        </Button>
                    </div>
                ) : cameraActive ? (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />

                        {/* Turn Off Camera Button */}
                        <button
                            onClick={stopCamera}
                            className="absolute top-4 right-4 p-2.5 rounded-full bg-red-600/80 hover:bg-red-600 backdrop-blur-md text-white transition-all border border-white/20 shadow-lg"
                            title="Turn off camera"
                        >
                            <Power className="h-5 w-5" />
                        </button>

                        {/* Location Info Indicator */}
                        {location && (
                            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-lg text-xs border border-white/20">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                                    <span>Location: {location.lat.toFixed(4)}°, {location.lng.toFixed(4)}°</span>
                                </div>
                            </div>
                        )}

                        {/* Capture Button */}
                        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                            <button
                                onClick={captureImage}
                                className="h-20 w-20 rounded-full border-4 border-white flex items-center justify-center group active:scale-95 transition-transform shadow-2xl bg-white/10 backdrop-blur-sm"
                                title="Capture image"
                            >
                                <div className="h-16 w-16 rounded-full bg-white shadow-lg group-hover:bg-blue-500 transition-colors" />
                            </button>
                        </div>
                    </>
                ) : (
                    <img src={image!} className="w-full h-full object-contain" alt="Captured attendance" />
                )}
            </div>

            {/* Review Dialog - Only shown after image capture */}
            {showReviewDialog && image && (
                <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-white">Review Your Image</h3>
                            <p className="text-sm text-slate-400 mt-1">
                                Review the captured image and choose an action below
                            </p>
                        </div>
                    </div>

                    {/* Location Details */}
                    {location && (
                        <div className="bg-slate-800/50 rounded-lg p-4 mb-4 border border-slate-700">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-slate-400 mb-1">Coordinates</p>
                                    <p className="text-white font-mono">
                                        {location.lat.toFixed(6)}°N, {location.lng.toFixed(6)}°E
                                    </p>
                                </div>
                                <div>
                                    <p className="text-slate-400 mb-1">Timestamp</p>
                                    <p className="text-white">
                                        {new Date().toLocaleString()}
                                    </p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-slate-400 mb-1">Location</p>
                                    <p className="text-white">{address}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                        <Button
                            onClick={handleRetake}
                            variant="outline"
                            className="flex-1 min-w-[140px] bg-slate-800 hover:bg-slate-700 border-slate-700 text-white h-11"
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Retake
                        </Button>

                        <Button
                            onClick={handleDownload}
                            variant="outline"
                            className="flex-1 min-w-[140px] bg-slate-800 hover:bg-slate-700 border-slate-700 text-white h-11"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                        </Button>

                        <Button
                            onClick={handleSubmit}
                            className="flex-1 min-w-[140px] bg-green-600 hover:bg-green-700 text-white h-11 font-semibold"
                        >
                            <Check className="mr-2 h-4 w-4" />
                            Submit
                        </Button>
                    </div>
                </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};