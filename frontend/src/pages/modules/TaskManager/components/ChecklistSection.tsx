import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { X, Plus } from "lucide-react"

interface ChecklistItem {
  task: string
  completed: number | boolean
  name?: string // Row name for Frappe child table
}

interface ChecklistSectionProps {
  items: ChecklistItem[]
  onChange: (items: ChecklistItem[]) => void
  disabled?: boolean
}

export const ChecklistSection: React.FC<ChecklistSectionProps> = ({
  items = [],
  onChange,
  disabled
}) => {
  const [newItemText, setNewItemText] = useState("")
  const [isAddingItem, setIsAddingItem] = useState(false)

  const handleToggleItem = (index: number) => {
    const updatedItems = [...items]
    updatedItems[index] = {
      ...updatedItems[index],
      completed: updatedItems[index].completed ? 0 : 1
    }
    onChange(updatedItems)
  }

  const handleRemoveItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index)
    onChange(updatedItems)
  }

  const handleAddItem = () => {
    if (newItemText.trim()) {
      const newItem: ChecklistItem = {
        task: newItemText.trim(),
        completed: 0
      }
      onChange([...items, newItem])
      setNewItemText("")
      setIsAddingItem(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddItem()
    } else if (e.key === "Escape") {
      setNewItemText("")
      setIsAddingItem(false)
    }
  }

  const completedCount = items.filter(item => item.completed).length
  const totalCount = items.length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Checklist</h3>
        {totalCount > 0 && (
          <span className="text-xs text-gray-500">
            {completedCount}/{totalCount}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-start gap-2 group hover:bg-gray-50 p-2 rounded-md transition-colors"
          >
            <Checkbox
              id={`checklist-${index}`}
              checked={!!item.completed}
              onCheckedChange={() => handleToggleItem(index)}
              disabled={disabled}
              className="mt-0.5"
            />
            <label
              htmlFor={`checklist-${index}`}
              className={`flex-1 text-sm cursor-pointer ${
                item.completed ? "line-through text-gray-400" : "text-gray-700"
              }`}
            >
              {item.task}
            </label>
            {!disabled && (
              <button
                onClick={() => handleRemoveItem(index)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                title="Remove item"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}

        {items.length === 0 && !isAddingItem && (
          <p className="text-sm text-gray-400 italic py-2">No checklist items yet</p>
        )}
      </div>

      {!disabled && (
        <div className="mt-3">
          {isAddingItem ? (
            <div className="flex gap-2">
              <Input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Enter checklist item..."
                className="flex-1"
                autoFocus
              />
              <Button
                type="button"
                size="sm"
                onClick={handleAddItem}
                disabled={!newItemText.trim()}
              >
                Add
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setNewItemText("")
                  setIsAddingItem(false)
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAddingItem(true)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add item
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
