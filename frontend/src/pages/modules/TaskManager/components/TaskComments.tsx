import React, { useState } from "react"
import { useFrappeGetDocList } from "frappe-react-sdk"
import { format } from "date-fns"
import { MessageSquare, Send, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import MentionTextEditor from "@/components/form/controls/MentionTextEditor"

interface TaskCommentsProps {
  taskName: string
}

interface Comment {
  name: string
  content: string
  comment_by: string
  comment_email: string
  creation: string
  owner: string
}

// Get CSRF token from cookie
const getCsrfToken = (): string => {
  const cookies = document.cookie.split("; ")
  const csrfCookie = cookies.find((row) => row.startsWith("csrf_token="))
  return csrfCookie ? csrfCookie.split("=")[1] : ""
}

// Get user initials from email
const getUserInitials = (email: string): string => {
  if (!email) return "?"
  const parts = email.split("@")[0].split(".")
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return email.substring(0, 2).toUpperCase()
}

const TaskComments: React.FC<TaskCommentsProps> = ({ taskName }) => {
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch comments for this task
  const {
    data: comments,
    isLoading,
    error,
    mutate,
  } = useFrappeGetDocList<Comment>("Comment", {
    fields: ["name", "content", "comment_by", "comment_email", "creation", "owner"],
    filters: [
      ["reference_doctype", "=", "Task"],
      ["reference_name", "=", taskName],
      ["comment_type", "=", "Comment"],
    ],
    orderBy: {
      field: "creation",
      order: "desc",
    },
    limit: 100,
  })

  // Handle adding a new comment
  const handleAddComment = async () => {
    // Strip HTML tags to check if content is empty
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = newComment
    const textContent = tempDiv.textContent || tempDiv.innerText || ""

    if (!textContent.trim()) {
      toast.error("Comment cannot be empty")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/method/frappe.desk.form.utils.add_comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-Frappe-CSRF-Token": getCsrfToken(),
        },
        credentials: "include",
        body: new URLSearchParams({
          reference_doctype: "Task",
          reference_name: taskName,
          content: newComment,
          comment_email: "",
          comment_by: "",
        }).toString(),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to add comment")
      }

      // Success!
      setNewComment("")
      mutate() // Refresh the comment list
      toast.success("Comment added successfully")
    } catch (err: any) {
      console.error("Error adding comment:", err)
      toast.error(err.message || "Failed to add comment")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-3">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load comments. Please try again.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Add Comment Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8 mt-1">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <MentionTextEditor
                  value={newComment}
                  onChange={setNewComment}
                  onSubmit={handleAddComment}
                  placeholder="Add a comment... (Type @ to mention someone, Ctrl+Enter to submit)"
                  disabled={isSubmitting}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Type <kbd className="px-1 py-0.5 text-xs border rounded">@</kbd> to mention • Press{" "}
                    <kbd className="px-1 py-0.5 text-xs border rounded">Ctrl+Enter</kbd> to submit
                  </span>
                  <Button onClick={handleAddComment} disabled={isSubmitting}>
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Posting..." : "Post Comment"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Timeline */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">
            Comments {comments && comments.length > 0 && `(${comments.length})`}
          </h3>
        </div>

        {comments && comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <Card key={comment.name} className="border-t-4 border-t-primary/20">
                <CardContent className="pt-4">
                  <div className="flex gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {getUserInitials(comment.comment_email || comment.owner)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">
                            {comment.comment_by || comment.owner}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(comment.creation), "MMM dd, yyyy 'at' hh:mm a")}
                          </p>
                        </div>
                      </div>
                      <div
                        className="text-sm prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: comment.content }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="pt-12 pb-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No comments yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Be the first to add a comment!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default TaskComments
