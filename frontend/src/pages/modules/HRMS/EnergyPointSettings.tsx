import React, { useState, useEffect } from 'react';
import { useFrappeGetCall, useFrappePostCall } from 'frappe-react-sdk';
import { Save, Loader2, Zap, CheckCircle, AlertCircle, Plus, Trash2, Settings } from 'lucide-react';
import { toast } from 'sonner';

const EnergyPointSettings = () => {
    const [settings, setSettings] = useState<any>(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null);
    const [isDataReady, setIsDataReady] = useState(false);

    // Fetch settings using the same pattern as GenericForm
    const { data: settingsData, isLoading: loading, error, mutate: refreshSettings } = useFrappeGetCall(
        'frappe.desk.form.load.getdoc',
        {
            doctype: 'Energy Point Settings',
            name: 'Energy Point Settings'
        },
        undefined,
        {
            revalidateOnFocus: false,
        }
    );

    // Update hook using frappe.client.set_value
    const { call: updateSettings, loading: saving } = useFrappePostCall('frappe.client.set_value');

    // Initialize settings when data is loaded
    useEffect(() => {
        if (settingsData?.docs?.[0]) {
            const loadedSettings = settingsData.docs[0];
            console.log('✅ Setting localFormData from docData:', loadedSettings);
            setSettings({
                ...loadedSettings,
                review_levels: loadedSettings.review_levels || []
            });
            setIsDataReady(true);
        }
    }, [settingsData]);

    const updateField = (fieldname: string, value: any) => {
        setSettings((prev: any) => ({
            ...prev,
            [fieldname]: value
        }));
        setHasChanges(true);
        setSaveStatus(null);
    };

    const addReviewLevel = () => {
        const newLevel = {
            level_name: '',
            role: '',
            review_points: 0,
            idx: settings.review_levels.length + 1
        };
        setSettings((prev: any) => ({
            ...prev,
            review_levels: [...prev.review_levels, newLevel]
        }));
        setHasChanges(true);
        setSaveStatus(null);
    };

    const removeReviewLevel = (index: number) => {
        setSettings((prev: any) => ({
            ...prev,
            review_levels: prev.review_levels.filter((_: any, i: number) => i !== index)
        }));
        setHasChanges(true);
        setSaveStatus(null);
    };

    const updateReviewLevel = (index: number, field: string, value: any) => {
        setSettings((prev: any) => ({
            ...prev,
            review_levels: prev.review_levels.map((level: any, i: number) =>
                i === index ? { ...level, [field]: value } : level
            )
        }));
        setHasChanges(true);
        setSaveStatus(null);
    };

    const handleSave = async () => {
        if (!settings) return;

        console.log('💾 Saving with values:', settings);

        try {
            // Prepare fields to update (exclude system fields like in GenericForm)
            const fieldsToUpdate: any = { ...settings };
            const systemFields = [
                'name', 'doctype', 'owner', 'creation', 'modified',
                'modified_by', 'docstatus', 'idx', '__islocal',
                '__unsaved', '__onload'
            ];

            systemFields.forEach(field => delete fieldsToUpdate[field]);

            // Call the API to update the document
            await updateSettings({
                doctype: 'Energy Point Settings',
                name: 'Energy Point Settings',
                fieldname: fieldsToUpdate
            });

            setSaveStatus('success');
            setHasChanges(false);
            toast.success('Energy Point Settings saved successfully');

            // Refresh data
            await refreshSettings();

            setTimeout(() => {
                setSaveStatus(null);
            }, 3000);
        } catch (error: any) {
            console.error('Error saving Energy Point Settings:', error);
            setSaveStatus('error');

            // Extract Frappe error message
            let errorMessage = 'Failed to save settings';
            if (error._server_messages) {
                try {
                    const messages = JSON.parse(error._server_messages);
                    const detail = JSON.parse(messages[0]);
                    errorMessage = detail.message || errorMessage;
                } catch (e) {
                    console.error('Error parsing server messages', e);
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast.error('Save Failed', {
                description: errorMessage
            });
        }
    };

    const CheckboxField = ({ label, fieldname, value, description }: any) => (
        <label className="flex items-start space-x-3 py-3 cursor-pointer group">
            <div className="relative flex-shrink-0 mt-0.5">
                <input
                    type="checkbox"
                    checked={value === 1 || value === true}
                    onChange={(e) => updateField(fieldname, e.target.checked ? 1 : 0)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all"
                />
                {(value === 1 || value === true) && (
                    <div className="absolute inset-0 bg-blue-500 rounded animate-ping opacity-20"></div>
                )}
            </div>
            <div className="flex-1">
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                    {label}
                </span>
                {description && (
                    <p className="text-xs text-gray-500 mt-1">{description}</p>
                )}
            </div>
        </label>
    );

    const SelectField = ({ label, fieldname, value, options, description }: any) => (
        <div className="animate-slideIn">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
            </label>
            <select
                value={value || ''}
                onChange={(e) => updateField(fieldname, e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white hover:border-gray-400"
            >
                {options.map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
            {description && (
                <p className="text-xs text-gray-500 mt-1.5">{description}</p>
            )}
        </div>
    );

    const InputField = ({ label, fieldname, value, type = "text", description, readOnly }: any) => (
        <div className="animate-slideIn">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
            </label>
            <input
                type={type}
                value={value || ''}
                onChange={(e) => updateField(fieldname, e.target.value)}
                readOnly={readOnly}
                className={`w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${readOnly ? 'bg-gray-50 cursor-not-allowed text-gray-600' : 'bg-white hover:border-gray-400'
                    }`}
            />
            {description && (
                <p className="text-xs text-gray-500 mt-1.5">{description}</p>
            )}
        </div>
    );

    // Loading state
    if (loading || !isDataReady) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center animate-fadeIn">
                    <div className="relative">
                        <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
                        <div className="absolute inset-0 w-16 h-16 mx-auto">
                            <Zap className="w-16 h-16 text-blue-400 animate-pulse" />
                        </div>
                    </div>
                    <p className="text-gray-700 font-semibold text-lg">Loading Energy Point Settings...</p>
                    <p className="text-gray-500 text-sm mt-1">Please wait a moment</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !settings) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center animate-fadeIn bg-white p-8 rounded-2xl shadow-xl">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4 animate-bounce" />
                    <p className="text-red-600 font-bold text-xl">Failed to load settings</p>
                    <p className="text-gray-500 text-sm mt-2">
                        {error?.message || 'Please check your connection and try again'}
                    </p>
                </div>
            </div>
        );
    }

    const isEnabled = settings.enabled === 1 || settings.enabled === true;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 animate-pulse"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>

                <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="bg-white/20 backdrop-blur-md p-3 rounded-xl shadow-lg">
                                <Zap className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
                                    <span>Energy Point Settings</span>
                                    {!hasChanges && saveStatus !== 'success' && (
                                        <span className="text-xs bg-white/20 backdrop-blur-md px-3 py-1 rounded-full font-normal">
                                            Not Saved
                                        </span>
                                    )}
                                </h1>
                                <p className="text-blue-100 mt-1">
                                    Configure energy point allocation and gamification settings
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className={`backdrop-blur-md rounded-xl px-5 py-2.5 transition-all duration-300 ${hasChanges
                                    ? 'bg-yellow-500/30 border-2 border-yellow-300/50 shadow-lg shadow-yellow-500/20'
                                    : saveStatus === 'success'
                                        ? 'bg-green-500/30 border-2 border-green-300/50 shadow-lg shadow-green-500/20'
                                        : saveStatus === 'error'
                                            ? 'bg-red-500/30 border-2 border-red-300/50 shadow-lg shadow-red-500/20'
                                            : 'bg-white/20 border-2 border-white/30'
                                }`}>
                                <span className="text-white text-sm font-semibold flex items-center space-x-2">
                                    {saveStatus === 'success' ? (
                                        <>
                                            <CheckCircle className="w-5 h-5 animate-bounce" />
                                            <span>Saved Successfully</span>
                                        </>
                                    ) : saveStatus === 'error' ? (
                                        <>
                                            <AlertCircle className="w-5 h-5 animate-pulse" />
                                            <span>Save Failed</span>
                                        </>
                                    ) : hasChanges ? (
                                        <>
                                            <AlertCircle className="w-5 h-5 animate-pulse" />
                                            <span>Unsaved Changes</span>
                                        </>
                                    ) : (
                                        <span>No Changes</span>
                                    )}
                                </span>
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={!hasChanges || saving}
                                className="bg-white text-blue-700 hover:bg-blue-50 font-bold px-8 py-2.5 rounded-xl text-sm transition-all duration-300 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl hover:scale-105 flex items-center space-x-2 disabled:scale-100"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        <span>Save Changes</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Enable Energy Points Section */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6 hover:shadow-xl transition-all duration-300 animate-fadeIn">
                    <CheckboxField
                        label="Enabled"
                        fieldname="enabled"
                        value={settings.enabled}
                        description="Activate the energy points system to gamify user engagement and track achievements"
                    />
                </div>

                {/* Conditional Content - Only show when enabled */}
                {isEnabled && (
                    <div className="space-y-6 animate-slideDown">
                        {/* Review Levels Section */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
                                    <Settings className="w-5 h-5 text-blue-600" />
                                    <span>Review Levels</span>
                                </h2>
                                <p className="text-xs text-gray-600 mt-1">Define roles and point thresholds for review approvals</p>
                            </div>

                            <div className="p-6">
                                {settings.review_levels && settings.review_levels.length > 0 ? (
                                    <div className="space-y-4">
                                        {settings.review_levels.map((level: any, index: number) => (
                                            <div
                                                key={index}
                                                className="bg-gradient-to-r from-gray-50 to-blue-50/50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300 animate-slideIn"
                                                style={{ animationDelay: `${index * 50}ms` }}
                                            >
                                                <div className="flex items-start space-x-4">
                                                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold shadow-md">
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div>
                                                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                                                Level Name <span className="text-red-500">*</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={level.level_name || ''}
                                                                onChange={(e) => updateReviewLevel(index, 'level_name', e.target.value)}
                                                                placeholder="e.g., Manager Approval"
                                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                                                Role <span className="text-red-500">*</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={level.role || ''}
                                                                onChange={(e) => updateReviewLevel(index, 'role', e.target.value)}
                                                                placeholder="Select role..."
                                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                                                            />
                                                        </div>
                                                        <div className="flex items-end space-x-2">
                                                            <div className="flex-1">
                                                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                                                    Review Points <span className="text-red-500">*</span>
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    value={level.review_points || 0}
                                                                    onChange={(e) => updateReviewLevel(index, 'review_points', parseFloat(e.target.value) || 0)}
                                                                    placeholder="0"
                                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                                                                />
                                                            </div>
                                                            <button
                                                                onClick={() => removeReviewLevel(index)}
                                                                className="px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 border border-red-200 hover:border-red-300"
                                                                title="Remove level"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 animate-fadeIn">
                                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Settings className="w-10 h-10 text-gray-400" />
                                        </div>
                                        <p className="text-gray-500 font-medium">No review levels configured</p>
                                        <p className="text-gray-400 text-sm mt-1">Add your first review level to get started</p>
                                    </div>
                                )}

                                <button
                                    onClick={addReviewLevel}
                                    className="mt-4 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-4 py-3 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span>Add Review Level</span>
                                </button>
                            </div>
                        </div>

                        {/* Point Allocation Settings */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
                                    <Zap className="w-5 h-5 text-indigo-600" />
                                    <span>Point Allocation Settings</span>
                                </h2>
                                <p className="text-xs text-gray-600 mt-1">Configure how and when points are distributed</p>
                            </div>

                            <div className="p-6 space-y-5">
                                <SelectField
                                    label="Point Allocation Periodicity"
                                    fieldname="point_allocation_periodicity"
                                    value={settings.point_allocation_periodicity}
                                    options={['Daily', 'Weekly', 'Monthly']}
                                    description="Set how frequently energy points are allocated to users"
                                />

                                <InputField
                                    label="Last Point Allocation Date"
                                    fieldname="last_point_allocation_date"
                                    value={settings.last_point_allocation_date}
                                    type="date"
                                    readOnly={true}
                                    description="The date when points were last allocated (automatically updated by the system)"
                                />
                            </div>
                        </div>

                        {/* Info Card */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 shadow-lg animate-fadeIn">
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <Zap className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-blue-900 mb-2">
                                        About Energy Points System
                                    </h3>
                                    <p className="text-sm text-blue-800 leading-relaxed">
                                        Energy points gamify user engagement and track contributions across your platform.
                                        Configure review levels to define approval hierarchies, and set allocation periods
                                        to automatically distribute points. The system helps motivate users and recognize
                                        their achievements in a meaningful way.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Disabled State Message */}
                {!isEnabled && (
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center animate-fadeIn">
                        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                            <Zap className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-700 mb-2">Energy Points Disabled</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            Enable energy points above to configure review levels, allocation settings, and start tracking user achievements.
                        </p>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out forwards;
                }

                .animate-slideIn {
                    animation: slideIn 0.4s ease-out forwards;
                }

                .animate-slideDown {
                    animation: slideDown 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default EnergyPointSettings;