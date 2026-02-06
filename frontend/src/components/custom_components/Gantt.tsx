import React, { useEffect, useRef, useState } from "react"
import { gantt } from "dhtmlx-gantt"
import "dhtmlx-gantt/codebase/dhtmlxgantt.css"

interface GanttProps {
  tasks: {
    data: any[]
    links: any[]
  }
  onTaskUpdate?: (id: string, task: any) => void
  onLinkAdd?: (link: any) => void
  onLinkDelete?: (id: string) => void
  onTaskDelete?: (id: string) => void
  onRowReorder?: (orderedIds: any[]) => void
  onTaskClick?: (id: string) => void
  expandAll?: boolean
  columns?: any[]
  enableTooltip?: boolean
}

type ZoomLevel = "Day" | "Week" | "Month" | "Quarter" | "Year"

const Gantt: React.FC<GanttProps> = ({
  tasks,
  onTaskUpdate,
  onLinkAdd,
  onRowReorder,
  onLinkDelete,
  onTaskDelete,
  onTaskClick,
  expandAll,
  columns,
  enableTooltip = true,
}) => {
  const ganttContainer = useRef<HTMLDivElement>(null)
  const isInitialized = useRef(false)
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>("Month")

  /* ---------------- Get Status Color with Enhanced Logic ---------------- */
  const getStatusColor = (status: string, task?: any) => {
    // Check if task is overdue
    if (task && task.end_date) {
      const endDate = new Date(task.end_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (endDate < today && status !== 'Completed' && status !== 'Cancelled') {
        return '#ef4444' // Red for overdue
      }
    }

    const statusColors: { [key: string]: string } = {
      'Open': '#94a3b8',           // Grey
      'Not Started': '#94a3b8',    // Grey
      'Working': '#3b82f6',        // Blue
      'In Progress': '#3b82f6',    // Blue
      'Pending Review': '#f59e0b', // Orange
      'Completed': '#10b981',      // Green
      'On Hold': '#f59e0b',        // Orange
      'Cancelled': '#6b7280',      // Dark Grey
      'Overdue': '#ef4444',        // Red
      'Pending': '#8b5cf6',        // Purple
      'Review': '#ec4899',         // Pink
    }
    return statusColors[status] || '#6366f1'
  }

  /* ---------------- Apply Zoom Level ---------------- */
  const applyZoomLevel = (level: ZoomLevel) => {
    switch (level) {
      case "Day":
        gantt.config.scales = [
          { unit: "month", step: 1, format: "%F %Y" },
          { unit: "day", step: 1, format: "%d" },
        ]
        gantt.config.min_column_width = 40
        break
      case "Week":
        gantt.config.scales = [
          { unit: "month", step: 1, format: "%F %Y" },
          { unit: "week", step: 1, format: "W%W" },
        ]
        gantt.config.min_column_width = 60
        break
      case "Quarter":
        gantt.config.scales = [
          { unit: "year", step: 1, format: "%Y" },
          {
            unit: "quarter",
            step: 1,
            format: (date) => {
              const quarter = Math.floor(date.getMonth() / 3) + 1
              return `Q${quarter}`
            },
          },
        ]
        gantt.config.min_column_width = 80
        break
      case "Year":
        gantt.config.scales = [
          { unit: "year", step: 1, format: "%Y" },
          { unit: "month", step: 1, format: "%M" },
        ]
        gantt.config.min_column_width = 50
        break
      default:
        gantt.config.scales = [
          { unit: "year", step: 1, format: "%Y" },
          { unit: "month", step: 1, format: "%F" },
        ]
        gantt.config.min_column_width = 70
    }
    gantt.render()
  }

  /* ---------------- Handle Zoom Change ---------------- */
  const handleZoomChange = (level: ZoomLevel) => {
    setZoomLevel(level)
    applyZoomLevel(level)
  }

  /* ---------------- Expand/Collapse ---------------- */
  useEffect(() => {
    if (gantt.getTaskCount() > 0) {
      gantt.batchUpdate(() => {
        gantt.eachTask((task) => {
          expandAll ? gantt.open(task.id) : gantt.close(task.id)
        })
      })
    }
  }, [expandAll])

  useEffect(() => {
    if (!ganttContainer.current) return

    // Clean up
    gantt.clearAll();

    // Only initialize once (or if zoom level drastically changes logic, but applyZoom handles that)
    if (!isInitialized.current) {
      gantt.plugins({
        tooltip: enableTooltip,
        marker: true,
      })

      /* ✅ Config */
      gantt.config.drag_move = false
      gantt.config.drag_resize = false
      gantt.config.drag_progress = false
      gantt.config.drag_links = true
      gantt.config.show_links = true
      gantt.config.link_line_width = 2
      gantt.config.link_wrapper_width = 20
      gantt.config.auto_scheduling = true
      gantt.config.auto_scheduling_strict = true
      gantt.config.readonly = false
      gantt.config.show_task_cells = true

      /* ✅ Date & Layout Config */
      gantt.config.xml_date = "%Y-%m-%d";
      gantt.config.date_format = "%Y-%m-%d";
      gantt.config.start_date = null; // Auto
      gantt.config.end_date = null;   // Auto

      gantt.config.duration_unit = "day"
      gantt.config.scale_height = 60
      gantt.config.row_height = 44
      gantt.config.bar_height = 32
      gantt.config.fit_tasks = false
      gantt.config.autosize = false

      // Default Layout (avoid complex layouts if they cause issues, but keeping basic multi-col)
      gantt.config.layout = {
        css: "gantt_container",
        cols: [
          {
            width: 420,
            min_width: 320,
            rows: [
              { view: "grid", scrollX: "gridScroll", scrollY: "scrollVer" },
              { view: "scrollbar", id: "gridScroll", group: "horizontal" },
            ],
          },
          { resizer: true, width: 2 },
          {
            rows: [
              { view: "timeline", scrollX: "scrollHor", scrollY: "scrollVer" },
              { view: "scrollbar", id: "scrollHor", group: "horizontal" },
            ],
          },
          { view: "scrollbar", id: "scrollVer" },
        ],
      }

      /* ---------------- Columns ---------------- */
      gantt.config.columns = columns || [
        {
          name: "idx",
          label: "#",
          width: 50,
          align: "center",
          template: (task) => `<span style="color:#6366f1;font-weight:600;">${task.idx || ''}</span>`,
        },
        {
          name: "text",
          label: "Task Name",
          tree: true,
          width: 220,
          template: (task) => `<span style="font-weight:500;color:#1e293b;">${task.text}</span>`,
        },
        {
          name: "start_date",
          label: "Start Date",
          align: "center",
          width: 100,
          template: (task) => task.start_date, // Already formatted string
        },
        {
          name: "duration",
          label: "Days",
          align: "center",
          width: 60,
          template: (task) => `<span style="color:#64748b;">${task.duration}d</span>`,
        },
      ]

      applyZoomLevel(zoomLevel)

      gantt.config.order_branch = true
      gantt.config.order_branch_free = false
      gantt.config.details_on_dblclick = true

      /* ---------------- Enhanced Tooltip ---------------- */
      if (enableTooltip) {
        gantt.config.tooltip_offset_x = 15
        gantt.config.tooltip_offset_y = -40
        gantt.config.tooltip_hide_timeout = 200

        gantt.templates.tooltip_text = (start, end, task) => {
          const progress = task.progress ? Math.round(task.progress * 100) : 0
          const status = task.status || 'Not Started'
          const isOverdue = end < new Date() && status !== 'Completed' && status !== 'Cancelled'

          return `
                <div style="padding:8px 12px;font-size:13px;line-height:1.6;">
                  <div style="font-weight:700;color:#1e293b;margin-bottom:8px;font-size:14px;">${task.text}</div>
                  <div style="color:#64748b;"><b>Start:</b> ${gantt.templates.tooltip_date_format(start)}</div>
                  <div style="color:#64748b;"><b>End:</b> ${gantt.templates.tooltip_date_format(end)}</div>
                  <div style="color:#64748b;"><b>Duration:</b> ${task.duration} days</div>
                  <div style="margin-top:6px;padding-top:6px;border-top:1px solid #e2e8f0;">
                    <div><b>Status:</b> <span style="color:${getStatusColor(status, task)};font-weight:600;">${isOverdue ? 'Overdue' : status}</span></div>
                    <div><b>Progress:</b> <span style="color:#10b981;font-weight:600;">${progress}%</span></div>
                  </div>
                </div>
              `
        }
      }

      /* ===================== UI ENHANCEMENTS ===================== */
      gantt.templates.task_text = (start, end, task) => {
        return `<div class="task-content">${task.text}</div>`
      }

      gantt.templates.task_class = (start, end, task) => {
        const status = task.status || 'Open'
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (end < today && status !== 'Completed' && status !== 'Cancelled') {
          return 'rounded-task status-overdue'
        }

        return `rounded-task status-${status.toLowerCase().replace(/\s+/g, '-')}`
      }

      gantt.templates.task_style = (start, end, task) => {
        const status = task.status || 'Open'
        const color = getStatusColor(status, task)
        return `background: ${color};`
      }

      gantt.templates.progress_text = () => ""

      gantt.templates.scale_cell_class = (date) => {
        const day = date.getDay()
        return day === 0 || day === 6 ? "weekend-cell" : ""
      }

      gantt.templates.timeline_cell_class = (_task, date) => {
        const day = date.getDay()
        return day === 0 || day === 6 ? "weekend-cell" : ""
      }

      gantt.templates.grid_row_class = (_start, _end, task) => {
        return task.$index % 2 === 0 ? "even-row" : "odd-row"
      }

      /* ✅ Today marker */
      const today = new Date()
      gantt.addMarker({
        start_date: today,
        css: "today-line",
        text: "Today",
        title: "Today",
      })

      gantt.init(ganttContainer.current);
      isInitialized.current = true;
    }

    // Process Data (Convert Dates to Strings STRICTLY)
    const formattedData = tasks.data.map(t => {
      let startStr = "";
      if (t.start_date instanceof Date) {
        startStr = t.start_date.toISOString().split('T')[0];
      } else if (typeof t.start_date === 'string') {
        const parts = t.start_date.split('T')[0].split(/[-/]/);
        if (parts.length === 3) {
          // Ensure YYYY-MM-DD
          if (parts[0].length === 4) startStr = `${parts[0]}-${parts[1]}-${parts[2]}`;
          else startStr = `${parts[2]}-${parts[1]}-${parts[0]}`; // assuming DD-MM-YYYY -> YYYY-MM-DD
        } else {
          startStr = t.start_date;
        }
      } else {
        // Default to today if missing
        startStr = new Date().toISOString().split('T')[0];
      }

      return {
        ...t,
        id: t.id || t.name,
        start_date: startStr,
        duration: t.duration || 1,
        open: true, // Force open
        type: t.type || 'task'
      };
    });

    try {
      console.log('🔄 Loading Data into Gantt...', { data: formattedData, links: tasks.links });
      gantt.parse({
        data: formattedData,
        links: tasks.links || []
      });

      // Force re-render to ensure UI catches up
      gantt.render();
      console.log("🎨 Gantt Force Render Triggered");

    } catch (e) {
      console.error('❌ Gantt Render Error:', e);
    }

    /* ---------------- Events ---------------- */
    const doubleClickEvent = gantt.attachEvent("onTaskDblClick", (id) => {
      console.log('🖱️ Gantt double-click event fired for task:', id);
      if (onTaskClick) {
        onTaskClick(id.toString());
        return false;
      }
      return true;
    });

    // Cleanup events on unmount
    return () => {
      gantt.detachEvent(doubleClickEvent);
    }

  }, [tasks, zoomLevel]);

  return (
    <div
      className="gantt-wrapper"
      style={{
        width: "100%",
        background: "#ffffff",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Zoom Control Bar (Restored) */}
      <div
        className="gantt-header flex flex-row flex-wrap gap-2.5 p-4 bg-gradient-to-r from-blue-600 to-blue-500 border-b border-gray-200"
      >
        <div className="flex flex-1 items-center gap-2 min-w-[150px]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span className="text-white font-semibold text-base">Timeline View</span>
        </div>
        <div
          className="gantt-zoom-controls flex flex-wrap gap-1.5 bg-white/15 p-1 rounded-md"
        >
          {(["Day", "Week", "Month", "Quarter", "Year"] as ZoomLevel[]).map((level) => (
            <button
              key={level}
              onClick={() => handleZoomChange(level)}
              className="zoom-button"
              style={{
                padding: "8px 16px",
                border: "none",
                borderRadius: "6px",
                background: zoomLevel === level ? "white" : "transparent",
                color: zoomLevel === level ? "#667eea" : "white",
                fontWeight: zoomLevel === level ? 600 : 500,
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: zoomLevel === level ? "0 2px 4px rgba(0, 0, 0, 0.1)" : "none",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                if (zoomLevel !== level) {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"
                }
              }}
              onMouseLeave={(e) => {
                if (zoomLevel !== level) {
                  e.currentTarget.style.background = "transparent"
                }
              }}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Gantt Chart Container */}
      <div
        ref={ganttContainer}
        className="gantt-container-responsive"
        style={{ width: "100%", height: "600px" }}
      />

      {/* Custom Styles (Restored) */}
      <style>{`
        .gantt_task_line.rounded-task {
          border-radius: 8px;
          border: none !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: visible !important;
        }

        .gantt_task_line.status-open { background: #94a3b8 !important; }
        .gantt_task_line.status-not-started { background: #94a3b8 !important; }
        .gantt_task_line.status-working { background: #3b82f6 !important; }
        .gantt_task_line.status-in-progress { background: #3b82f6 !important; }
        .gantt_task_line.status-pending-review { background: #f59e0b !important; }
        .gantt_task_line.status-completed { background: #10b981 !important; }
        .gantt_task_line.status-on-hold { background: #f59e0b !important; }
        .gantt_task_line.status-cancelled { background: #6b7280 !important; }
        .gantt_task_line.status-overdue { background: #ef4444 !important; }
        .gantt_task_line.status-pending { background: #8b5cf6 !important; }
        .gantt_task_line.status-review { background: #ec4899 !important; }

        .gantt_task_progress {
          background: rgba(0, 0, 0, 0.35) !important;
          border-radius: 8px;
          z-index: 1;
        }

        .task-content {
          display: flex;
          align-items: center;
          padding: 0 12px;
          font-weight: 500;
          font-size: 13px;
          color: white;
          height: 100%;
          position: relative;
          z-index: 2;
        }

        .gantt_grid_scale {
          background: #f8fafc !important;
          border-bottom: 2px solid #e2e8f0 !important;
          font-weight: 600 !important;
          color: #475569 !important;
        }

        .gantt_grid_head_cell {
          color: #475569 !important;
          font-weight: 600 !important;
          border-right: 1px solid #e2e8f0 !important;
        }

        .even-row { background: #ffffff !important; }
        .odd-row { background: #f8fafc !important; }
        .gantt_row:hover { background: #f1f5f9 !important; }
        .gantt_cell { border-right: 1px solid #e2e8f0 !important; }

        .gantt_task_scale {
          background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%) !important;
          border-bottom: 2px solid #e2e8f0 !important;
          font-weight: 600 !important;
          color: #475569 !important;
        }

        .gantt_scale_line {
          border-top: none !important;
          font-weight: 600 !important;
          color: #475569 !important;
        }

        .gantt_scale_cell {
          border-right: 1px solid #e2e8f0 !important;
          color: #64748b !important;
        }

        .weekend-cell { background: #f1f5f9 !important; }

        .today-line {
          background: #3b82f6 !important;
          width: 2px !important;
          opacity: 0.7;
        }

        .gantt_marker_content {
          background: #3b82f6 !important;
          color: white !important;
          padding: 4px 8px !important;
          border-radius: 4px !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          margin-top: -25px !important;
        }
      `}</style>
    </div>
  )
}

export default Gantt