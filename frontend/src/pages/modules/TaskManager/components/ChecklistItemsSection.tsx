import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { X, Plus, User } from "lucide-react"
import { LinkField } from "@/components/form/fields/SelectionFields"

interface ChecklistItem {
  person: string
  checklist_name: string
  completed: number | boolean
  name?: string // Row name for Frappe child table
}

interface ChecklistItemsSectionProps {
  items: ChecklistItem[]
  onChange: (items: ChecklistItem[]) => void
  currentUser?: string  // Current logged-in user
  taskOwner?: string    // Task creator/owner
  canAddRows?: boolean  // Explicit permission to add rows
  canDeleteRows?: boolean  // Explicit permission to delete rows
  disabled?: boolean    // Legacy/override prop
}

export const ChecklistItemsSection: React.FC<ChecklistItemsSectionProps> = ({
  items = [],
  onChange,
  currentUser,
  taskOwner,
  canAddRows,
  canDeleteRows,
  disabled
}) => {
  const [newItemPerson, setNewItemPerson] = useState("")
  const [newItemChecklistName, setNewItemChecklistName] = useState("")
  const [isAddingItem, setIsAddingItem] = useState(false)

  // Permission helper functions
  const canToggleItem = (item: ChecklistItem): boolean => {
    if (disabled) return false
    // Owner should NEVER be able to toggle, even if assigned to themselves
    if (currentUser === taskOwner) return false
    // Only the assigned person (who is NOT the owner) can check/uncheck
    return currentUser === item.person
  }

  const canDeleteItem = (): boolean => {
    if (disabled) return false
    // Check explicit permission first
    if (canDeleteRows === false) return false
    // Only task owner can delete checklist items
    return currentUser === taskOwner
  }

  const canAddItem = (): boolean => {
    if (disabled) return false
    // Check explicit permission first
    if (canAddRows === false) return false
    // Only task owner can add checklist items
    return currentUser === taskOwner
  }

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
    if (newItemPerson.trim() && newItemChecklistName.trim()) {
      const newItem: ChecklistItem = {
        person: newItemPerson.trim(),
        checklist_name: newItemChecklistName.trim(),
        completed: 0
      }
      onChange([...items, newItem])
      setNewItemPerson("")
      setNewItemChecklistName("")
      setIsAddingItem(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddItem()
    } else if (e.key === "Escape") {
      setNewItemPerson("")
      setNewItemChecklistName("")
      setIsAddingItem(false)
    }
  }

  const completedCount = items.filter(item => item.completed).length
  const totalCount = items.length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <User className="h-4 w-4" />
          Skills Checklist
        </h3>
        {totalCount > 0 && (
          <span className="text-xs text-gray-500">
            {completedCount}/{totalCount} completed
          </span>
        )}
      </div>

      <div className="space-y-2">
        {items.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 border-b px-3 py-2 grid grid-cols-[auto_1fr_2fr_auto] gap-3 text-xs font-medium text-gray-600">
              <div className="w-8">Done</div>
              <div>Assignee</div>
              <div>Skill/Checklist Item</div>
              <div className="w-8"></div>
            </div>
            <div className="divide-y">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[auto_1fr_2fr_auto] gap-3 px-3 py-2 items-center group hover:bg-gray-50 transition-colors"
                >
                  <Checkbox
                    id={`checklist-${index}`}
                    checked={!!item.completed}
                    onCheckedChange={() => handleToggleItem(index)}
                    disabled={!canToggleItem(item)}
                  />
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-6 w-6 min-w-[1.5rem] rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-[10px] font-bold border border-blue-200">
                      {item.person.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs text-gray-700 truncate">{item.person}</span>
                  </div>
                  <span
                    className={`text-sm ${item.completed ? "line-through text-gray-400" : "text-gray-700"
                      }`}
                  >
                    {item.checklist_name}
                  </span>
                  {canDeleteItem() && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                      title="Remove item (Owner only)"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {items.length === 0 && !isAddingItem && (
          <div className="text-center py-6 text-sm text-gray-400 italic border border-dashed rounded-lg">
            No checklist items yet. Add items below or assign users to auto-populate skills.
          </div>
        )}
      </div>

      {canAddItem() && (
        <div className="mt-3">
          {isAddingItem ? (
            <div className="space-y-2 border rounded-lg p-3 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Assignee</label>
                  <LinkField
                    field={{
                      fieldname: "person",
                      label: "",
                      fieldtype: "Link",
                      options: "User",
                      placeholder: "Select user..."
                    }}
                    value={newItemPerson}
                    onChange={setNewItemPerson}
                    disabled={disabled}
                    showLabel={false}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Checklist Item / Skill</label>
                  <Input
                    type="text"
                    value={newItemChecklistName}
                    onChange={(e) => setNewItemChecklistName(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Enter skill or checklist item..."
                    autoFocus
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setNewItemPerson("")
                    setNewItemChecklistName("")
                    setIsAddingItem(false)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddItem}
                  disabled={!newItemPerson.trim() || !newItemChecklistName.trim()}
                  className="bg-gradient-to-r from-blue-600 to-blue-400 text-white hover:from-blue-700 hover:to-blue-600"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Item
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddingItem(true)}
              className="w-full text-grey-300 border border-gray-300 border-dashed"

            >
              <Plus className="h-4 w-4 mr-1" />
              Add Checklist Item
            </Button>
          )}
        </div>
      )}

    </div>
  )
}
