import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Plus, Flag, AlertCircle } from "lucide-react"

export const ActivitiesTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Recent Task Activities</CardTitle>
          <CardDescription>Latest task updates and assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Task "Update Documentation" completed</p>
                  <p className="text-sm text-muted-foreground">By John Doe</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">2 hours ago</div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <Plus className="h-5 w-5 text-blue-600" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">New task "Review Code" assigned</p>
                  <p className="text-sm text-muted-foreground">Assigned to Jane Smith</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">5 hours ago</div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <Flag className="h-5 w-5 text-orange-600" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Priority changed to High</p>
                  <p className="text-sm text-muted-foreground">Task "Fix Security Issue"</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">1 day ago</div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Task overdue</p>
                  <p className="text-sm text-muted-foreground">Task "Client Meeting Prep"</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">2 days ago</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
