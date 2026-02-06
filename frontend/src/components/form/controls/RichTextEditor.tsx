import React, { useRef, useEffect, useState } from "react"
import Quill from "quill"
import "quill/dist/quill.snow.css"

interface RichTextEditorProps {
    value: string
    onChange: (html: string) => void
    placeholder?: string
    disabled?: boolean
    readOnly?: boolean
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
    value,
    onChange,
    placeholder = "Enter content...",
    disabled = false,
    readOnly = false,
}) => {
    const editorContainerRef = useRef<HTMLDivElement>(null)
    const editorRef = useRef<HTMLDivElement>(null)
    const quillInstance = useRef<Quill | null>(null)
    const [isInitialized, setIsInitialized] = useState(false)
    const isCleaningUp = useRef(false)

    // Track if we're programmatically updating to avoid loops
    const isProgrammaticUpdate = useRef(false)

    // Initialize Quill editor
    useEffect(() => {
        if (editorRef.current && !quillInstance.current && !isCleaningUp.current) {
            console.log('📝 Initializing Quill editor with value:', value);
            
            // Create Quill instance with organized toolbar
            quillInstance.current = new Quill(editorRef.current, {
                theme: "snow",
                placeholder: placeholder,
                readOnly: disabled || readOnly,
                modules: {
                    toolbar: [
                        // Text formatting group
                        ['bold', 'italic', 'underline', 'strike'],
                        
                        // Heading and text size
                        [{ 'header': [1, 2, 3, false] }],
                        
                        // Lists
                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                        
                        // Alignment and indentation
                        [{ 'align': [] }],
                        [{ 'indent': '-1' }, { 'indent': '+1' }],
                        
                        // Color options
                        [{ 'color': [] }, { 'background': [] }],
                        
                        // Insert options
                        ['link', 'image'],
                        
                        // Clear formatting
                        ['clean']
                    ],
                },
            })

            // CRITICAL FIX: Handle text changes with better logic
            quillInstance.current.on("text-change", (_delta, _oldDelta, source) => {
                if (quillInstance.current && !isProgrammaticUpdate.current) {
                    const html = quillInstance.current.root.innerHTML;
                    const processedHtml = processContent(html);
                    
                    console.log('📝 Quill text-change event:', {
                        source,
                        html: processedHtml,
                        htmlLength: processedHtml.length,
                        isProgrammatic: isProgrammaticUpdate.current
                    });
                    
                    // Only call onChange for user changes
                    if (source === 'user') {
                        console.log('✅ Calling onChange with:', processedHtml);
                        onChange(processedHtml);
                    }
                }
            });

            setIsInitialized(true);
        }

        // Cleanup on unmount
        return () => {
            isCleaningUp.current = true;
            
            if (quillInstance.current) {
                try {
                    quillInstance.current.off("text-change");
                    
                    if (editorContainerRef.current) {
                        const toolbars = editorContainerRef.current.querySelectorAll('.ql-toolbar');
                        toolbars.forEach(toolbar => {
                            if (toolbar.parentNode) {
                                toolbar.parentNode.removeChild(toolbar);
                            }
                        });
                    }
                    
                    if (editorRef.current) {
                        editorRef.current.innerHTML = '';
                    }
                    
                    quillInstance.current = null;
                } catch (error) {
                    console.error('Error cleaning up Quill editor:', error);
                }
            }
            
            setIsInitialized(false);
            
            setTimeout(() => {
                isCleaningUp.current = false;
            }, 100);
        }
    }, []) // Empty dependency array

    // Helper to process content (strip wrappers)
    const processContent = (content: string) => {
        if (!content) return "";
        let processed = content;

        // Unescape if needed
        if (processed.trim().startsWith("&lt;") || processed.includes("&lt;div")) {
            const txt = document.createElement("textarea");
            txt.innerHTML = processed;
            processed = txt.value;
        }

        // Strip wrapping .ql-editor div
        const wrapperRegex = /^<div\s+class=["']ql-editor[^"']*["'][^>]*>([\s\S]*)<\/div>$/i;
        const match = processed.match(wrapperRegex);
        if (match) {
            processed = match[1];
        }
        
        return processed;
    }

    // Update editor content when value prop changes (from parent)
    useEffect(() => {
        if (quillInstance.current && isInitialized) {
            const currentContent = quillInstance.current.root.innerHTML;
            const processedValue = processContent(value || "");

            console.log('🔄 Value prop changed:', {
                newValue: processedValue,
                currentContent,
                areEqual: processedValue === currentContent
            });

            // Only update if the values are actually different
            if (processedValue !== currentContent && value !== currentContent) {
                console.log('📝 Updating Quill content programmatically');
                
                isProgrammaticUpdate.current = true;
                
                const selection = quillInstance.current.getSelection();
                quillInstance.current.root.innerHTML = processedValue;
                
                if (selection && quillInstance.current.hasFocus()) {
                    quillInstance.current.setSelection(selection);
                }
                
                // Reset flag after a short delay
                setTimeout(() => {
                    isProgrammaticUpdate.current = false;
                }, 100);
            }
        }
    }, [value, isInitialized])

    // Update disabled/readOnly state
    useEffect(() => {
        if (quillInstance.current) {
            quillInstance.current.enable(!(disabled || readOnly))
        }
    }, [disabled, readOnly])

    return (
        <div ref={editorContainerRef} className="rich-text-editor">
            <div ref={editorRef} className="bg-white" />
            <style>{`
                /* Container styles */
                .rich-text-editor {
                    width: 100%;
                    max-width: 100%;
                    position: relative;
                }

                /* IMPORTANT: Hide any duplicate toolbars */
                .rich-text-editor .ql-toolbar ~ .ql-toolbar {
                    display: none !important;
                }

                /* Toolbar styles */
                .rich-text-editor .ql-toolbar {
                    border-top-left-radius: 0.375rem;
                    border-top-right-radius: 0.375rem;
                    font-family: inherit;
                    background-color: #f8f9fa;
                    border: 1px solid #ccc;
                    border-bottom: none;
                    display: flex !important;
                    flex-wrap: wrap;
                    visibility: visible !important;
                    opacity: 1 !important;
                    padding: 8px;
                    gap: 4px;
                }

                /* Toolbar button groups */
                .rich-text-editor .ql-toolbar .ql-formats {
                    display: inline-flex;
                    align-items: center;
                    margin-right: 8px;
                    margin-bottom: 4px;
                }

                /* Toolbar buttons */
                .rich-text-editor .ql-toolbar button,
                .rich-text-editor .ql-toolbar .ql-picker-label {
                    padding: 5px 8px;
                    margin: 0 2px;
                }

                .rich-text-editor .ql-toolbar button,
                .rich-text-editor .ql-toolbar .ql-picker-label,
                .rich-text-editor .ql-toolbar .ql-picker-item,
                .rich-text-editor .ql-toolbar .ql-stroke {
                    stroke: #333 !important;
                    color: #333 !important;
                }

                .rich-text-editor .ql-fill {
                    fill: #333 !important;
                }

                /* Editor container */
                .rich-text-editor .ql-container {
                    border-bottom-left-radius: 0.375rem;
                    border-bottom-right-radius: 0.375rem;
                    min-height: 200px;
                    font-family: inherit;
                    font-size: 1rem;
                    border: 1px solid #ccc;
                    border-top: none;
                }

                .rich-text-editor .ql-editor {
                    min-height: 200px;
                    background-color: white;
                    font-size: 1rem;
                    line-height: 1.5;
                }

                /* Hover effects */
                .rich-text-editor .ql-toolbar button:hover,
                .rich-text-editor .ql-toolbar .ql-picker-label:hover {
                    background-color: #e9ecef;
                    border-radius: 3px;
                }

                /* Active state */
                .rich-text-editor .ql-toolbar button.ql-active,
                .rich-text-editor .ql-toolbar .ql-picker-label.ql-active {
                    background-color: #007bff;
                    color: white !important;
                    border-radius: 3px;
                }

                .rich-text-editor .ql-toolbar button.ql-active .ql-stroke {
                    stroke: white !important;
                }

                .rich-text-editor .ql-toolbar button.ql-active .ql-fill {
                    fill: white !important;
                }

                /* Mobile responsive styles */
                @media (max-width: 768px) {
                    .rich-text-editor .ql-toolbar {
                        padding: 6px 4px;
                    }

                    .rich-text-editor .ql-toolbar .ql-formats {
                        margin-right: 4px;
                        margin-bottom: 4px;
                    }

                    .rich-text-editor .ql-toolbar button,
                    .rich-text-editor .ql-toolbar .ql-picker-label {
                        padding: 4px 6px;
                        margin: 0 1px;
                    }

                    .rich-text-editor .ql-container,
                    .rich-text-editor .ql-editor {
                        min-height: 150px;
                        font-size: 0.9rem;
                    }

                    /* Make picker dropdowns full width on mobile */
                    .rich-text-editor .ql-toolbar .ql-picker {
                        font-size: 0.85rem;
                    }
                }

                @media (max-width: 480px) {
                    .rich-text-editor .ql-toolbar {
                        padding: 4px 2px;
                    }

                    .rich-text-editor .ql-toolbar button,
                    .rich-text-editor .ql-toolbar .ql-picker-label {
                        padding: 3px 4px;
                    }

                    .rich-text-editor .ql-container,
                    .rich-text-editor .ql-editor {
                        min-height: 120px;
                        font-size: 0.85rem;
                    }
                }

                /* Dropdown menus */
                .rich-text-editor .ql-picker-options {
                    max-height: 200px;
                    overflow-y: auto;
                }
            `}</style>
        </div>
    )
}

export default RichTextEditor