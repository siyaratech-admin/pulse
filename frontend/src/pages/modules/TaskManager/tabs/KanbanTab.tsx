import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trello } from "lucide-react"
import { useFrappeAuth } from "frappe-react-sdk"
import { KanbanView } from "../components/kanban/KanbanView"

interface KanbanTabProps {
  filterProject: string
}

export const KanbanTab: React.FC<KanbanTabProps> = ({ filterProject }) => {
  const { currentUser } = useFrappeAuth()

  // Build filters: always filter by current user, optionally filter by project
  const filters: [string, string, any][] = []

  // Filter by assigned user
  if (currentUser) {
    filters.push(["_assign", "LIKE", `%${currentUser}%`])
  }

  // Filter by project if not "all"
  if (filterProject !== "all") {
    filters.push(["project", "=", filterProject])
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trello className="h-5 w-5" />
            Kanban Board
          </CardTitle>
          <CardDescription>
            Drag and drop tasks to update their status. Click a card to edit or view details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <KanbanView
            doctype="Task"
            columnField="status"
            filters={filters}
            projectName={filterProject !== "all" ? filterProject : undefined}
          />
        </CardContent>
      </Card>
    </div>
  )
}
