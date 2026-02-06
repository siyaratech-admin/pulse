import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { X, Plus, ListTodo } from "lucide-react"

interface AcceptanceCriteriaItem {
    description: string
    criteria_met: number | boolean
    name?: string
    doctype?: string
}

interface AcceptanceCriteriaSectionProps {
    items: AcceptanceCriteriaItem[]
    onChange: (items: AcceptanceCriteriaItem[]) => void
    disabled?: boolean
}

export const AcceptanceCriteriaSection: React.FC<AcceptanceCriteriaSectionProps> = ({
    items = [],
    onChange,
    disabled
}) => {
    const [newDescription, setNewDescription] = useState("")
    const [isAddingItem, setIsAddingItem] = useState(false)

    const handleToggleItem = (index: number) => {
        if (disabled) return
        const updatedItems = [...items]
        updatedItems[index] = {
            ...updatedItems[index],
            criteria_met: updatedItems[index].criteria_met ? 0 : 1
        }
        onChange(updatedItems)
    }

    const handleRemoveItem = (index: number) => {
        if (disabled) return
        const updatedItems = items.filter((_, i) => i !== index)
        onChange(updatedItems)
    }

    const handleAddItem = () => {
        if (newDescription.trim()) {
            const newItem: AcceptanceCriteriaItem = {
                description: newDescription.trim(),
                criteria_met: 0,
                doctype: "Acceptance Criteria"
            }
            onChange([...items, newItem])
            setNewDescription("")
            setIsAddingItem(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            event?.preventDefault(); // Prevent form submission
            handleAddItem()
        } else if (e.key === "Escape") {
            setNewDescription("")
            setIsAddingItem(false)
        }
    }

    const completedCount = items.filter(item => item.criteria_met).length
    const totalCount = items.length

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <ListTodo className="h-4 w-4" />
                    Acceptance Criteria
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
                        <div className="divide-y">
                            {items.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 px-3 py-2 group hover:bg-gray-50 transition-colors"
                                >
                                    <Checkbox
                                        id={`criteria-${index}`}
                                        checked={!!item.criteria_met}
                                        onCheckedChange={() => handleToggleItem(index)}
                                        disabled={disabled}
                                        className="mt-0.5 self-start"
                                    />
                                    <span
                                        className={`text-sm flex-1 ${item.criteria_met ? "line-through text-gray-400" : "text-gray-700"
                                            }`}
                                    >
                                        {item.description}
                                    </span>
                                    {!disabled && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem(index)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                                            title="Remove item"
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
                        No acceptance criteria defined. Add criteria below.
                    </div>
                )}
            </div>

            {!disabled && (
                <div className="mt-3">
                    {isAddingItem ? (
                        <div className="space-y-2 border rounded-lg p-3 bg-gray-50">
                            <div>
                                <label className="text-xs text-gray-600 mb-1 block">Parameter / Description</label>
                                <Input
                                    type="text"
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Enter acceptance criteria..."
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setNewDescription("")
                                        setIsAddingItem(false)
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleAddItem}
                                    disabled={!newDescription.trim()}
                                    className="bg-black text-white hover:bg-gray-800"
                                >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add
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
                            Add Acceptance Criteria
                        </Button>
                    )}
                </div>
            )}
        </div>
    )
}
