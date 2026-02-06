import type React from "react"
import EmployeeDashboard from "./EmployeeDashboard/EmployeeDashboard"
import EmployeeMainDashboard from "./EmployeeMainDashboard"

const Dashboard: React.FC = () => {
  console.log("Dashboard component rendering...")

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      {/* <EmployeeDashboard /> */}
      <EmployeeMainDashboard />
    </div>
  )
}

export default Dashboard
