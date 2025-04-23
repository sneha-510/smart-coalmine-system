import { getCurrentUser } from "@/lib/auth"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getUsersByRole, getAllShifts, getAllAlerts } from "@/lib/db"
import { AlertTriangle, Calendar, CheckCircle, Users } from "lucide-react"

export default async function AdminDashboard() {
  const user = await getCurrentUser()
  const workers = await getUsersByRole("worker")
  const auditors = await getUsersByRole("auditor")
  const shifts = await getAllShifts()
  const alerts = await getAllAlerts()

  // Count open alerts
  const openAlerts = alerts.filter((alert) => alert.status === "Open").length

  // Count today's shifts
  const today = new Date().toISOString().split("T")[0]
  const todayShifts = shifts.filter((shift) => shift.date === today).length

  return (
    <div className="flex flex-col h-full">
      <Header user={user} title="Admin Dashboard" />
      <main className="flex-1 overflow-auto p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Auditors</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{auditors.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Today's Shifts</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayShifts}</div>
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
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">Recent Alerts</h2>
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Worker</th>
                    <th className="text-left p-4">Message</th>
                    <th className="text-left p-4">Time</th>
                    <th className="text-left p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.slice(0, 5).map((alert) => (
                    <tr key={alert.id} className="border-b">
                      <td className="p-4">{alert.full_name}</td>
                      <td className="p-4">{alert.message}</td>
                      <td className="p-4">{new Date(alert.timestamp).toLocaleString()}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            alert.status === "Open"
                              ? "bg-red-100 text-red-800"
                              : alert.status === "Resolved"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {alert.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {alerts.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-muted-foreground">
                        No alerts found
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
