import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { BookOpen, Plus, X, Table } from "lucide-react"

interface TaskCreationOptionsModalProps {
  open: boolean
  onClose: () => void
  onCreateNew: () => void
  onCreateFromLibrary: () => void
  onBulkCreate: () => void
  parentTaskSubject?: string
}

const TaskCreationOptionsModal: React.FC<TaskCreationOptionsModalProps> = ({
  open,
  onClose,
  onCreateNew,
  onCreateFromLibrary,
  onBulkCreate,
  parentTaskSubject,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}  >
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
          <DialogDescription>
            {parentTaskSubject ? (
              <>
                Choose how you want to create a child task under{" "}
                <span className="font-medium text-foreground">"{parentTaskSubject}"</span>
              </>
            ) : (
              "Choose how you want to create this task"
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-4">
          {/* Create from Library Button */}
          <Button
            variant="outline"
            className="h-auto p-6 flex flex-col items-center justify-center space-y-3 hover:bg-primary/5 hover:border-primary transition-all"
            onClick={() => {
              onCreateFromLibrary()
              onClose()
            }}
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-center">
              <div className="font-semibold text-base">Create from Library</div>
              <div className="text-sm text-muted-foreground mt-1">
                Select template tasks from the library
              </div>
            </div>
          </Button>

          {/* Bulk Create from Excel Button */}
          <Button
            variant="outline"
            className="h-auto p-6 flex flex-col items-center justify-center space-y-3 hover:bg-primary/5 hover:border-primary transition-all"
            onClick={() => {
              onBulkCreate()
              onClose()
            }}
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100">
              <Table className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-center">
              <div className="font-semibold text-base">Bulk Create from Excel</div>
              <div className="text-sm text-muted-foreground mt-1">
                Upload an Excel file to create multiple tasks
              </div>
            </div>
          </Button>

          {/* Create New Task Button */}
          <Button
            variant="outline"
            className="h-auto p-6 flex flex-col items-center justify-center space-y-3 hover:bg-primary/5 hover:border-primary transition-all"
            onClick={() => {
              onCreateNew()
              onClose()
            }}
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
              <Plus className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-center">
              <div className="font-semibold text-base">Create New Task</div>
              <div className="text-sm text-muted-foreground mt-1">Create a custom task manually</div>
            </div>
          </Button>
        </div>

        {/* Cancel Button */}
        <div className="flex justify-end pt-2 border-t">
          <Button variant="ghost" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TaskCreationOptionsModal
