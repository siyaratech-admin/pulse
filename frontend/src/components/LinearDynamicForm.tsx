import React, { useState, useMemo, useEffect, useRef } from 'react';
import { cn } from "@/lib/utils";
import { DynamicForm } from '@/components/form/DynamicForm';
import type { FieldMetadata, FormData } from '@/types/form';
import { Badge } from "@/components/ui/badge";
import { ConditionEvaluator } from '../../src/utils/conditionEvaluator';

interface TabSection {
    label: string;
    fields: FieldMetadata[];
}

interface LinearDynamicFormProps {
    fields: FieldMetadata[];
    initialData?: FormData;
    onSubmit: (data: FormData) => void | Promise<void>;
    onCancel?: () => void;
    loading?: boolean;
    className?: string;
    doctype?: string;
    docname?: string;
    onFieldChange?: (field: FieldMetadata, value: any) => void;
    onSubmitDoc?: (data: FormData) => Promise<void>;
    onCancelDoc?: () => Promise<void>;
    onAmendDoc?: () => Promise<void>;
    customSections?: { id: string, label: string, content: React.ReactNode }[];
    additionalTabContent?: Record<string, React.ReactNode>;
    readOnly?: boolean;
    isSubmittable?: boolean;
}

export const LinearDynamicForm: React.FC<LinearDynamicFormProps> = ({
    fields,
    initialData = {},
    onSubmit,
    onCancel,
    loading = false,
    className,
    doctype,
    docname,
    onFieldChange,
    onSubmitDoc,
    onCancelDoc,
    onAmendDoc,
    customSections = [],
    additionalTabContent = {},
    readOnly = false,
    isSubmittable = false
}) => {
    const [activeSection, setActiveSection] = useState<string>('0');
    const [formData, setFormData] = useState<FormData>(initialData);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const navRef = useRef<HTMLDivElement | null>(null);
    const isScrolling = useRef(false);

    // Group fields by tabs or section breaks
    const tabSections = useMemo(() => {
        const hasTabBreaks = fields.some(f => f.fieldtype === 'Tab Break');
        const sections: TabSection[] = [];
        let currentSection: TabSection = { label: 'General', fields: [] };

        fields.forEach((field) => {
            if (field.hidden) return; // Skip hidden fields to prevent empty sections

            if (hasTabBreaks) {
                if (field.fieldtype === 'Tab Break') {
                    if (currentSection.fields.length > 0) {
                        sections.push(currentSection);
                    }
                    currentSection = { label: field.label || 'Tab', fields: [] };
                } else {
                    currentSection.fields.push(field);
                }
            } else {
                if (field.fieldtype === 'Section Break') {
                    if (currentSection.fields.length > 0) {
                        sections.push(currentSection);
                    }
                    currentSection = { label: field.label || 'Section', fields: [] };
                } else if (field.fieldtype !== 'Column Break') {
                    currentSection.fields.push(field);
                }
            }
        });

        if (currentSection.fields.length > 0) {
            sections.push(currentSection);
        }

        if (sections.length === 0) {
            sections.push({
                label: 'General',
                fields: fields.filter(f =>
                    f.fieldtype !== 'Section Break' &&
                    f.fieldtype !== 'Column Break' &&
                    f.fieldtype !== 'Tab Break'
                )
            });
        }

        return sections;
    }, [fields]);

    useEffect(() => {
        console.log('📊 Sections:', tabSections.length, tabSections.map(s => s.label));
    }, [tabSections]);

    const tabsWithErrors = useMemo(() => {
        const tabErrors: Record<string, number> = {};
        Object.keys(fieldErrors).forEach(fieldname => {
            tabSections.forEach((section, index) => {
                if (section.fields.some(f => f.fieldname === fieldname)) {
                    tabErrors[index.toString()] = (tabErrors[index.toString()] || 0) + 1;
                }
            });
        });
        return tabErrors;
    }, [fieldErrors, tabSections]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                // Don't interfere if user just clicked a tab (wait for programmatic scroll to complete)
                if (isScrolling.current) return;

                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                        console.log('👁️ Section in view:', entry.target.id);
                        setActiveSection(entry.target.id);
                    }
                });
            },
            {
                threshold: [0, 0.5, 1],
                rootMargin: '-120px 0px -50% 0px',
                // Find the scroll container instead of using viewport
                root: null // Will use viewport, but we'll find the actual container below
            }
        );

        // Find the actual scrolling container
        const firstSection = Object.values(sectionRefs.current)[0];
        if (firstSection) {
            const findScrollParent = (node: HTMLElement | null): HTMLElement | null => {
                if (!node) return null;
                const overflowY = window.getComputedStyle(node).overflowY;
                const isScrollable = overflowY !== 'visible' && overflowY !== 'hidden';
                if (isScrollable && node.scrollHeight > node.clientHeight) {
                    return node;
                }
                return findScrollParent(node.parentElement);
            };

            const scrollContainer = findScrollParent(firstSection);
            console.log('📦 Intersection Observer using container:', scrollContainer?.className || 'window');
        }

        Object.values(sectionRefs.current).forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => observer.disconnect();
    }, [tabSections, customSections]);

    const scrollToSection = (sectionId: string) => {
        console.log('🎯 Scroll to:', sectionId);

        const element = sectionRefs.current[sectionId];
        if (!element) {
            console.error('❌ No element:', sectionId);
            console.log('Available:', Object.keys(sectionRefs.current));
            return;
        }

        console.log('✅ Element found, scrolling...');
        isScrolling.current = true;

        // Find the scrollable parent container
        const findScrollParent = (node: HTMLElement | null): HTMLElement | Window => {
            if (!node) return window;

            const overflowY = window.getComputedStyle(node).overflowY;
            const isScrollable = overflowY !== 'visible' && overflowY !== 'hidden';

            if (isScrollable && node.scrollHeight > node.clientHeight) {
                console.log('📦 Found scroll parent:', node.className);
                return node;
            }

            return findScrollParent(node.parentElement);
        };

        const scrollParent = findScrollParent(element);
        const navHeight = navRef.current?.offsetHeight || 60;
        const extraPadding = 100;
        const totalOffset = navHeight + extraPadding;

        if (scrollParent === window) {
            // Scrolling window
            const elementRect = element.getBoundingClientRect();
            const absoluteTop = elementRect.top + window.pageYOffset;
            const targetPosition = absoluteTop - totalOffset;

            console.log('📍 Scrolling WINDOW to:', targetPosition);
            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        } else {
            // Scrolling a container
            const container = scrollParent as HTMLElement;
            const containerRect = container.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();

            const relativeTop = elementRect.top - containerRect.top;
            const targetPosition = container.scrollTop + relativeTop - totalOffset;

            console.log('📍 Scrolling CONTAINER to:', targetPosition, 'Container:', container.className);
            container.scrollTo({ top: targetPosition, behavior: 'smooth' });
        }

        setTimeout(() => {
            isScrolling.current = false;
            console.log('✅ Scroll complete - manual scroll detection re-enabled');
        }, 800); // Reduced from 1000ms to 800ms
    };

    const handleFieldChange = (field: FieldMetadata, value: any) => {
        setFormData(prev => ({ ...prev, [field.fieldname]: value }));

        if (fieldErrors[field.fieldname]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field.fieldname];
                return newErrors;
            });
        }

        if (onFieldChange) {
            onFieldChange(field, value);
        }
    };

    const handleSubmit = async (data: FormData, e?: React.BaseSyntheticEvent) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }

        const conditions = ConditionEvaluator.evaluateFields(fields, data);
        const errors: Record<string, string> = {};

        fields.forEach(field => {
            const fieldConditions = conditions[field.fieldname];
            if (field.hidden || (fieldConditions && !fieldConditions.visible)) {
                return;
            }

            const isRequired = field.reqd || (fieldConditions && fieldConditions.required);
            if (isRequired) {
                const value = data[field.fieldname];
                const isEmpty = value === null || value === undefined || value === '' ||
                    (Array.isArray(value) && value.length === 0);

                if (isEmpty) {
                    errors[field.fieldname] = `${field.label} is required`;
                }
            }
        });

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            const firstErrorTab = Object.keys(tabsWithErrors)[0];
            if (firstErrorTab) {
                scrollToSection(firstErrorTab);
            }
            return;
        }

        await onSubmit(data);
    };

    if (tabSections.length === 1 && customSections.length === 0 && Object.keys(additionalTabContent).length === 0) {
        return (
            <div className={className}>
                <DynamicForm
                    fields={fields}
                    allFields={fields} // Enable cross-section logic
                    initialData={initialData}
                    onSubmit={onSubmit}
                    onCancel={onCancel}
                    loading={loading}
                    className={className}
                    doctype={doctype}
                    docname={docname}
                    onFieldChange={onFieldChange}
                    onSubmitDoc={onSubmitDoc}
                    onCancelDoc={onCancelDoc}
                    onAmendDoc={onAmendDoc}
                />
                {additionalTabContent['General'] || additionalTabContent[tabSections[0].label]}
            </div>
        );
    }

    return (
        <div className={className}>
            {/* Navigation */}
            <div ref={navRef} className="sticky top-0 z-50 bg-white border-b border-border/60 -mx-6 px-6 mb-3">
                <div className="flex gap-1 overflow-x-auto scrollbar-hide no-scrollbar py-2">
                    {tabSections.map((section, index) => {
                        const sectionId = index.toString();
                        return (
                            <button
                                key={index}
                                type="button"
                                onClick={() => {
                                    console.log('🖱️ Click:', section.label, sectionId);
                                    setActiveSection(sectionId);
                                    // Wait longer for all DynamicForm renders to complete
                                    requestAnimationFrame(() => {
                                        setTimeout(() => scrollToSection(sectionId), 300);
                                    });
                                }}
                                className={cn(
                                    "relative h-10 px-4 font-medium text-sm whitespace-nowrap transition-all duration-200 rounded-lg",
                                    activeSection === sectionId
                                        ? "bg-primary text-white shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-slate-100 bg-transparent"
                                )}
                            >
                                <span className="text-sm">{section.label}</span>
                                {tabsWithErrors[sectionId] && (
                                    <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-[10px] rounded-full">
                                        {tabsWithErrors[sectionId]}
                                    </Badge>
                                )}
                            </button>
                        );
                    })}
                    {customSections.map((section, index) => {
                        const sectionId = `custom-${index}`;
                        return (
                            <button
                                key={`custom-${index}`}
                                type="button"
                                onClick={() => {
                                    console.log('🖱️ Custom click:', section.label, sectionId);
                                    setActiveSection(sectionId);
                                    requestAnimationFrame(() => {
                                        setTimeout(() => scrollToSection(sectionId), 300);
                                    });
                                }}
                                className={cn(
                                    "relative h-10 px-4 font-medium text-sm whitespace-nowrap transition-all duration-200 rounded-lg",
                                    activeSection === sectionId
                                        ? "bg-primary text-white shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-slate-100 bg-transparent"
                                )}
                            >
                                <span className="text-sm">{section.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Sections - MINIMAL SPACING */}
            <div className="space-y-1">
                {tabSections.map((section, index) => (
                    <div
                        key={index}
                        id={index.toString()}
                        ref={(el) => {
                            sectionRefs.current[index.toString()] = el;
                            console.log('📌 Reg:', index, section.label, !!el);
                        }}
                        className="scroll-mt-32"
                    >
                        <DynamicForm
                            fields={section.fields}
                            allFields={fields} // Enable cross-section logic
                            initialData={formData}
                            onSubmit={handleSubmit}
                            onCancel={onCancel}
                            loading={loading}
                            doctype={doctype}
                            docname={docname}
                            onFieldChange={handleFieldChange}
                            title={section.label}
                            onSubmitDoc={onSubmitDoc}
                            onCancelDoc={onCancelDoc}
                            onAmendDoc={onAmendDoc}
                        />
                        {additionalTabContent[section.label] && (
                            <div className="mt-1">
                                {additionalTabContent[section.label]}
                            </div>
                        )}
                    </div>
                ))}

                {customSections.map((section, index) => (
                    <div
                        key={`custom-${index}`}
                        id={`custom-${index}`}
                        ref={(el) => {
                            sectionRefs.current[`custom-${index}`] = el;
                            console.log('📌 Custom reg:', index, section.label, !!el);
                        }}
                        className="scroll-mt-32 mt-2"
                    >
                        <div className="mb-2 pb-1 border-b border-border/40">
                            <h3 className="text-lg font-semibold text-slate-900">{section.label}</h3>
                        </div>
                        {section.content}
                    </div>
                ))}
            </div>
        </div>
    );
};