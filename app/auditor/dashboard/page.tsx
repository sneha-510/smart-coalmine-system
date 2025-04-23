import { getCurrentUser } from "@/lib/auth"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllAlerts, getAllReports } from "@/lib/db"
import { AlertTriangle, CheckCircle, FileText } from "lucide-react"
import { formatDateTime } from "@/lib/utils"

export default async function AuditorDashboard() {
  const user = await getCurrentUser()
  const alerts = await getAllAlerts()
  const reports = await getAllReports()

  // Count alerts by status
  const openAlerts = alerts.filter((alert) => alert.status === "Open").length
  const resolvedAlerts = alerts.filter((alert) => alert.status === "Resolved").length
  const escalatedAlerts = alerts.filter((alert) => alert.status === "Escalated").length

  return (
    <div className="flex flex-col h-full">
      <Header user={user} title="Auditor Dashboard" />
      <main className="flex-1 overflow-auto p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
              <CardTitle className="text-sm font-medium">Resolved Alerts</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resolvedAlerts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Escalated Alerts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{escalatedAlerts}</div>
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
                      <td className="p-4">{formatDateTime(alert.timestamp)}</td>
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
