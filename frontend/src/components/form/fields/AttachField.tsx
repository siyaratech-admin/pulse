/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Upload, X, File as FileIcon, AlertCircle, CheckCircle, Loader2, Camera, Library, Download, RefreshCw } from 'lucide-react';
import type { FormFieldProps } from '../../../types/form';
import { cn } from '../../../lib/utils';
import heic2any from 'heic2any';
import { GeoTaggedCamera } from "@/components/common/GeoTaggedCamera";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface AttachFieldProps extends FormFieldProps {
    accept?: string;
    maxSizeBytes?: number;
    uniqueId?: string;
    showLabel?: boolean;
}

import { FieldWrapper } from '../../ui/form/FieldWrapper';

export const AttachField: React.FC<AttachFieldProps> = ({
    field,
    value,
    onChange,
    error,
    disabled,
    className,
    maxSizeBytes = 10 * 1024 * 1024,
    uniqueId,
    showLabel = true,
}) => {
    // --- State ---
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<string>('');

    // Modal states
    const [showOptionsModal, setShowOptionsModal] = useState(false);
    const [showCameraModal, setShowCameraModal] = useState(false);
    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationAddress, setLocationAddress] = useState<string>('Detecting location...');

    // Preview before upload state
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [showPreviewDialog, setShowPreviewDialog] = useState(false);

    const isImageField = field.fieldtype === 'Attach Image';
    const allowedExtensions = isImageField
        ? ['.jpg', '.jpeg', '.png', '.heic', '.webp']
        : undefined; // undefined = accept all, or you can specify ['.pdf', '.doc', ...]

    const inputId = uniqueId || `file-input-${field.fieldname}`;

    // --- Geolocation ---
    const fetchLocation = () => {
        setLocationAddress('Detecting location...');
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    setCurrentLocation(location);

                    // Reverse geocode to get address
                    try {
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?lat=${location.lat}&lon=${location.lng}&format=json`
                        );
                        const data = await response.json();
                        setLocationAddress(data.display_name || 'Location detected');
                    } catch (err) {
                        console.error('Failed to fetch address:', err);
                        setLocationAddress(`${location.lat.toFixed(6)}°N, ${location.lng.toFixed(6)}°E`);
                    }
                },
                (err) => {
                    console.error("Location access denied:", err);
                    setLocationAddress('Location unavailable');
                    toast.error('Location access denied. Please enable location permissions.');
                }
            );
        } else {
            setLocationAddress('Location not supported');
            toast.error('Geolocation is not supported by your browser.');
        }
    };

    // --- File Handling ---
    const handleFileSelect = useCallback(async (file: File, fromCamera: boolean = false) => {
        // If from camera, show preview dialog
        if (fromCamera) {
            setPendingFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setShowCameraModal(false);
            setShowPreviewDialog(true);
            return;
        }

        // For library uploads, process immediately
        await processFileUpload(file);
    }, []);

    const processFileUpload = async (file: File) => {
        setUploadStatus('uploading');
        setUploadError(null);
        setIsLoadingPreview(true);
        setUploadProgress('Preparing file...');
        setShowPreviewDialog(false);
        setPendingFile(null);

        let fileToUpload = file;

        // HEIC Conversion
        if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
            try {
                setUploadProgress('Converting image...');
                const convertedBlob = await heic2any({ blob: file, toType: 'image/png' });
                const resultBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
                fileToUpload = new File([resultBlob], file.name.replace(/\.heic$/i, '.png'), { type: 'image/png' });
                setPreviewUrl(URL.createObjectURL(resultBlob));
            } catch (err) {
                setUploadStatus('error');
                setUploadError('Image conversion failed.');
                setIsLoadingPreview(false);
                toast.error('Failed to convert image format');
                return;
            }
        } else {
            setPreviewUrl(URL.createObjectURL(file));
        }

        // Upload
        try {
            setUploadProgress('Uploading to server...');
            const formData = new FormData();
            formData.append('file', fileToUpload);
            formData.append('is_private', '0');
            formData.append('folder', 'Home');

            const response = await fetch('/api/method/upload_file', {
                method: 'POST',
                headers: {
                    'X-Frappe-CSRF-Token': (window as any).frappe?.csrf_token || '',
                    Accept: 'application/json',
                },
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');
            const result = await response.json();

            if (result.message?.file_url) {
                setUploadStatus('success');
                onChange(result.message.file_url);
                toast.success('File uploaded successfully!');
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (err: any) {
            setUploadStatus('error');
            setUploadError(err.message || 'Upload failed');
            toast.error('Failed to upload file');
        } finally {
            setIsLoadingPreview(false);
            setUploadProgress('');
        }
    };

    const handleCameraCapture = (file: File) => {
        handleFileSelect(file, true);
    };

    const handleSubmitFromPreview = () => {
        if (pendingFile) {
            processFileUpload(pendingFile);
        }
    };

    const handleRetakeFromPreview = () => {
        setShowPreviewDialog(false);
        setPendingFile(null);
        setPreviewUrl(null);
        // Reopen camera
        setTimeout(() => {
            fetchLocation();
            setShowCameraModal(true);
        }, 100);
    };

    const handleDownloadPreview = () => {
        if (!previewUrl || !pendingFile) return;

        const link = document.createElement('a');
        link.href = previewUrl;
        link.download = pendingFile.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('Image downloaded successfully!');
    };

    const handleRemove = () => {
        onChange(null);
        setUploadStatus('idle');
        setPreviewUrl(null);
        setPendingFile(null);
        toast.info('Attachment removed');
    };

    const handleCancelPreview = () => {
        setShowPreviewDialog(false);
        setPendingFile(null);
        setPreviewUrl(null);
    };

    const currentFileUrl = typeof value === 'string' ? value : null;

    // Cleanup preview URLs
    useEffect(() => {
        return () => {
            if (previewUrl && !currentFileUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl, currentFileUrl]);

    return (
        <FieldWrapper
            fieldname={field.fieldname}
            label={showLabel ? (field.label || '') : undefined}
            required={field.reqd || false}
            description={field.description}
            error={error || uploadError || undefined}
            disabled={disabled}
            className={className}
        >
            <div className="space-y-3">
                {/* Original Dropzone UI */}
                {!currentFileUrl && uploadStatus !== 'uploading' && !isLoadingPreview && (
                    <div
                        className={cn(
                            "transition-all cursor-pointer",
                            showLabel
                                ? "border-2 border-dashed rounded-lg p-8 text-center border-gray-300 hover:border-orange-400 hover:bg-orange-50"
                                : "border border-dashed rounded-md p-3 text-center border-gray-300 hover:border-orange-400 hover:bg-orange-50 flex items-center justify-center gap-2",
                            disabled && "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                        )}
                        onClick={() => !disabled && setShowOptionsModal(true)}
                        title="Click to upload"
                    >
                        <Upload className={cn("text-gray-400", showLabel ? "mx-auto h-12 w-12 mb-3" : "h-4 w-4")} />
                        {showLabel ? (
                            <>
                                <p className="text-sm font-semibold text-gray-700 mb-1">
                                    Click to upload attachment
                                </p>
                                <p className="text-xs text-gray-500">
                                    JPG, PNG or HEIC (max {(maxSizeBytes / (1024 * 1024)).toFixed(0)}MB)
                                </p>
                            </>
                        ) : (
                            <span className="text-xs text-muted-foreground whitespace-nowrap">Upload</span>
                        )}
                    </div>
                )}

                {/* Loading State */}
                {(uploadStatus === 'uploading' || isLoadingPreview) && (
                    <div className="border border-orange-200 rounded-lg p-8 bg-orange-50 flex flex-col items-center justify-center space-y-3">
                        <Loader2 className="h-12 w-12 animate-spin text-orange-600" />
                        <p className="text-sm font-medium text-orange-900">{uploadProgress}</p>
                        <div className="w-48 h-1.5 bg-orange-200 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-600 rounded-full animate-pulse w-3/4" />
                        </div>
                    </div>
                )}

                {/* Success/Preview State */}
                {currentFileUrl && uploadStatus !== 'uploading' && (
                    <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-green-500 rounded-full">
                                    <CheckCircle className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <span className="text-sm font-semibold text-green-900 block truncate max-w-[250px]">
                                        {currentFileUrl.split('/').pop()}
                                    </span>
                                    <span className="text-xs text-green-700">Upload successful</span>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleRemove}
                                className="text-green-700 hover:text-red-600 hover:bg-red-50"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <div className="rounded-lg overflow-hidden border-2 border-green-300 bg-white shadow-sm">
                            <img
                                src={currentFileUrl}
                                alt="Uploaded preview"
                                className="max-w-full h-auto max-h-80 object-contain mx-auto"
                            />
                        </div>
                    </div>
                )}

                {/* Hidden file input */}
                <input
                    id={inputId}
                    type="file"
                    accept={allowedExtensions?.join(',')}
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], false)}
                    className="hidden"
                />
            </div>

            {/* Selection Modal */}
            <Dialog open={showOptionsModal} onOpenChange={setShowOptionsModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">Upload Photo</DialogTitle>
                        <p className="text-sm text-gray-500 mt-1">Choose your preferred capture method</p>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-6">
                        <button
                            onClick={() => {
                                fetchLocation();
                                setShowOptionsModal(false);
                                setShowCameraModal(true);
                            }}
                            className="flex flex-col items-center justify-center p-8 border-2 border-gray-200 rounded-2xl hover:border-orange-500 hover:bg-orange-50 hover:shadow-lg transition-all group"
                        >
                            <div className="p-4 bg-orange-100 rounded-full mb-3 group-hover:scale-110 group-hover:bg-orange-200 transition-all">
                                <Camera className="h-10 w-10 text-orange-600" />
                            </div>
                            <span className="font-bold text-gray-800 group-hover:text-orange-600">Camera</span>
                            <span className="text-xs text-gray-500 mt-1">Take new photo</span>
                        </button>

                        <button
                            onClick={() => {
                                document.getElementById(inputId)?.click();
                                setShowOptionsModal(false);
                            }}
                            className="flex flex-col items-center justify-center p-8 border-2 border-gray-200 rounded-2xl hover:border-amber-500 hover:bg-amber-50 hover:shadow-lg transition-all group"
                        >
                            <div className="p-4 bg-amber-100 rounded-full mb-3 group-hover:scale-110 group-hover:bg-amber-200 transition-all">
                                <Library className="h-10 w-10 text-amber-600" />
                            </div>
                            <span className="font-bold text-gray-800 group-hover:text-amber-600">Library</span>
                            <span className="text-xs text-gray-500 mt-1">Choose from device</span>
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Camera Dialog */}
            <Dialog open={showCameraModal} onOpenChange={setShowCameraModal}>
                <DialogContent className="sm:max-w-5xl p-0 overflow-hidden bg-black border-none">
                    <DialogHeader className="p-4 absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent">
                        <DialogTitle className="text-white text-lg">Capture Geo-Tagged Photo</DialogTitle>
                        <p className="text-xs text-gray-300 mt-1">Photo will include location and timestamp</p>
                    </DialogHeader>
                    <div className="w-full p-4 pt-20">
                        <GeoTaggedCamera
                            onCapture={handleCameraCapture}
                            onSubmit={handleSubmitFromPreview}
                            location={currentLocation}
                            address={locationAddress}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Preview Dialog (shown after camera capture, before upload) */}
            <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">Review Your Photo</DialogTitle>
                        <p className="text-sm text-gray-500 mt-1">Review the captured image before uploading</p>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Image Preview */}
                        {previewUrl && (
                            <div className="rounded-lg overflow-hidden border-2 border-orange-200 bg-orange-50/30">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="w-full h-auto max-h-[400px] object-contain mx-auto"
                                />
                            </div>
                        )}

                        {/* Location Details */}
                        {currentLocation && (
                            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                                <h4 className="text-sm font-semibold text-orange-900 mb-3">Embedded Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-orange-600 mb-1">Coordinates</p>
                                        <p className="text-orange-900 font-mono text-xs">
                                            {currentLocation.lat.toFixed(6)}°N, {currentLocation.lng.toFixed(6)}°E
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-orange-600 mb-1">Timestamp</p>
                                        <p className="text-orange-900 text-xs">
                                            {new Date().toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="text-orange-600 mb-1">Location</p>
                                        <p className="text-orange-900 text-xs">{locationAddress}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 pt-2">
                            <Button
                                onClick={handleRetakeFromPreview}
                                variant="outline"
                                className="flex-1 min-w-[120px] border-orange-200 text-orange-700 hover:bg-orange-50"
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Retake
                            </Button>

                            <Button
                                onClick={handleDownloadPreview}
                                variant="outline"
                                className="flex-1 min-w-[120px] border-amber-200 text-amber-700 hover:bg-amber-50"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Download
                            </Button>

                            <Button
                                onClick={handleCancelPreview}
                                variant="outline"
                                className="flex-1 min-w-[120px]"
                            >
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                            </Button>

                            <Button
                                onClick={handleSubmitFromPreview}
                                className="flex-1 min-w-[120px] bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                            >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Upload
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </FieldWrapper>
    );
};