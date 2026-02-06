import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useFrappeGetDoc, useFrappeGetDocList, useFrappeCreateDoc, useFrappeUpdateDoc } from 'frappe-react-sdk';
import { ArrowLeft, Camera, Loader2, CheckCircle, BadgeCheck } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FaceEnrollmentWizard } from '@/components/face_reco/FaceEnrollmentWizard';
import { FaceVerifyModal } from '@/components/face_reco/FaceVerifyModal';
import { LinkField } from '@/components/form/fields/SelectionFields';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const FaceEnrollment = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // -- Derived State from URL --
    const urlType = searchParams.get('type') || 'Employee';
    const urlId = searchParams.get('id') || '';

    // -- Form State --
    const [formData, setFormData] = useState({
        user_type: urlType,
        employee: urlType === 'Employee' ? urlId : '',
        labour: urlType === 'Labour' ? urlId : '',
        user_name: '',
        enrollment_image: '',
        face_encodings: '',
        name: '' // Docname if editing
    });

    // -- UI State --
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [isVerifyOpen, setIsVerifyOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    // Helper to get current ID based on current form Type
    // Note: We use formData here to allow manual switching, not just URL
    const currentType = formData.user_type;
    const currentId = currentType === 'Employee' ? formData.employee : formData.labour;

    // -- Data Fetching Hooks --

    // 1. Fetch Person Details (Employee or Labour Onboarding)
    const { data: personData, isLoading: personLoading } = useFrappeGetDoc(
        currentType === 'Labour' ? 'Labour Onboarding' : 'Employee',
        currentId || null // Pass null to skip fetch if no ID
    );

    // 2. Check for Existing Enrollment
    const { data: enrollmentList, isLoading: enrollmentLoading } = useFrappeGetDocList(
        'Employee Face Enrollment',
        {
            fields: ['name', 'enrollment_image', 'face_encodings', 'modified'],
            filters: [
                ['user_type', '=', currentType],
                [currentType === 'Labour' ? 'labour' : 'employee', '=', currentId]
            ],
            limit: 1
        }
    );


    // -- Effect: Sync Data to Form --
    useEffect(() => {
        console.log("Sync Effect Triggered:", { currentId, currentType, enrollmentList, enrollmentLoading });

        if (!currentId) {
            // Reset derived fields if no ID
            setFormData(prev => ({
                ...prev,
                user_name: '',
                enrollment_image: '',
                face_encodings: '',
                name: ''
            }));
            return;
        }

        // 1. Sync User Name
        if (personData) {
            const name = currentType === 'Labour' ? personData.full_name : personData.employee_name;
            if (name !== formData.user_name) {
                setFormData(prev => ({ ...prev, user_name: name || '' }));
            }
        }

        // 2. Sync Enrollment Data
        if (enrollmentList && enrollmentList.length > 0) {
            const doc = enrollmentList[0];
            // Only update if changed to avoid loops if objects are new instances
            if (doc.name !== formData.name) {
                console.log("Found Enrollment:", doc);
                setFormData(prev => ({
                    ...prev,
                    enrollment_image: doc.enrollment_image,
                    face_encodings: doc.face_encodings,
                    name: doc.name
                }));
            }
        } else if (!enrollmentLoading && (!enrollmentList || enrollmentList.length === 0)) {
            // Reset if loaded and not found
            if (formData.name) {
                console.log("No Enrollment Found. Resetting.");
                setFormData(prev => ({
                    ...prev,
                    enrollment_image: '', // keep user_name though
                    face_encodings: '',
                    name: ''
                }));
            }
        }

    }, [currentId, currentType, personData, enrollmentList, enrollmentLoading]);


    // -- Handlers --

    const handleUserTypeChange = (val: string) => {
        // Update URL to reflect change (cleaner UX)
        // setSearchParams({ type: val }); // Optional: Sync URL
        setFormData(prev => ({
            ...prev,
            user_type: val,
            employee: '',
            labour: '',
            user_name: '',
            enrollment_image: '',
            face_encodings: '',
            name: ''
        }));
    };

    const handleIdChange = (val: string) => {
        // Sync to URL? setSearchParams({ id: val, type: currentType });
        setFormData(prev => ({
            ...prev,
            [currentType === 'Employee' ? 'employee' : 'labour']: val
        }));
    };

    const handleWizardComplete = (data: { encodings: any[], image: string }) => {
        setIsWizardOpen(false);
        setFormData(prev => ({
            ...prev,
            face_encodings: JSON.stringify(data.encodings),
            enrollment_image: data.image
        }));
    };

    const { createDoc } = useFrappeCreateDoc();
    const { updateDoc } = useFrappeUpdateDoc();

    const handleSave = async () => {
        if (!formData.face_encodings) {
            alert("Please complete face enrollment first.");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                user_type: formData.user_type,
                employee: formData.user_type === 'Employee' ? formData.employee : undefined,
                labour: formData.user_type === 'Labour' ? formData.labour : undefined,
                user_name: formData.user_name,
                enrollment_image: formData.enrollment_image,
                face_encodings: formData.face_encodings
            };

            if (formData.name) {
                await updateDoc('Employee Face Enrollment', formData.name, payload);
            } else {
                const res = await createDoc('Employee Face Enrollment', payload);
                setFormData(prev => ({ ...prev, name: res.name }));
            }

            alert("Saved Successfully!");
            // window.location.reload(); // Optional, or just let state reflect key
        } catch (e) {
            console.error(e);
            alert("Failed to save.");
        } finally {
            setSaving(false);
        }
    };


    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-2xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <h1 className="text-2xl font-bold tracking-tight">Face Enrollment Form</h1>
                    </div>
                    {/* Debug: {formData.name ? 'Has Name' : 'No Name'} | {formData.face_encodings ? 'Has Encodings' : 'No Encodings'} */}

                    {formData.face_encodings && formData.name && (
                        <Button onClick={() => setIsVerifyOpen(true)} className="bg-green-600 hover:bg-green-700">
                            <BadgeCheck className="w-4 h-4 mr-2" />
                            Verify Accuracy
                        </Button>
                    )}

                </div>

                <Card>
                    <CardContent className="p-6 space-y-6">

                        {/* User Type */}
                        <div className="space-y-2">
                            <Label>User Type</Label>
                            <Select
                                value={formData.user_type}
                                onValueChange={handleUserTypeChange}
                                disabled={!!formData.name}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Employee">Employee</SelectItem>
                                    <SelectItem value="Labour">Labour</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* ID Link Field */}
                        <div className="space-y-2">
                            <Label>{formData.user_type}</Label>
                            <LinkField
                                field={{
                                    fieldname: formData.user_type === 'Employee' ? 'employee' : 'labour',
                                    label: formData.user_type,
                                    options: formData.user_type === 'Labour' ? 'Labour Onboarding' : 'Employee',
                                    fieldtype: 'Link',
                                    reqd: 1
                                }}
                                value={currentId}
                                onChange={handleIdChange}
                                disabled={!!formData.name}
                            />
                        </div>

                        {/* User Name (Read Only) */}
                        <div className="space-y-2">
                            <Label>User Name</Label>
                            <div className="relative">
                                <Input
                                    value={formData.user_name}
                                    readOnly
                                    className="bg-slate-50"
                                    placeholder={personLoading ? "Loading..." : ""}
                                />
                                {personLoading && (
                                    <div className="absolute right-3 top-2.5">
                                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Enrollment Section */}
                        <div className="pt-4 border-t">
                            <div className="flex items-center justify-between mb-4">
                                <Label className="text-base">Biometric Data</Label>
                                {formData.face_encodings && (
                                    <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Captured
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                                {formData.enrollment_image ? (
                                    <Avatar className="w-32 h-32 border-4 border-white shadow-sm">
                                        <AvatarImage src={
                                            formData.enrollment_image.startsWith('data:')
                                                ? formData.enrollment_image
                                                : formData.enrollment_image // Use relative path (files are served from root)
                                        } />
                                        <AvatarFallback className="text-3xl">
                                            {formData.user_name?.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                ) : (
                                    <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                                        <Camera className="w-12 h-12" />
                                    </div>
                                )}

                                <Button
                                    onClick={() => setIsWizardOpen(true)}
                                    disabled={!currentId}
                                    variant={formData.face_encodings ? "outline" : "default"}
                                    className="min-w-[200px]"
                                >
                                    <Camera className="w-4 h-4 mr-2" />
                                    {formData.face_encodings ? "Retake Photos" : "Start Camera"}
                                </Button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-4 flex justify-end gap-2">
                            <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
                            <Button
                                onClick={handleSave}
                                disabled={saving || !formData.face_encodings}
                                className="bg-indigo-600 hover:bg-indigo-700"
                            >
                                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {formData.name ? "Update Enrollment" : "Save Enrollment"}
                            </Button>
                        </div>

                    </CardContent>
                </Card>

            </div>

            <FaceEnrollmentWizard
                isOpen={isWizardOpen}
                onClose={() => setIsWizardOpen(false)}
                onComplete={handleWizardComplete}
                userType={formData.user_type}
                userName={formData.user_name}
            />

            <FaceVerifyModal
                isOpen={isVerifyOpen}
                onClose={() => setIsVerifyOpen(false)}
                encodings={formData.face_encodings}
            />
        </div>
    );
};

export default FaceEnrollment;