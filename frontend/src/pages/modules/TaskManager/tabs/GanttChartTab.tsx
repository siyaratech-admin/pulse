import React from "react";
import Gantt from "@/components/custom_components/Gantt";
import { useFrappeGetDocList } from "frappe-react-sdk";
import { format } from "date-fns";

const GanttChartTab: React.FC = () => {
  const { data: tasks } = useFrappeGetDocList("Task", {
    fields: ["name", "subject", "exp_start_date", "exp_end_date", "progress"],
    limit: 1000,
  });

  const formattedTasks = {
    data:
      tasks?.map((task) => ({
        id: task.name,
        text: task.subject,
        start_date: format(new Date(task.exp_start_date), "dd-MM-yyyy"),
        duration:
          (new Date(task.exp_end_date).getTime() - new Date(task.exp_start_date).getTime()) /
          (1000 * 60 * 60 * 24),
        progress: task.progress / 100,
      })) || [],
    links: [],
  };

  return (
    <div>
      <Gantt tasks={formattedTasks} />
    </div>
  );
};

export default GanttChartTab;
