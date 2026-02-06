import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Camera, CheckCircle, XCircle } from 'lucide-react';
import { useFrappePostCall } from 'frappe-react-sdk';

interface FaceVerifyModalProps {
    isOpen: boolean;
    onClose: () => void;
    encodings: string;
}

export const FaceVerifyModal: React.FC<FaceVerifyModalProps> = ({
    isOpen,
    onClose,
    encodings
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [verifying, setVerifying] = useState(false);
    const [result, setResult] = useState<{ match: boolean, accuracy: string } | null>(null);

    const { call: verifyAccuracy } = useFrappePostCall('face_reco.face_reco.doctype.employee_face_enrollment.employee_face_enrollment.verify_accuracy');

    useEffect(() => {
        if (isOpen) {
            startCamera();
        } else {
            stopCamera();
            setResult(null);
            setVerifying(false);
        }
        return () => stopCamera();
    }, [isOpen]);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Camera error:", err);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const handleVerify = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);

        setVerifying(true);
        try {
            const response = await verifyAccuracy({
                image: imageData,
                stored_encodings: encodings
            });

            if (response.message) {
                const distance = response.message.distance;
                const accuracy = Math.max(0, (1 - distance) * 100).toFixed(2);
                setResult({
                    match: response.message.match,
                    accuracy: accuracy
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setVerifying(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Verify Face Accuracy</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center space-y-4">
                    {result ? (
                        <div className={`text-xl font-bold flex items-center gap-2 ${result.match ? 'text-green-600' : 'text-red-600'}`}>
                            {result.match ? <CheckCircle /> : <XCircle />}
                            {result.accuracy}% Accuracy
                        </div>
                    ) : (
                        <div className="text-xl font-bold text-slate-700">Ready to Scan</div>
                    )}

                    <div className="relative w-full aspect-[4/3] bg-black rounded-lg overflow-hidden shadow-inner">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover transform -scale-x-100"
                        />
                        <canvas ref={canvasRef} className="hidden" />

                        {verifying && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Loader2 className="w-10 h-10 text-white animate-spin" />
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="sm:justify-center">
                    <Button
                        onClick={handleVerify}
                        disabled={verifying || !stream}
                        className="w-full sm:w-auto"
                    >
                        {verifying ? "Checking..." : "Check Accuracy"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};