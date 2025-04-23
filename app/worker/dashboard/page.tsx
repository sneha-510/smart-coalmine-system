import { getCurrentUser } from "@/lib/auth"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getShiftsByUserId, getAlertsByUserId } from "@/lib/db"
import { formatDate, formatTime } from "@/lib/utils"
import { AlertTriangle, Calendar, CheckCircle } from "lucide-react"

export default async function WorkerDashboard() {
  const user = await getCurrentUser()
  const shifts = await getShiftsByUserId(user.id)
  const alerts = await getAlertsByUserId(user.id)

  // Count upcoming shifts
  const today = new Date().toISOString().split("T")[0]
  const upcomingShifts = shifts.filter((shift) => shift.date >= today).length

  // Count open alerts
  const openAlerts = alerts.filter((alert) => alert.status === "Open").length

  return (
    <div className="flex flex-col h-full">
      <Header user={user} title="Worker Dashboard" />
      <main className="flex-1 overflow-auto p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Upcoming Shifts</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingShifts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Open Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{openAlerts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Today's Status</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {shifts.some((shift) => shift.date === today) ? "Shift Today" : "No Shift"}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">Upcoming Shifts</h2>
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Date</th>
                    <th className="text-left p-4">Start Time</th>
                    <th className="text-left p-4">End Time</th>
                  </tr>
                </thead>
                <tbody>
                  {shifts
                    .filter((shift) => shift.date >= today)
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .slice(0, 5)
                    .map((shift) => (
                      <tr key={shift.id} className="border-b">
                        <td className="p-4">{formatDate(shift.date)}</td>
                        <td className="p-4">{formatTime(shift.start_time)}</td>
                        <td className="p-4">{formatTime(shift.end_time)}</td>
                      </tr>
                    ))}
                  {shifts.filter((shift) => shift.date >= today).length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-muted-foreground">
                        No upcoming shifts
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
