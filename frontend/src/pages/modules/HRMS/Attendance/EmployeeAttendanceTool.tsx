import React, { useState, useEffect } from 'react';
import { useFrappePostCall } from 'frappe-react-sdk';
import { Calendar, Users, Clock, AlertCircle, Check, X, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';

const EmployeeAttendanceTool = () => {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        shift: '',
        company: 'Siyaratech (Demo)',
        branch: '',
        department: '',
        employment_type: '',
        designation: '',
        employee_grade: '',
        filter_by_shift: false,
        late_entry: false,
        early_exit: false
    });

    const [employees, setEmployees] = useState({
        marked: [],
        half_day_marked: [],
        unmarked: []
    });

    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [showEmployees, setShowEmployees] = useState(false);
    const [activeTab, setActiveTab] = useState('unmarked');
    const [markingStatus, setMarkingStatus] = useState('Present');

    // API Hooks
    const { call: getEmployeesCall, loading: employeesLoading } = useFrappePostCall('hrms.hr.doctype.employee_attendance_tool.employee_attendance_tool.get_employees');
    const { call: markAttendanceCall, loading: markingLoading } = useFrappePostCall('hrms.hr.doctype.employee_attendance_tool.employee_attendance_tool.mark_employee_attendance');

    const loading = employeesLoading || markingLoading;

    // Fetch employees based on filters
    const getEmployees = async () => {
        try {
            const params = {
                date: formData.date,
                company: formData.company,
                shift: formData.shift || '',
                filter_by_shift: formData.filter_by_shift ? '1' : '0',
                branch: formData.branch || '',
                department: formData.department || '',
                employment_type: formData.employment_type || '',
                designation: formData.designation || '',
                employee_grade: formData.employee_grade || ''
            };

            const response = await getEmployeesCall(params);
            if (response?.message) {
                setEmployees(response.message);
                setShowEmployees(true);
                setSelectedEmployees([]);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    // Mark attendance for selected employees
    const markAttendance = async () => {
        if (selectedEmployees.length === 0) {
            alert('Please select at least one employee');
            return;
        }

        try {
            const params = {
                employee_list: JSON.stringify(selectedEmployees),
                status: markingStatus,
                date: formData.date,
                late_entry: formData.late_entry ? '1' : '0',
                early_exit: formData.early_exit ? '1' : '0',
                shift: formData.shift || '',
                mark_half_day: 'false',
                half_day_status: '',
                half_day_employee_list: JSON.stringify([])
            };

            await markAttendanceCall(params);
            alert('Attendance marked successfully!');

            // Refresh employee list
            getEmployees();
        } catch (error) {
            console.error('Error marking attendance:', error);
            alert('Failed to mark attendance');
        }
    };

    // Handle employee selection
    const toggleEmployee = (employeeId) => {
        setSelectedEmployees(prev =>
            prev.includes(employeeId)
                ? prev.filter(id => id !== employeeId)
                : [...prev, employeeId]
        );
    };

    const selectAll = () => {
        const currentList = activeTab === 'unmarked' ? employees.unmarked :
            activeTab === 'marked' ? employees.marked :
                employees.half_day_marked;
        setSelectedEmployees(currentList.map(emp => emp.employee));
    };

    const clearSelection = () => {
        setSelectedEmployees([]);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-400 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-semibold text-white">Employee Attendance Tool</h1>
                            <p className="text-sm text-blue-100 mt-0.5">Mark attendance for multiple employees efficiently</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded px-3 py-1.5">
                            <span className="text-white text-sm font-medium">Not Saved</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* Main Form */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 transition-all hover:shadow-md">
                    {/* Date and Flags */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                            />
                        </div>

                        <div className="flex items-end">
                            <label className="flex items-center space-x-2 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={formData.late_entry}
                                        onChange={(e) => setFormData({ ...formData, late_entry: e.target.checked })}
                                        className="w-4 h-4 text-cyan-600 rounded focus:ring-2 focus:ring-cyan-500 cursor-pointer transition-all"
                                    />
                                </div>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Late Entry</span>
                            </label>
                        </div>

                        <div className="flex items-end">
                            <label className="flex items-center space-x-2 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={formData.early_exit}
                                        onChange={(e) => setFormData({ ...formData, early_exit: e.target.checked })}
                                        className="w-4 h-4 text-cyan-600 rounded focus:ring-2 focus:ring-cyan-500 cursor-pointer transition-all"
                                    />
                                </div>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Early Exit</span>
                            </label>
                        </div>
                    </div>

                    {/* Shift */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Shift</label>
                        <input
                            type="text"
                            value={formData.shift}
                            onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                            placeholder="Enter shift"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                        />
                    </div>

                    {/* Get Employees Section */}
                    <div className="border-t pt-6">
                        <button
                            onClick={() => setShowEmployees(!showEmployees)}
                            className="flex items-center space-x-2 text-base font-semibold text-gray-800 mb-4 hover:text-cyan-600 transition-colors group"
                        >
                            <Users className="w-5 h-5 text-gray-600 group-hover:text-cyan-600 transition-colors" />
                            <span>Get Employees</span>
                            {showEmployees ? 
                                <ChevronDown className="w-4 h-4 text-gray-500 transition-transform" /> : 
                                <ChevronRight className="w-4 h-4 text-gray-500 transition-transform" />
                            }
                        </button>

                        {showEmployees && (
                            <div className="space-y-6 animate-slideDown">
                                <p className="text-sm text-gray-600">Set filters to fetch employees</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="animate-fadeIn" style={{animationDelay: '0.05s'}}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Company</label>
                                        <input
                                            type="text"
                                            value={formData.company}
                                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                                        />
                                    </div>

                                    <div className="animate-fadeIn" style={{animationDelay: '0.1s'}}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Employment Type</label>
                                        <input
                                            type="text"
                                            value={formData.employment_type}
                                            onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                                            placeholder="Enter employment type"
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                                        />
                                    </div>

                                    <div className="animate-fadeIn" style={{animationDelay: '0.15s'}}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Branch</label>
                                        <input
                                            type="text"
                                            value={formData.branch}
                                            onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                                            placeholder="Enter branch"
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                                        />
                                    </div>

                                    <div className="animate-fadeIn" style={{animationDelay: '0.2s'}}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Designation</label>
                                        <input
                                            type="text"
                                            value={formData.designation}
                                            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                            placeholder="Enter designation"
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                                        />
                                    </div>

                                    <div className="animate-fadeIn" style={{animationDelay: '0.25s'}}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
                                        <input
                                            type="text"
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                            placeholder="Enter department"
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                                        />
                                    </div>

                                    <div className="animate-fadeIn" style={{animationDelay: '0.3s'}}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Employee Grade</label>
                                        <input
                                            type="text"
                                            value={formData.employee_grade}
                                            onChange={(e) => setFormData({ ...formData, employee_grade: e.target.value })}
                                            placeholder="Enter employee grade"
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="animate-fadeIn" style={{animationDelay: '0.35s'}}>
                                    <label className="flex items-center space-x-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={formData.filter_by_shift}
                                            onChange={(e) => setFormData({ ...formData, filter_by_shift: e.target.checked })}
                                            className="w-4 h-4 text-cyan-600 rounded focus:ring-2 focus:ring-cyan-500 cursor-pointer transition-all"
                                        />
                                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Filter by Shift</span>
                                    </label>
                                </div>

                                <button
                                    onClick={getEmployees}
                                    disabled={loading}
                                    className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-600 text-white font-medium px-6 py-2 rounded text-sm transition-all disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex items-center space-x-2 animate-fadeIn"
                                    style={{animationDelay: '0.4s'}}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Loading...</span>
                                        </>
                                    ) : (
                                        <span>Get Employees</span>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Employee List */}
                {(employees.marked.length > 0 || employees.unmarked.length > 0 || employees.half_day_marked.length > 0) && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-slideUp">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-800">Employees</h2>
                            <div className="flex space-x-3">
                                <button
                                    onClick={selectAll}
                                    className="text-sm text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
                                >
                                    Select All
                                </button>
                                <button
                                    onClick={clearSelection}
                                    className="text-sm text-gray-600 hover:text-gray-700 font-medium transition-colors"
                                >
                                    Clear Selection
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex space-x-1 mb-6 border-b">
                            <button
                                onClick={() => setActiveTab('unmarked')}
                                className={`pb-3 px-4 font-medium text-sm transition-all relative ${
                                    activeTab === 'unmarked'
                                        ? 'text-cyan-600'
                                        : 'text-gray-600 hover:text-gray-800'
                                }`}
                            >
                                Unmarked ({employees.unmarked.length})
                                {activeTab === 'unmarked' && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-blue-400 animate-slideInTab"></div>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('marked')}
                                className={`pb-3 px-4 font-medium text-sm transition-all relative ${
                                    activeTab === 'marked'
                                        ? 'text-cyan-600'
                                        : 'text-gray-600 hover:text-gray-800'
                                }`}
                            >
                                Marked ({employees.marked.length})
                                {activeTab === 'marked' && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-blue-400 animate-slideInTab"></div>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('half_day')}
                                className={`pb-3 px-4 font-medium text-sm transition-all relative ${
                                    activeTab === 'half_day'
                                        ? 'text-cyan-600'
                                        : 'text-gray-600 hover:text-gray-800'
                                }`}
                            >
                                Half Day ({employees.half_day_marked.length})
                                {activeTab === 'half_day' && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-blue-400 animate-slideInTab"></div>
                                )}
                            </button>
                        </div>

                        {/* Status Selection */}
                        {activeTab === 'unmarked' && (
                            <div className="mb-6 animate-fadeIn">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mark As</label>
                                <select
                                    value={markingStatus}
                                    onChange={(e) => setMarkingStatus(e.target.value)}
                                    className="w-64 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                                >
                                    <option value="Present">Present</option>
                                    <option value="Absent">Absent</option>
                                    <option value="On Leave">On Leave</option>
                                    <option value="Half Day">Half Day</option>
                                    <option value="Work From Home">Work From Home</option>
                                </select>
                            </div>
                        )}

                        {/* Employee Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                            {(activeTab === 'unmarked' ? employees.unmarked :
                                activeTab === 'marked' ? employees.marked :
                                    employees.half_day_marked).map((emp, index) => (
                                        <div
                                            key={emp.employee}
                                            onClick={() => activeTab === 'unmarked' && toggleEmployee(emp.employee)}
                                            className={`border rounded-lg p-4 transition-all duration-300 animate-scaleIn ${
                                                selectedEmployees.includes(emp.employee)
                                                    ? 'border-cyan-500 bg-gradient-to-br from-cyan-50 to-blue-50 shadow-md scale-105'
                                                    : 'border-gray-200 hover:border-cyan-300 hover:shadow-sm'
                                            } ${activeTab === 'unmarked' ? 'cursor-pointer hover:scale-102' : 'cursor-default'}`}
                                            style={{animationDelay: `${index * 0.05}s`}}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium text-gray-900 text-sm truncate">{emp.employee_name}</h3>
                                                    <p className="text-xs text-gray-500 mt-0.5">{emp.employee}</p>
                                                    {emp.status && (
                                                        <div className="mt-2">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium transition-all ${
                                                                emp.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800' :
                                                                emp.status === 'Present' ? 'bg-green-100 text-green-800' :
                                                                emp.status === 'Half Day' ? 'bg-orange-100 text-orange-800' :
                                                                'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                {emp.status}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {emp.leave_type && (
                                                        <p className="text-xs text-gray-500 mt-1">{emp.leave_type}</p>
                                                    )}
                                                </div>
                                                {activeTab === 'unmarked' && (
                                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                                                        selectedEmployees.includes(emp.employee)
                                                            ? 'bg-gradient-to-br from-blue-600 to-blue-400 border-cyan-600 scale-110'
                                                            : 'border-gray-300'
                                                    }`}>
                                                        {selectedEmployees.includes(emp.employee) && (
                                                            <Check className="w-3 h-3 text-white animate-checkmark" />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                        </div>

                        {/* Mark Attendance Button */}
                        {activeTab === 'unmarked' && selectedEmployees.length > 0 && (
                            <div className="flex justify-end pt-4 border-t animate-slideUp">
                                <button
                                    onClick={markAttendance}
                                    disabled={loading}
                                    className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-medium px-6 py-2 rounded text-sm transition-all disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center space-x-2 shadow-sm hover:shadow-md"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Marking...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4" />
                                            <span>Mark {selectedEmployees.length} Employee(s) as {markingStatus}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                )}
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
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        max-height: 2000px;
                        transform: translateY(0);
                    }
                }
                
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes scaleIn {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                
                @keyframes slideInTab {
                    from {
                        transform: scaleX(0);
                    }
                    to {
                        transform: scaleX(1);
                    }
                }
                
                @keyframes checkmark {
                    0% {
                        transform: scale(0);
                    }
                    50% {
                        transform: scale(1.2);
                    }
                    100% {
                        transform: scale(1);
                    }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.4s ease-out forwards;
                    opacity: 0;
                }
                
                .animate-slideDown {
                    animation: slideDown 0.4s ease-out forwards;
                }
                
                .animate-slideUp {
                    animation: slideUp 0.4s ease-out forwards;
                }
                
                .animate-scaleIn {
                    animation: scaleIn 0.3s ease-out forwards;
                    opacity: 0;
                }
                
                .animate-slideInTab {
                    animation: slideInTab 0.3s ease-out forwards;
                    transform-origin: left;
                }
                
                .animate-checkmark {
                    animation: checkmark 0.3s ease-out forwards;
                }
                
                .hover\:scale-102:hover {
                    transform: scale(1.02);
                }
            `}</style>
        </div>
    );
};

export default EmployeeAttendanceTool;