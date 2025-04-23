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
import { FileText, Plus } from "lucide-react"

interface Shift {
  id: number
  date: string
  start_time: string
  end_time: string
  full_name: string
}

interface Report {
  id: number
  auditor_id: number
  shift_id: number
  findings: string
  timestamp: string
  full_name: string
}

export default function AuditorReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    shiftId: "",
    findings: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchReports()
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

  const fetchReports = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/reports")
      const data = await response.json()
      if (data.success) {
        setReports(data.reports)
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
      toast({
        title: "Error",
        description: "Failed to fetch reports",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchShifts = async () => {
    try {
      const response = await fetch("/api/shifts")
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
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shiftId: Number.parseInt(formData.shiftId),
          findings: formData.findings,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Report submitted successfully",
        })
        setIsDialogOpen(false)
        resetForm()
        fetchReports()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to submit report",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting report:", error)
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
      findings: "",
    })
  }

  const columns = [
    {
      header: "Time",
      accessorKey: (row: Report) => formatDateTime(row.timestamp),
    },
    { header: "Findings", accessorKey: "findings" },
    { header: "Auditor", accessorKey: "full_name" },
  ]

  return (
    <div className="flex flex-col h-full">
      <Header user={currentUser || { full_name: "Auditor", role: "auditor" }} title="Safety Reports" />
      <main className="flex-1 overflow-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold">Reports</h2>
            <p className="text-muted-foreground">Submit and view safety reports</p>
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
                New Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Safety Report</DialogTitle>
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
                          {new Date(shift.date).toLocaleDateString()} - {shift.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="findings">Findings</Label>
                  <Textarea
                    id="findings"
                    name="findings"
                    placeholder="Enter your safety findings..."
                    value={formData.findings}
                    onChange={handleInputChange}
                    rows={6}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    Submit Report
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <DataTable data={reports} columns={columns} searchable searchKeys={["findings", "full_name"]} />
      </main>
    </div>
  )
}
