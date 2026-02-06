import React, { useState, useEffect } from 'react';
import { useFrappeGetCall, useFrappePostCall } from 'frappe-react-sdk';
import { Save, ChevronDown, ChevronRight, Loader2, Settings, CheckCircle, AlertCircle } from 'lucide-react';

const HRSettings = () => {
    const [settings, setSettings] = useState(null);
    const [expandedSections, setExpandedSections] = useState({
        employeeSettings: true,
        reminders: false,
        leaveExpense: false,
        shiftSettings: false,
        hiringSettings: false,
        employeeExit: false,
        attendance: false,
        unlinkPayment: false
    });
    const [hasChanges, setHasChanges] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null);

    // API Hooks - Using built-in Frappe methods
    const { data: settingsData, isLoading: loading, error } = useFrappeGetCall(
        'frappe.client.get',
        {
            doctype: 'HR Settings',
            name: 'HR Settings'
        },
        undefined,
        {
            revalidateOnFocus: false,
        }
    );

    const { call: updateSettings, loading: saving } = useFrappePostCall(
        'frappe.client.set_value'
    );

    // Initialize settings when data is loaded
    useEffect(() => {
        if (settingsData?.message) {
            setSettings(settingsData.message);
        }
    }, [settingsData]);

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const updateField = (fieldname, value) => {
        setSettings(prev => ({
            ...prev,
            [fieldname]: value
        }));
        setHasChanges(true);
        setSaveStatus(null);
    };

    const handleSave = async () => {
        if (!settings) return;

        try {
            // Prepare fields to update (exclude system fields)
            const fieldsToUpdate = { ...settings };
            const systemFields = [
                'name', 'doctype', 'owner', 'creation', 'modified',
                'modified_by', 'docstatus', 'idx', '__islocal',
                '__unsaved', '__onload'
            ];

            systemFields.forEach(field => delete fieldsToUpdate[field]);

            await updateSettings({
                doctype: 'HR Settings',
                name: 'HR Settings',
                fieldname: fieldsToUpdate
            });

            setSaveStatus('success');
            setHasChanges(false);

            setTimeout(() => {
                setSaveStatus(null);
            }, 3000);
        } catch (error) {
            console.error('Error saving HR Settings:', error);
            setSaveStatus('error');
        }
    };

    const Section = ({ title, sectionKey, children }) => (
        <div className="mb-4 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md animate-fadeIn">
            <button
                onClick={() => toggleSection(sectionKey)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors group"
            >
                <span className="text-base font-semibold text-gray-800 group-hover:text-cyan-600 transition-colors">
                    {title}
                </span>
                <div className="flex items-center space-x-2">
                    {expandedSections[sectionKey] ? (
                        <ChevronDown className="w-4 h-4 text-gray-500 transition-transform" />
                    ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500 transition-transform" />
                    )}
                </div>
            </button>
            {expandedSections[sectionKey] && (
                <div className="p-4 border-t border-gray-200 animate-slideDown">
                    {children}
                </div>
            )}
        </div>
    );

    const CheckboxField = ({ label, fieldname, value, description }) => (
        <label className="flex items-start space-x-3 py-2 cursor-pointer group">
            <div className="relative flex-shrink-0 mt-0.5">
                <input
                    type="checkbox"
                    checked={value || false}
                    onChange={(e) => updateField(fieldname, e.target.checked ? 1 : 0)}
                    className="w-4 h-4 text-cyan-600 rounded focus:ring-2 focus:ring-cyan-500 cursor-pointer transition-all"
                />
            </div>
            <div className="flex-1">
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                    {label}
                </span>
                {description && (
                    <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                )}
            </div>
        </label>
    );

    const SelectField = ({ label, fieldname, value, options, description, required }) => (
        <div className="mb-4 animate-fadeIn">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
                value={value || ''}
                onChange={(e) => updateField(fieldname, e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
            >
                {options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
            {description && (
                <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
        </div>
    );

    const InputField = ({ label, fieldname, value, type = "text", description, required, readOnly }) => (
        <div className="mb-4 animate-fadeIn">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
                type={type}
                value={value || ''}
                onChange={(e) => updateField(fieldname, type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                readOnly={readOnly}
                className={`w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all ${readOnly ? 'bg-gray-50 cursor-not-allowed' : ''
                    }`}
            />
            {description && (
                <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
        </div>
    );

    const LinkField = ({ label, fieldname, value, description, required }) => (
        <div className="mb-4 animate-fadeIn">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
                type="text"
                value={value || ''}
                onChange={(e) => updateField(fieldname, e.target.value)}
                placeholder="Select..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
            />
            {description && (
                <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center animate-fadeIn">
                    <Loader2 className="w-12 h-12 text-cyan-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading HR Settings...</p>
                </div>
            </div>
        );
    }

    if (error || !settings) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center animate-fadeIn">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 font-medium">Failed to load HR Settings</p>
                    <p className="text-gray-500 text-sm mt-2">Please check your connection and try again</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-400 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-semibold text-white flex items-center space-x-2">
                                <Settings className="w-5 h-5" />
                                <span>HR Settings</span>
                            </h1>
                            <p className="text-sm text-blue-100 mt-0.5">
                                Configure HR module settings and preferences
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className={`backdrop-blur-sm rounded px-3 py-1.5 transition-all ${hasChanges
                                ? 'bg-yellow-500/20 border border-yellow-400/30'
                                : saveStatus === 'success'
                                    ? 'bg-green-500/20 border border-green-400/30'
                                    : 'bg-white/20'
                                }`}>
                                <span className="text-white text-sm font-medium flex items-center space-x-1.5">
                                    {saveStatus === 'success' ? (
                                        <>
                                            <CheckCircle className="w-4 h-4" />
                                            <span>Saved</span>
                                        </>
                                    ) : hasChanges ? (
                                        <>
                                            <AlertCircle className="w-4 h-4" />
                                            <span>Not Saved</span>
                                        </>
                                    ) : (
                                        <span>No Changes</span>
                                    )}
                                </span>
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={!hasChanges || saving}
                                className="bg-white text-cyan-600 hover:bg-gray-50 font-medium px-6 py-2 rounded text-sm transition-all disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex items-center space-x-2"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>Save</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* Employee Settings - Always Expanded */}
                <div className="mb-4 bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-fadeIn">
                    <h2 className="text-base font-semibold text-gray-800 mb-4">Employee Settings</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <SelectField
                            label="Employee Naming By"
                            fieldname="emp_created_by"
                            value={settings.emp_created_by}
                            options={['Naming Series', 'Employee Number', 'Full Name']}
                            description="Employee records are created using the selected option" required={undefined} />
                        <InputField
                            label="Retirement Age (In Years)"
                            fieldname="retirement_age"
                            value={settings.retirement_age}
                            type="number" description={undefined} required={undefined} readOnly={undefined} />
                        <InputField
                            label="Standard Working Hours"
                            fieldname="standard_working_hours"
                            value={settings.standard_working_hours}
                            type="number" description={undefined} required={undefined} readOnly={undefined} />
                    </div>
                </div>

                {/* Reminders */}
                <Section title="Reminders" sectionKey="reminders">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <CheckboxField
                                label="Work Anniversaries"
                                fieldname="send_work_anniversary_reminders"
                                value={settings.send_work_anniversary_reminders} description={undefined} />
                            <CheckboxField
                                label="Birthdays"
                                fieldname="send_birthday_reminders"
                                value={settings.send_birthday_reminders} description={undefined} />
                            <CheckboxField
                                label="Holidays"
                                fieldname="send_holiday_reminders"
                                value={settings.send_holiday_reminders} description={undefined} />
                            {settings.send_holiday_reminders === 1 && (
                                <SelectField
                                    label="Set the frequency for holiday reminders"
                                    fieldname="frequency"
                                    value={settings.frequency}
                                    options={['Weekly', 'Monthly']} description={undefined} required={undefined} />
                            )}
                        </div>
                        <div>
                            <LinkField
                                label="Sender"
                                fieldname="sender"
                                value={settings.sender}
                                description="Email Account" required={undefined} />
                            <InputField
                                label="Sender Email"
                                fieldname="sender_email"
                                value={settings.sender_email}
                                readOnly={true} description={undefined} required={undefined} />
                        </div>
                    </div>
                </Section>

                {/* Leave and Expense Claim Settings */}
                <Section title="Leave and Expense Claim Settings" sectionKey="leaveExpense">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <CheckboxField
                                label="Send Leave Notification"
                                fieldname="send_leave_notification"
                                value={settings.send_leave_notification} description={undefined} />
                            {settings.send_leave_notification === 1 && (
                                <>
                                    <LinkField
                                        label="Leave Approval Notification Template"
                                        fieldname="leave_approval_notification_template"
                                        value={settings.leave_approval_notification_template}
                                        required={true} description={undefined} />
                                    <LinkField
                                        label="Leave Status Notification Template"
                                        fieldname="leave_status_notification_template"
                                        value={settings.leave_status_notification_template}
                                        required={true} description={undefined} />
                                </>
                            )}
                            <CheckboxField
                                label="Leave Approver Mandatory In Leave Application"
                                fieldname="leave_approver_mandatory_in_leave_application"
                                value={settings.leave_approver_mandatory_in_leave_application} description={undefined} />
                            <CheckboxField
                                label="Restrict Backdated Leave Application"
                                fieldname="restrict_backdated_leave_application"
                                value={settings.restrict_backdated_leave_application} description={undefined} />
                            {settings.restrict_backdated_leave_application === 1 && (
                                <LinkField
                                    label="Role Allowed to Create Backdated Leave Application"
                                    fieldname="role_allowed_to_create_backdated_leave_application"
                                    value={settings.role_allowed_to_create_backdated_leave_application}
                                    required={true} description={undefined} />
                            )}
                            <CheckboxField
                                label="Prevent self approval for leaves even if user has permissions"
                                fieldname="prevent_self_leave_approval"
                                value={settings.prevent_self_leave_approval} description={undefined} />
                            <CheckboxField
                                label="Prevent self approval for expense claims even if user has permissions"
                                fieldname="prevent_self_expense_approval"
                                value={settings.prevent_self_expense_approval} description={undefined} />
                        </div>
                        <div className="space-y-2">
                            <CheckboxField
                                label="Expense Approver Mandatory In Expense Claim"
                                fieldname="expense_approver_mandatory_in_expense_claim"
                                value={settings.expense_approver_mandatory_in_expense_claim} description={undefined} />
                            <CheckboxField
                                label="Show Leaves Of All Department Members In Calendar"
                                fieldname="show_leaves_of_all_department_members_in_calendar"
                                value={settings.show_leaves_of_all_department_members_in_calendar} description={undefined} />
                            <CheckboxField
                                label="Auto Leave Encashment"
                                fieldname="auto_leave_encashment"
                                value={settings.auto_leave_encashment} description={undefined} />
                        </div>
                    </div>
                </Section>

                {/* Shift Settings */}
                <Section title="Shift Settings" sectionKey="shiftSettings">
                    <CheckboxField
                        label="Allow Multiple Shift Assignments for Same Date"
                        fieldname="allow_multiple_shift_assignments"
                        value={settings.allow_multiple_shift_assignments} description={undefined} />
                </Section>

                {/* Hiring Settings */}
                <Section title="Hiring Settings" sectionKey="hiringSettings">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <CheckboxField
                                label="Check Vacancies On Job Offer Creation"
                                fieldname="check_vacancies"
                                value={settings.check_vacancies} description={undefined} />
                            <CheckboxField
                                label="Send Interview Reminder"
                                fieldname="send_interview_reminder"
                                value={settings.send_interview_reminder} description={undefined} />
                            {settings.send_interview_reminder === 1 && (
                                <>
                                    <LinkField
                                        label="Interview Reminder Notification Template"
                                        fieldname="interview_reminder_template"
                                        value={settings.interview_reminder_template}
                                        required={true} description={undefined} />
                                    <InputField
                                        label="Remind Before"
                                        fieldname="remind_before"
                                        value={settings.remind_before}
                                        type="time" description={undefined} required={undefined} readOnly={undefined} />
                                </>
                            )}
                            <CheckboxField
                                label="Send Interview Feedback Reminder"
                                fieldname="send_interview_feedback_reminder"
                                value={settings.send_interview_feedback_reminder} description={undefined} />
                            {settings.send_interview_feedback_reminder === 1 && (
                                <LinkField
                                    label="Feedback Reminder Notification Template"
                                    fieldname="feedback_reminder_notification_template"
                                    value={settings.feedback_reminder_notification_template}
                                    required={true} description={undefined} />
                            )}
                        </div>
                        <div>
                            <LinkField
                                label="Sender"
                                fieldname="hiring_sender"
                                value={settings.hiring_sender}
                                description="Email Account" required={undefined} />
                            <InputField
                                label="Sender Email"
                                fieldname="hiring_sender_email"
                                value={settings.hiring_sender_email}
                                readOnly={true} description={undefined} required={undefined} />
                        </div>
                    </div>
                </Section>

                {/* Employee Exit Settings */}
                <Section title="Employee Exit Settings" sectionKey="employeeExit">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <LinkField
                            label="Exit Questionnaire Web Form"
                            fieldname="exit_questionnaire_web_form"
                            value={settings.exit_questionnaire_web_form} description={undefined} required={undefined} />
                        <LinkField
                            label="Exit Questionnaire Notification Template"
                            fieldname="exit_questionnaire_notification_template"
                            value={settings.exit_questionnaire_notification_template} description={undefined} required={undefined} />
                    </div>
                </Section>

                {/* Attendance Settings */}
                <Section title="Attendance Settings" sectionKey="attendance">
                    <div className="space-y-2">
                        <CheckboxField
                            label="Allow Employee Checkin from Mobile App"
                            fieldname="allow_employee_checkin_from_mobile_app"
                            value={settings.allow_employee_checkin_from_mobile_app} description={undefined} />
                        <CheckboxField
                            label="Allow Geolocation Tracking"
                            fieldname="allow_geolocation_tracking"
                            value={settings.allow_geolocation_tracking} description={undefined} />
                    </div>
                </Section>

                {/* Unlink Payment */}
                <Section title="Unlink Payment" sectionKey="unlinkPayment">
                    <CheckboxField
                        label="Unlink Payment on Cancellation of Employee Advance"
                        fieldname="unlink_payment_on_cancellation_of_employee_advance"
                        value={settings.unlink_payment_on_cancellation_of_employee_advance} description={undefined} />
                </Section>
            </div>

            <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            max-height: 2000px;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
          opacity: 0;
        }

        .animate-slideDown {
          animation: slideDown 0.4s ease-out forwards;
        }
      `}</style>
        </div>
    );
};

export default HRSettings;