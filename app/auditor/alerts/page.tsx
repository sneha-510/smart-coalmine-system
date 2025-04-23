"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatDateTime } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, AlertTriangle, ArrowUpCircle } from "lucide-react"

interface Alert {
  id: number
  user_id: number
  shift_id: number
  message: string
  timestamp: string
  status: string
  full_name: string
}

export default function AuditorAlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchAlerts()
    fetchCurrentUser()
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/users/current")
      const data = await response.json()
      if (data.success) {
        setCurrentUser(data.user)
      }
    } catch (error) {
      console.error("Error fetching current user:", error)
    }
  }

  const fetchAlerts = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/alerts")
      const data = await response.json()
      if (data.success) {
        setAlerts(data.alerts)
      }
    } catch (error) {
      console.error("Error fetching alerts:", error)
      toast({
        title: "Error",
        description: "Failed to fetch alerts",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateAlertStatus = async (id: number, status: string) => {
    try {
      const response = await fetch(`/api/alerts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: `Alert marked as ${status}`,
        })
        fetchAlerts()
        setIsDialogOpen(false)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update alert",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating alert:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const columns = [
    { header: "Worker", accessorKey: "full_name" },
    { header: "Message", accessorKey: "message" },
    {
      header: "Time",
      accessorKey: (row: Alert) => formatDateTime(row.timestamp),
    },
    {
      header: "Status",
      accessorKey: (row: Alert) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.status === "Open"
              ? "bg-red-100 text-red-800"
              : row.status === "Resolved"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {row.status}
        </span>
      ),
    },
  ]

  const renderActions = (alert: Alert) => {
    // Only show actions for open alerts
    if (alert.status !== "Open") {
      return null
    }

    return (
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center"
          onClick={() => {
            setSelectedAlert(alert)
            setIsDialogOpen(true)
          }}
        >
          <AlertTriangle className="mr-1 h-4 w-4" />
          Manage
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <Header user={currentUser || { full_name: "Auditor", role: "auditor" }} title="Safety Alerts" />
      <main className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Alerts</h2>
          <p className="text-muted-foreground">Review and manage safety alerts</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage Alert</DialogTitle>
            </DialogHeader>
            {selectedAlert && (
              <div className="space-y-4 py-4">
                <div>
                  <p className="font-medium">Worker:</p>
                  <p>{selectedAlert.full_name}</p>
                </div>
                <div>
                  <p className="font-medium">Time:</p>
                  <p>{formatDateTime(selectedAlert.timestamp)}</p>
                </div>
                <div>
                  <p className="font-medium">Message:</p>
                  <p>{selectedAlert.message}</p>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => updateAlertStatus(selectedAlert.id, "Resolved")}
                    className="flex items-center"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Resolved
                  </Button>
                  <Button
                    onClick={() => updateAlertStatus(selectedAlert.id, "Escalated")}
                    className="flex items-center"
                  >
                    <ArrowUpCircle className="mr-2 h-4 w-4" />
                    Escalate
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <DataTable
          data={alerts}
          columns={columns}
          searchable
          searchKeys={["full_name", "message", "status"]}
          actions={renderActions}
        />
      </main>
    </div>
  )
}
