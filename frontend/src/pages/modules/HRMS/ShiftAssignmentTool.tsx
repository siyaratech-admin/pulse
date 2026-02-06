import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useFrappeGetCall, useFrappePostCall, useFrappeGetDocList } from 'frappe-react-sdk';
import { Save, ChevronDown, ChevronRight, Loader2, Calendar, CheckCircle, AlertCircle, Users, Clock, Plus, X, Filter } from 'lucide-react';
import { DynamicFieldRenderer } from '@/components/form/DynamicFieldRenderer';
import type { FormField } from '@/types/form';

interface Employee {
    name: string;
    employee_name: string;
    branch: string;
    department: string;
    default_shift?: string;
}

interface SectionProps {
    title: string;
    sectionKey: string;
    children: React.ReactNode;
    icon?: React.ComponentType<{ className?: string }>;
    isExpanded: boolean;
    onToggle: () => void;
}

const Section: React.FC<SectionProps> = React.memo(({ title, sectionKey, children, icon: Icon, isExpanded, onToggle }) => (
    <div className="mb-4 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md animate-fadeIn">
        <button
            onClick={onToggle}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors group"
        >
            <div className="flex items-center space-x-3">
                {Icon && <Icon className="w-5 h-5 text-cyan-600" />}
                <span className="text-base font-semibold text-gray-800 group-hover:text-cyan-600 transition-colors">{title}</span>
            </div>
            <div className="flex items-center space-x-2">
                {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-500 transition-transform" />
                ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500 transition-transform" />
                )}
            </div>
        </button>
        {isExpanded && (
            <div className="p-4 border-t border-gray-200 animate-slideDown">{children}</div>
        )}
    </div>
));

Section.displayName = 'Section';

const ShiftAssignmentTool = () => {
    const [formData, setFormData] = useState<any>({
        name: 'Shift Assignment Tool',
        doctype: 'Shift Assignment Tool',
        action: 'Assign Shift',
        company: '',
        shift_type: '',
        start_date: '',
        end_date: '',
        shift_location: '',
        status: 'Active',
        branch: '',
        department: '',
        designation: '',
        employee_grade: '',
        employment_type: '',
        __unsaved: 1
    });

    const [expandedSections, setExpandedSections] = useState({
        shiftDetails: true,
        quickFilters: true,
        advancedFilters: false,
        employees: true
    });

    const [hasChanges, setHasChanges] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null);
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
    const [advancedFilters, setAdvancedFilters] = useState<any[]>([]);
    const [errorMessage, setErrorMessage] = useState<string>('');

    // Fetch DocType Meta
    const { data: docTypeMeta, isLoading: loadingMeta } = useFrappeGetCall(
        'frappe.desk.form.load.getdoctype',
        { doctype: 'Shift Assignment Tool' },
        undefined,
        { revalidateOnFocus: false }
    );

    // Fetch the actual document to get the modified timestamp
    const { data: docData, mutate: refreshDoc } = useFrappeGetCall(
        'frappe.client.get',
        { doctype: 'Shift Assignment Tool', name: 'Shift Assignment Tool' },
        undefined,
        { revalidateOnFocus: false }
    );

    const employeeFilters = useMemo(() => {
        const filters: any[] = [['status', '=', 'Active']];
        if (formData.company) filters.push(['company', '=', formData.company]);
        if (formData.branch) filters.push(['branch', '=', formData.branch]);
        if (formData.department) filters.push(['department', '=', formData.department]);
        if (formData.designation) filters.push(['designation', '=', formData.designation]);
        if (formData.employee_grade) filters.push(['grade', '=', formData.employee_grade]);
        if (formData.employment_type) filters.push(['employment_type', '=', formData.employment_type]);

        advancedFilters.forEach(filter => {
            if (filter.field && filter.operator && filter.value) {
                filters.push([filter.field, filter.operator, filter.value]);
            }
        });

        return filters;
    }, [formData.company, formData.branch, formData.department, formData.designation, formData.employee_grade, formData.employment_type, advancedFilters]);

    const shouldFetchEmployees = useMemo(
        () => formData.company || formData.branch || formData.department || formData.designation || formData.employee_grade || formData.employment_type || advancedFilters.length > 0,
        [formData.company, formData.branch, formData.department, formData.designation, formData.employee_grade, formData.employment_type, advancedFilters.length]
    );

    const { data: employees, isLoading: loadingEmployees, mutate: refreshEmployees } = useFrappeGetDocList<Employee>(
        'Employee',
        {
            fields: ['name', 'employee_name', 'branch', 'department', 'default_shift'],
            filters: employeeFilters,
            limit: 1000
        },
        shouldFetchEmployees ? undefined : null
    );

    // Use run_doc_method to call bulk_assign
    const { call: bulkAssign, loading: saving } = useFrappePostCall('run_doc_method');

    const toggleSection = useCallback((section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    }, []);

    const handleFieldChange = useCallback((fieldname: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [fieldname]: value }));
        setHasChanges(true);
        setSaveStatus(null);
        setErrorMessage('');
    }, []);

    const handleEmployeeToggle = useCallback((employeeId: string) => {
        setSelectedEmployees(prev => {
            if (prev.includes(employeeId)) {
                return prev.filter(id => id !== employeeId);
            } else {
                return [...prev, employeeId];
            }
        });
        setHasChanges(true);
    }, []);

    const handleSelectAll = useCallback(() => {
        setSelectedEmployees(prev => {
            if (prev.length === (employees?.length || 0)) {
                return [];
            } else {
                return employees?.map(emp => emp.name) || [];
            }
        });
        setHasChanges(true);
    }, [employees]);

    const addAdvancedFilter = useCallback(() => {
        setAdvancedFilters(prev => [...prev, { field: '', operator: '=', value: '' }]);
    }, []);

    const updateAdvancedFilter = useCallback((index: number, key: string, value: any) => {
        setAdvancedFilters(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [key]: value };
            return updated;
        });
    }, []);

    const removeAdvancedFilter = useCallback((index: number) => {
        setAdvancedFilters(prev => prev.filter((_, i) => i !== index));
    }, []);

    const clearAdvancedFilters = useCallback(() => {
        setAdvancedFilters([]);
    }, []);

    const handleSave = useCallback(async () => {
        // Validation
        if (!formData.company) {
            setErrorMessage('Please select a company');
            setSaveStatus('error');
            return;
        }
        if (!formData.shift_type) {
            setErrorMessage('Please select a shift type');
            setSaveStatus('error');
            return;
        }
        if (!formData.start_date) {
            setErrorMessage('Please select a start date');
            setSaveStatus('error');
            return;
        }
        if (selectedEmployees.length === 0) {
            setErrorMessage('Please select at least one employee');
            setSaveStatus('error');
            return;
        }

        try {
            console.log('Assigning shifts via bulk_assign method...');

            // CRITICAL FIX: Refresh the document to get the latest timestamp
            const freshDoc = await refreshDoc();

            if (!freshDoc) {
                throw new Error('Failed to fetch document data');
            }

            // Prepare the doc object matching ERPNext's structure with proper timestamp
            // Use the EXACT format and data from the fresh document
            const preparedDoc = {
                name: 'Shift Assignment Tool',
                owner: freshDoc.owner || 'Administrator',
                modified: freshDoc.modified, // Use the exact timestamp from ERPNext
                modified_by: freshDoc.modified_by || 'Administrator',
                docstatus: 0,
                idx: '0',
                action: formData.action,
                company: formData.company,
                status: formData.status,
                doctype: 'Shift Assignment Tool',
                __unsaved: 1,
                shift_type: formData.shift_type,
                start_date: formData.start_date,
                ...(formData.end_date && { end_date: formData.end_date }),
                ...(formData.shift_location && { shift_location: formData.shift_location })
            };

            console.log('Doc data:', preparedDoc);
            console.log('Selected employees:', selectedEmployees);

            // Call run_doc_method with correct parameter structure
            const result = await bulkAssign('run_doc_method', {
                docs: JSON.stringify(preparedDoc),
                method: 'bulk_assign',
                args: JSON.stringify({ employees: selectedEmployees }),
                employees: JSON.stringify(selectedEmployees)
            });

            console.log('Shift assignment result:', result);
            setSaveStatus('success');
            setHasChanges(false);
            setSelectedEmployees([]);
            setErrorMessage('');

            // Refresh employee list and document
            if (refreshEmployees) {
                refreshEmployees();
            }
            if (refreshDoc) {
                refreshDoc();
            }

            setTimeout(() => {
                setSaveStatus(null);
            }, 3000);
        } catch (error: any) {
            console.error('Error assigning shifts:', error);

            // Extract error message
            let errorMsg = 'Failed to assign shifts. Please try again.';
            if (error?.message) {
                errorMsg = error.message;
            } else if (error?.exception) {
                errorMsg = error.exception;
            } else if (error?._server_messages) {
                try {
                    const messages = JSON.parse(error._server_messages);
                    if (messages.length > 0) {
                        const parsed = JSON.parse(messages[0]);
                        errorMsg = parsed.message || errorMsg;
                    }
                } catch (e) {
                    // Ignore parse errors
                }
            } else if (typeof error === 'string') {
                errorMsg = error;
            }

            setErrorMessage(errorMsg);
            setSaveStatus('error');
            setTimeout(() => {
                setSaveStatus(null);
            }, 5000);
        }
    }, [formData, selectedEmployees, bulkAssign, refreshEmployees, refreshDoc]);

    const basicFields = useMemo(() => {
        if (!docTypeMeta?.docs?.[0]?.fields) return [];
        return docTypeMeta.docs[0].fields.filter((field: FormField) =>
            ['action', 'company'].includes(field.fieldname)
        );
    }, [docTypeMeta]);

    const shiftDetailsFields = useMemo(() => {
        if (!docTypeMeta?.docs?.[0]?.fields) return [];
        return docTypeMeta.docs[0].fields.filter((field: FormField) =>
            ['shift_type', 'start_date', 'end_date', 'shift_location', 'status'].includes(field.fieldname)
        );
    }, [docTypeMeta]);

    const quickFiltersFields = useMemo(() => {
        if (!docTypeMeta?.docs?.[0]?.fields) return [];
        return docTypeMeta.docs[0].fields.filter((field: FormField) =>
            ['branch', 'department', 'designation', 'employee_grade', 'employment_type'].includes(field.fieldname)
        );
    }, [docTypeMeta]);

    if (loadingMeta) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center animate-fadeIn">
                    <Loader2 className="w-12 h-12 text-cyan-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading Shift Assignment Tool...</p>
                </div>
            </div>
        );
    }

    const isFormValid = formData.company && formData.shift_type && formData.start_date && selectedEmployees.length > 0;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-400 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-semibold text-white flex items-center space-x-2">
                                <Calendar className="w-5 h-5" />
                                <span>Shift Assignment Tool</span>
                            </h1>
                            <p className="text-sm text-blue-100 mt-0.5">Assign shifts to multiple employees at once</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div
                                className={`backdrop-blur-sm rounded px-3 py-1.5 transition-all ${hasChanges
                                        ? 'bg-yellow-500/20 border border-yellow-400/30'
                                        : saveStatus === 'success'
                                            ? 'bg-green-500/20 border border-green-400/30'
                                            : saveStatus === 'error'
                                                ? 'bg-red-500/20 border border-red-400/30'
                                                : 'bg-white/20'
                                    }`}
                            >
                                <span className="text-white text-sm font-medium flex items-center space-x-1.5">
                                    {saveStatus === 'success' ? (
                                        <>
                                            <CheckCircle className="w-4 h-4" />
                                            <span>Saved</span>
                                        </>
                                    ) : saveStatus === 'error' ? (
                                        <>
                                            <AlertCircle className="w-4 h-4" />
                                            <span>Error</span>
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
                                disabled={!isFormValid || saving}
                                className="bg-white text-cyan-600 hover:bg-gray-50 font-medium px-6 py-2 rounded text-sm transition-all disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex items-center space-x-2"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Assigning...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>Assign Shift</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* Error Message */}
                {errorMessage && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3 animate-fadeIn">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-red-800">Error</h3>
                            <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
                        </div>
                        <button onClick={() => setErrorMessage('')} className="text-red-400 hover:text-red-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Success Message */}
                {saveStatus === 'success' && !errorMessage && (
                    <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3 animate-fadeIn">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-green-800">Success</h3>
                            <p className="text-sm text-green-700 mt-1">Shifts assigned successfully to {selectedEmployees.length} employee(s)</p>
                        </div>
                        <button onClick={() => setSaveStatus(null)} className="text-green-400 hover:text-green-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Basic Fields - Always Visible */}
                <div className="mb-4 bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {basicFields.map((field) => (
                            <DynamicFieldRenderer
                                key={field.fieldname}
                                field={field}
                                value={formData[field.fieldname]}
                                onChange={(value) => handleFieldChange(field.fieldname, value)}
                                formData={formData}
                                error={undefined}
                                disabled={false}
                                className=""
                            />
                        ))}
                    </div>
                </div>

                {/* Shift Assignment Details */}
                <Section
                    title="Shift Assignment Details"
                    sectionKey="shiftDetails"
                    icon={Clock}
                    isExpanded={expandedSections.shiftDetails}
                    onToggle={() => toggleSection('shiftDetails')}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {shiftDetailsFields.map((field) => (
                            <DynamicFieldRenderer
                                key={field.fieldname}
                                field={field}
                                value={formData[field.fieldname]}
                                onChange={(value) => handleFieldChange(field.fieldname, value)}
                                formData={formData}
                                error={undefined}
                                disabled={false}
                                className=""
                            />
                        ))}
                    </div>
                </Section>

                {/* Quick Filters */}
                <Section
                    title="Quick Filters"
                    sectionKey="quickFilters"
                    icon={Filter}
                    isExpanded={expandedSections.quickFilters}
                    onToggle={() => toggleSection('quickFilters')}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {quickFiltersFields.map((field) => (
                            <DynamicFieldRenderer
                                key={field.fieldname}
                                field={field}
                                value={formData[field.fieldname]}
                                onChange={(value) => handleFieldChange(field.fieldname, value)}
                                formData={formData}
                                error={undefined}
                                disabled={false}
                                className=""
                            />
                        ))}
                    </div>
                </Section>

                {/* Advanced Filters */}
                <Section
                    title="Advanced Filters"
                    sectionKey="advancedFilters"
                    icon={Filter}
                    isExpanded={expandedSections.advancedFilters}
                    onToggle={() => toggleSection('advancedFilters')}
                >
                    <div className="space-y-3">
                        {advancedFilters.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">No filters selected</p>
                        ) : (
                            advancedFilters.map((filter, index) => (
                                <div key={index} className="grid grid-cols-12 gap-3 items-end">
                                    <div className="col-span-4">
                                        <input
                                            type="text"
                                            placeholder="Field name"
                                            value={filter.field}
                                            onChange={(e) => updateAdvancedFilter(index, 'field', e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <select
                                            value={filter.operator}
                                            onChange={(e) => updateAdvancedFilter(index, 'operator', e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                                        >
                                            <option value="=">=</option>
                                            <option value="!=">!=</option>
                                            <option value=">">{'>'}</option>
                                            <option value="<">{'<'}</option>
                                            <option value=">=">{'>='}</option>
                                            <option value="<=">{'<='}</option>
                                            <option value="like">like</option>
                                            <option value="in">in</option>
                                            <option value="not in">not in</option>
                                        </select>
                                    </div>
                                    <div className="col-span-4">
                                        <input
                                            type="text"
                                            placeholder="Value"
                                            value={filter.value}
                                            onChange={(e) => updateAdvancedFilter(index, 'value', e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <button
                                            onClick={() => removeAdvancedFilter(index)}
                                            className="w-full p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                        >
                                            <X className="w-5 h-5 mx-auto" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                        <div className="flex justify-between items-center pt-2">
                            <button
                                onClick={addAdvancedFilter}
                                className="text-sm text-cyan-600 hover:text-cyan-700 font-medium flex items-center space-x-1"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add a Filter</span>
                            </button>
                            {advancedFilters.length > 0 && (
                                <button onClick={clearAdvancedFilters} className="text-sm text-gray-600 hover:text-gray-700 font-medium">
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    </div>
                </Section>

                {/* Select Employees */}
                <Section
                    title="Select Employees"
                    sectionKey="employees"
                    icon={Users}
                    isExpanded={expandedSections.employees}
                    onToggle={() => toggleSection('employees')}
                >
                    <div className="space-y-4">
                        {/* Controls */}
                        <div className="flex items-center justify-between">
                            <button
                                onClick={handleSelectAll}
                                disabled={!employees || employees.length === 0}
                                className="px-4 py-2 text-sm font-medium text-cyan-600 border border-cyan-600 rounded hover:bg-cyan-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {selectedEmployees.length === (employees?.length || 0) ? 'Deselect All' : 'Select All'}
                            </button>
                            {selectedEmployees.length > 0 && (
                                <div className="flex items-center space-x-3">
                                    <span className="text-sm font-medium text-gray-700">{selectedEmployees.length} selected</span>
                                    <button onClick={() => setSelectedEmployees([])} className="text-sm text-red-600 hover:text-red-700 font-medium">
                                        Clear Selection
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Employee Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-y border-gray-200">
                                        <th className="px-4 py-3 text-left">
                                            <input
                                                type="checkbox"
                                                checked={selectedEmployees.length === (employees?.length || 0) && employees && employees.length > 0}
                                                onChange={handleSelectAll}
                                                disabled={!employees || employees.length === 0}
                                                className="w-4 h-4 text-cyan-600 rounded focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
                                            />
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Employee</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Employee Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Branch</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Department</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Default Shift</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingEmployees ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-12 text-center">
                                                <Loader2 className="w-8 h-8 text-cyan-600 animate-spin mx-auto" />
                                            </td>
                                        </tr>
                                    ) : !employees || employees.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-12 text-center">
                                                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                <p className="text-gray-500 font-medium">
                                                    {shouldFetchEmployees
                                                        ? 'There are no employees without Shift Assignments for these dates based on the given filters.'
                                                        : 'Please select filters to view employees.'}
                                                </p>
                                            </td>
                                        </tr>
                                    ) : (
                                        employees.map((emp) => (
                                            <tr
                                                key={emp.name}
                                                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${selectedEmployees.includes(emp.name) ? 'bg-cyan-50' : ''
                                                    }`}
                                            >
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedEmployees.includes(emp.name)}
                                                        onChange={() => handleEmployeeToggle(emp.name)}
                                                        className="w-4 h-4 text-cyan-600 rounded focus:ring-2 focus:ring-cyan-500"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{emp.name}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{emp.employee_name}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{emp.branch || '—'}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{emp.department || '—'}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{emp.default_shift || '—'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
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

export default ShiftAssignmentTool;