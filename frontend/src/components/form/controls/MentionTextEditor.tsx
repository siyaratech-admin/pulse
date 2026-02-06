import React, { useRef, useEffect, useState } from "react"
import Quill from "quill"
import "quill/dist/quill.bubble.css"
import "@/styles/mention-editor.css"

// Import and register Frappe's mention module
// @ts-ignore - JS module without types
import MentionModule from "@/lib/quill-mention/quill.mention"

// Register the mention module with Quill
if (typeof window !== "undefined") {
  Quill.register("modules/mention", MentionModule, true)
}

interface MentionTextEditorProps {
  value: string
  onChange: (html: string) => void
  onSubmit?: () => void
  placeholder?: string
  disabled?: boolean
}

// Get CSRF token from cookie
const getCsrfToken = (): string => {
  const cookies = document.cookie.split("; ")
  const csrfCookie = cookies.find((row) => row.startsWith("csrf_token="))
  return csrfCookie ? csrfCookie.split("=")[1] : ""
}

const MentionTextEditor: React.FC<MentionTextEditorProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Type @ to mention someone...",
  disabled = false,
}) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const quillInstance = useRef<Quill | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize Quill editor
  useEffect(() => {
    if (editorRef.current && !quillInstance.current) {
      // Create Quill instance
      quillInstance.current = new Quill(editorRef.current, {
        theme: "bubble",
        placeholder: placeholder,
        readOnly: disabled,
        modules: {
          mention: {
            allowedChars: /^[A-Za-z0-9_]*$/,
            mentionDenotationChars: ["@"],
            isolateCharacter: true,
            minChars: 0,
            maxChars: 31,
            source: async (searchTerm: string, renderList: (data: any[], searchTerm: string) => void) => {
              try {
                const response = await fetch("/api/method/frappe.desk.search.get_names_for_mentions", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "X-Frappe-CSRF-Token": getCsrfToken(),
                  },
                  credentials: "include",
                  body: JSON.stringify({ search_term: searchTerm }),
                })

                if (!response.ok) {
                  console.error("Failed to fetch mentions")
                  renderList([], searchTerm)
                  return
                }

                const data = await response.json()
                renderList(data.message || [], searchTerm)
              } catch (error) {
                console.error("Error fetching mentions:", error)
                renderList([], searchTerm)
              }
            },
            renderItem: (item: any) => {
              // Render user/group in dropdown
              const groupIcon = item.is_group ? " 👥" : ""
              return `${item.value}${groupIcon}`
            },
          },
          toolbar: false,
          keyboard: {
            bindings: {
              // Custom binding for Ctrl+Enter to submit
              submit: {
                key: "Enter",
                ctrlKey: true,
                handler: () => {
                  if (onSubmit) {
                    onSubmit()
                  }
                  return false
                },
              },
              // Custom binding for Cmd+Enter to submit (Mac)
              submitMac: {
                key: "Enter",
                metaKey: true,
                handler: () => {
                  if (onSubmit) {
                    onSubmit()
                  }
                  return false
                },
              },
            },
          },
        },
      })

      // Handle text changes
      quillInstance.current.on("text-change", () => {
        if (quillInstance.current) {
          const html = quillInstance.current.root.innerHTML
          // Only call onChange if content actually changed to avoid loops
          if (html !== value) {
            onChange(html)
          }
        }
      })

      setIsInitialized(true)
    }

    // Cleanup on unmount
    return () => {
      if (quillInstance.current) {
        quillInstance.current = null
      }
    }
  }, []) // Empty dependency array - only run once

  // Update editor content when value prop changes
  useEffect(() => {
    if (quillInstance.current && isInitialized) {
      const currentContent = quillInstance.current.root.innerHTML
      // Only update if the content is actually different
      if (value !== currentContent) {
        // Save cursor position
        const selection = quillInstance.current.getSelection()

        // Update content
        quillInstance.current.root.innerHTML = value || ""

        // Restore cursor position if it existed
        if (selection) {
          quillInstance.current.setSelection(selection)
        }
      }
    }
  }, [value, isInitialized])

  // Update disabled state
  useEffect(() => {
    if (quillInstance.current) {
      quillInstance.current.enable(!disabled)
    }
  }, [disabled])

  // Update placeholder
  useEffect(() => {
    if (quillInstance.current && editorRef.current) {
      editorRef.current.dataset.placeholder = placeholder
    }
  }, [placeholder])

  return (
    <div className="mention-text-editor">
      <div
        ref={editorRef}
        className={disabled ? "opacity-50 cursor-not-allowed" : ""}
      />
    </div>
  )
}

export default MentionTextEditor
