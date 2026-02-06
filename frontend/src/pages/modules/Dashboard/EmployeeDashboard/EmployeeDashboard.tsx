import React, { useState } from "react"
import { useFrappeAuth, useFrappeGetCall, useFrappeGetDocList, useFrappeCreateDoc } from "frappe-react-sdk"
import { Loader2, LayoutGrid, TrendingUp, Trophy, Info, RefreshCw, MapPin, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EmployeeStatsSection } from "./sections/EmployeeStatsSection"
import { ChartsSection } from "./sections/ChartsSection"
import { TopPerformersList } from "./sections/TopPerformersList"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import { GeoTaggedCamera } from "@/components/common/GeoTaggedCamera"
import { toast } from "sonner"

export type FrequencyType = "daily" | "monthly" | "yearly"

const EmployeeDashboard: React.FC = () => {
  const { currentUser } = useFrappeAuth()
  const [frequency, setFrequency] = useState<FrequencyType>("monthly")
  const [showCheckInModal, setShowCheckInModal] = useState(false)
  const [isCheckingIn, setIsCheckingIn] = useState(false)

  // API 1: Dashboard Data
  const { data, isLoading, error, mutate } = useFrappeGetCall<any>(
    "kb_task.api.employee_leaderboard.get_employee_dashboard_data",
    { user_id: currentUser },
    undefined,
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  )

  // API 2: Energy Points
  const { data: energyPointsData, isLoading: isLoadingEnergyPoints } = useFrappeGetCall<any>(
    "kb_task.api.employee_leaderboard.get_employee_energy_points",
    { user_id: currentUser, frequency: frequency },
    `employee-energy-points-${frequency}`,
    { revalidateOnFocus: false }
  )

  // Fetch Employee Doc linked to User (needed for ID)
  // We extract it from dashboard data if available, or fetch separate if needed.
  // The dashboard API returns 'stats' but maybe not employee ID directly in a clean way?
  // Let's assume we can get it or fetch it. To be safe, let's fetch Employee ID.
  const { data: employeeData } = useFrappeGetCall('frappe.client.get_value', {
    doctype: 'Employee',
    filters: { user_id: currentUser },
    fieldname: ['name']
  });
  const employeeId = employeeData?.message?.name;

  // API 3: Fetch Last Checkin Status
  const { data: checkinList, mutate: mutateCheckins } = useFrappeGetDocList('Employee Checkin', {
    filters: [['employee', '=', employeeId || ""]],
    fields: ['log_type', 'time'],
    orderBy: { field: 'time', order: 'desc' },
    limit: 1
  }, !employeeId ? null : undefined);

  const lastCheckin = checkinList?.[0];
  const isCheckedIn = lastCheckin?.log_type === 'IN';

  const { createDoc } = useFrappeCreateDoc();

  // --- Check-in Handlers ---
  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('is_private', '1');

    const response = await fetch('/api/method/upload_file', {
      method: 'POST',
      body: formData,
      headers: {
        'X-Frappe-CSRF-Token': (window as any).frappe?.csrf_token || ''
      }
    });

    if (!response.ok) throw new Error('Image upload failed');
    const data = await response.json();
    return data.message.file_url;
  };

  const handleCheckIn = async (file: File) => {
    if (!employeeId) {
      toast.error("Employee details not found");
      return;
    }

    setIsCheckingIn(true);
    try {
      let imageUrl = '';
      try {
        imageUrl = await uploadImage(file);
      } catch (e) {
        console.error("Upload failed", e);
        toast.error("Failed to upload image, but proceeding with check-in");
      }

      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const newLogType = isCheckedIn ? 'OUT' : 'IN';
        const now = new Date();
        const timeStr = now.getFullYear() + "-"
          + String(now.getMonth() + 1).padStart(2, '0') + "-"
          + String(now.getDate()).padStart(2, '0') + " "
          + String(now.getHours()).padStart(2, '0') + ":"
          + String(now.getMinutes()).padStart(2, '0') + ":"
          + String(now.getSeconds()).padStart(2, '0');

        try {
          await createDoc('Employee Checkin', {
            employee: employeeId,
            log_type: newLogType,
            time: timeStr,
            device_id: 'Web / Desktop',
            latitude: latitude,
            longitude: longitude,
          });

          toast.success(`Successfully Checked ${newLogType}`);
          setShowCheckInModal(false);
          mutateCheckins();
        } catch (docError) {
          console.error("Doc creation failed", docError);
          toast.error("Failed to save check-in record");
        } finally {
          setIsCheckingIn(false);
        }

      }, (err) => {
        console.error("Geolocation error", err);
        toast.error("Location access denied. Cannot check in.");
        setIsCheckingIn(false);
      });

    } catch (e) {
      console.error("Check-in failed", e);
      toast.error("Check-in failed. Please try again.");
      setIsCheckingIn(false);
    }
  };


  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50/50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="p-8">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex flex-col gap-4">
            <p>{error?.message || "Failed to load dashboard data."}</p>
            <Button variant="outline" className="w-fit" onClick={() => mutate()}>
              <RefreshCw className="mr-2 h-4 w-4" /> Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const dashboardData = data?.message || data
  const energyData = energyPointsData?.message || energyPointsData

  if (!dashboardData?.stats) return <div>No Data Found</div>

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 space-y-8 pb-20">

      {/* --- Header & Controls --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <LayoutGrid className="h-6 w-6 text-primary" />
            Overview
          </h1>
          <p className="text-muted-foreground">Real-time performance metrics and rankings.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Check-in Button */}
          <Dialog open={showCheckInModal} onOpenChange={setShowCheckInModal}>
            <DialogTrigger asChild>
              <Button
                variant={isCheckedIn ? "destructive" : "default"}
                className={`shadow-sm ${!isCheckedIn ? "bg-indigo-600 hover:bg-indigo-700" : ""}`}
              >
                <MapPin className="mr-2 h-4 w-4" />
                {isCheckedIn ? 'Check Out' : 'Check In'}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md p-0 bg-black border-slate-800 text-white overflow-hidden">
              <div className="p-4 bg-slate-900 border-b border-slate-800">
                <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  {isCheckedIn ? 'Check Out' : 'Check In'} Verification
                </DialogTitle>
                <p className="text-xs text-slate-400 mt-1">
                  Please capture your face and location to verify attendance.
                </p>
              </div>
              <div className="p-4 bg-black">
                {showCheckInModal && (
                  <GeoTaggedCamera
                    onCapture={() => { }}
                    onSubmit={handleCheckIn}
                    location={{ lat: 0, lng: 0 }}
                    address="Getting location..."
                  />
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Frequency Toggle */}
          <div className="bg-white border rounded-lg p-1 flex items-center shadow-sm w-fit">
            {(['daily', 'monthly', 'yearly'] as const).map((freq) => (
              <button
                key={freq}
                onClick={() => setFrequency(freq)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${frequency === freq
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-gray-100"
                  }`}
              >
                {freq.charAt(0).toUpperCase() + freq.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- 1. Top Stats Section --- */}
      <section className="animate-in fade-in slide-in-from-top-4 duration-500">
        <EmployeeStatsSection stats={dashboardData.stats} />
      </section>

      {/* --- 2. Main Charts Section (Full Width) --- */}
      <Card className="border-none shadow-sm ring-1 ring-gray-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b bg-gray-50/30 rounded-t-lg">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Performance Trends
            </CardTitle>
            <CardDescription>
              Comparing your energy points over time ({frequency} view).
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-white">
            Analytics
          </Badge>
        </CardHeader>
        <CardContent className="pt-6">
          <ChartsSection
            energyPointsData={energyData || []}
            topPerformersWeekly={dashboardData.top_performers_weekly || []}
            frequency={frequency}
            onFrequencyChange={setFrequency}
            isLoadingEnergyPoints={isLoadingEnergyPoints}
            hideControls={true}
          />
        </CardContent>
      </Card>

      {/* --- 3. Leaderboard Section (Bottom) --- */}
      <Card className="border-none shadow-sm ring-1 ring-gray-200 overflow-hidden">
        <CardHeader className="bg-indigo-50/50 border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-indigo-900">
                <Trophy className="h-5 w-5 text-indigo-600" />
                Company Leaderboard
              </CardTitle>
              <CardDescription>
                Recognizing top contributors across the organization.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-xs text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">
              <Info className="h-3 w-3" />
              Top 10 Performers
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* We can wrap the list in a div with max-height if it gets too long, usually fine at bottom */}
          <div className="p-6">
            <TopPerformersList performers={dashboardData.top_performers_list || []} />
          </div>
        </CardContent>

        {/* Footer / Disclaimer */}
        <div className="bg-gray-50 p-4 text-center border-t">
          <p className="text-xs text-muted-foreground">
            Energy points are calculated based on task completion, complexity, and timeliness.
          </p>
        </div>
      </Card>

    </div>
  )
}

export default EmployeeDashboard