import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Camera, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useFrappePostCall } from 'frappe-react-sdk';

interface FaceEnrollmentWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (data: { encodings: any[], image: string }) => void;
    userType: string;
    userName: string;
}

export const FaceEnrollmentWizard: React.FC<FaceEnrollmentWizardProps> = ({
    isOpen,
    onClose,
    onComplete,
    userType,
    userName
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [step, setStep] = useState(0); // 0 to 4
    const [capturedImages, setCapturedImages] = useState<string[]>([]);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    const poses = ["Front", "Left", "Right", "Up", "Down"];
    const currentPose = poses[step];

    const { call: verifyPose } = useFrappePostCall('face_reco.face_reco.doctype.employee_face_enrollment.employee_face_enrollment.verify_single_pose');
    const { call: generateEncodings } = useFrappePostCall('face_reco.face_reco.doctype.employee_face_enrollment.employee_face_enrollment.generate_face_encodings');

    useEffect(() => {
        if (isOpen) {
            startCamera();
        } else {
            stopCamera();
            resetState();
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
            console.error("Camera access error:", err);
            setError("Could not access camera. Please allow permissions.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const resetState = () => {
        setStep(0);
        setCapturedImages([]);
        setError(null);
        setProcessing(false);
    };

    const handleCapture = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Draw image
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);

        setVerifying(true);
        setError(null);

        try {
            const response = await verifyPose({ image: imageData });
            if (response.message && response.message.success) {
                const newImages = [...capturedImages, imageData];
                setCapturedImages(newImages);

                if (step < poses.length - 1) {
                    setStep(prev => prev + 1);
                } else {
                    finishEnrollment(newImages);
                }
            } else {
                setError("Face not detected clearly. Please align your face and try again.");
            }
        } catch (e: any) {
            console.error("Verification error:", e);
            setError(e.message || "Server error during verification.");
        } finally {
            setVerifying(false);
        }
    };

    const finishEnrollment = async (images: string[]) => {
        setProcessing(true);
        try {
            const response = await generateEncodings({ images: JSON.stringify(images) });
            if (response.message) {
                onComplete({
                    encodings: response.message,
                    image: images[0] // Return Front image
                });
            } else {
                setError("Failed to generate encodings. Please try again.");
                setStep(0);
                setCapturedImages([]);
            }
        } catch (e: any) {
            console.error("Encoding error:", e);
            setError(e.message || "Error processing final enrollment.");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Face Enrollment: {userName || userType}</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center space-y-4">
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                            className="bg-primary h-full transition-all duration-300"
                            style={{ width: `${(step / poses.length) * 100}%` }}
                        />
                    </div>

                    <div className="text-center">
                        <h3 className={`text-xl font-bold ${processing ? 'text-primary' : 'text-slate-800'}`}>
                            {processing ? 'Processing Final Data...' : `Pose: ${currentPose}`}
                        </h3>
                        {!processing && (
                            <p className="text-sm text-slate-500">
                                Please look {currentPose.toLowerCase()} and hold still.
                            </p>
                        )}
                    </div>

                    {/* Camera Feed */}
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

                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                </div>

                <DialogFooter className="sm:justify-center">
                    {!processing && (
                        <Button
                            onClick={handleCapture}
                            disabled={verifying || !stream}
                            className="w-full sm:w-auto min-w-[150px]"
                        >
                            {verifying ? (
                                <>Verifying...</>
                            ) : (
                                <>
                                    <Camera className="w-4 h-4 mr-2" />
                                    Capture {currentPose}
                                </>
                            )}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};