import React from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ListTodo } from "lucide-react"

interface Shortcut {
  title: string
  description: string
  icon: React.ReactNode
  route: string
}

interface TaskCategory {
  title: string
  description: string
  color: string
  icon: React.ReactNode
  shortcuts: Shortcut[]
}

interface ShortcutsTabProps {
  taskCategories: TaskCategory[]
}

export const ShortcutsTab: React.FC<ShortcutsTabProps> = ({ taskCategories }) => {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <ListTodo className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quick Access</h2>
          <p className="text-sm text-muted-foreground">Shortcut links to common task management actions</p>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {taskCategories.map((category, categoryIndex) => (
          <Card key={categoryIndex} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${category.color}`}>{category.icon}</div>
                <div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                  <CardDescription className="text-xs">{category.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {category.shortcuts.map((shortcut, shortcutIndex) => (
                  <div
                    key={shortcutIndex}
                    onClick={() => navigate(shortcut.route)}
                    className="p-3 rounded-lg border border-gray-200 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer bg-white hover:bg-gray-50"
                  >
                    <div className="flex items-start gap-2">
                      <div className="p-1 rounded bg-gray-100">{shortcut.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-xs text-gray-900 mb-1">{shortcut.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{shortcut.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
