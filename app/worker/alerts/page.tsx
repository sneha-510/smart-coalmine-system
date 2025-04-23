"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { formatDateTime } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { AlertTriangle, Plus } from "lucide-react"

interface Shift {
  id: number
  date: string
  start_time: string
  end_time: string
}

interface Alert {
  id: number
  user_id: number
  shift_id: number
  message: string
  timestamp: string
  status: string
}

export default function WorkerAlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    shiftId: "",
    message: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchAlerts()
    fetchShifts()
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

  const fetchShifts = async () => {
    try {
      const response = await fetch("/api/shifts/worker")
      const data = await response.json()
      if (data.success) {
        setShifts(data.shifts)
      }
    } catch (error) {
      console.error("Error fetching shifts:", error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleShiftChange = (value: string) => {
    setFormData((prev) => ({ ...prev, shiftId: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shiftId: Number.parseInt(formData.shiftId),
          message: formData.message,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Alert submitted successfully",
        })
        setIsDialogOpen(false)
        resetForm()
        fetchAlerts()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to submit alert",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting alert:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      shiftId: "",
      message: "",
    })
  }

  const columns = [
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

  return (
    <div className="flex flex-col h-full">
      <Header user={currentUser || { full_name: "Worker", role: "worker" }} title="Safety Alerts" />
      <main className="flex-1 overflow-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold">Alerts</h2>
            <p className="text-muted-foreground">Report safety concerns</p>
          </div>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) resetForm()
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Report Alert
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Report Safety Alert</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="shiftId">Shift</Label>
                  <Select value={formData.shiftId} onValueChange={handleShiftChange} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a shift" />
                    </SelectTrigger>
                    <SelectContent>
                      {shifts.map((shift) => (
                        <SelectItem key={shift.id} value={shift.id.toString()}>
                          {new Date(shift.date).toLocaleDateString()} ({shift.start_time.substring(0, 5)} -{" "}
                          {shift.end_time.substring(0, 5)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Describe the safety concern..."
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex items-center">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Submit Alert
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <DataTable data={alerts} columns={columns} searchable searchKeys={["message", "status"]} />
      </main>
    </div>
  )
}
