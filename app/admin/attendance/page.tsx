"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { DataTable } from "@/components/ui/data-table"
import { formatDate, formatDateTime } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Clock, CheckCircle } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

interface Attendance {
  id: number
  user_id: number
  shift_id: number
  check_in: string
  check_out: string | null
  date: string
  start_time: string
  end_time: string
  full_name: string
}

interface User {
  id: number
  full_name: string
}

interface Shift {
  id: number
  date: string
  start_time: string
  end_time: string
  assigned_to: number
  full_name: string
}

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [workers, setWorkers] = useState<User[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCheckOutDialogOpen, setIsCheckOutDialogOpen] = useState(false)
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null)
  const [formData, setFormData] = useState({
    workerId: "",
    shiftId: "",
  })
  const { toast } = useToast()
  const { t } = useLanguage()

  useEffect(() => {
    fetchAttendance()
    fetchWorkers()
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

  const fetchAttendance = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/attendance")
      const data = await response.json()
      if (data.success) {
        setAttendance(data.attendance)
      }
    } catch (error) {
      console.error("Error fetching attendance:", error)
      toast({
        title: t("error"),
        description: t("attendance.fetchError"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchWorkers = async () => {
    try {
      const response = await fetch("/api/users/workers")
      const data = await response.json()
      if (data.success) {
        setWorkers(data.users)
      }
    } catch (error) {
      console.error("Error fetching workers:", error)
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

  const handleWorkerChange = (value: string) => {
    setFormData((prev) => ({ ...prev, workerId: value }))

    // Filter shifts for the selected worker
    const workerShifts = shifts.filter((shift) => shift.assigned_to === Number(value))

    // Reset shift selection if the current selection doesn't belong to this worker
    if (formData.shiftId && !workerShifts.some((shift) => shift.id === Number(formData.shiftId))) {
      setFormData((prev) => ({ ...prev, shiftId: "" }))
    }
  }

  const handleShiftChange = (value: string) => {
    setFormData((prev) => ({ ...prev, shiftId: value }))
  }

  const handleCheckIn = async () => {
    try {
      const response = await fetch("/api/attendance/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: Number(formData.workerId),
          shiftId: Number(formData.shiftId),
          action: "check-in",
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: t("success"),
          description: t("attendance.checkInSuccess"),
        })
        setIsDialogOpen(false)
        resetForm()
        fetchAttendance()
      } else {
        toast({
          title: t("error"),
          description: data.error || t("attendance.checkInError"),
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error checking in:", error)
      toast({
        title: t("error"),
        description: t("attendance.unexpectedError"),
        variant: "destructive",
      })
    }
  }

  const handleCheckOut = async () => {
    if (!selectedAttendance) return

    try {
      const response = await fetch("/api/attendance/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attendanceId: selectedAttendance.id,
          action: "check-out",
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: t("success"),
          description: t("attendance.checkOutSuccess"),
        })
        setIsCheckOutDialogOpen(false)
        fetchAttendance()
      } else {
        toast({
          title: t("error"),
          description: data.error || t("attendance.checkOutError"),
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error checking out:", error)
      toast({
        title: t("error"),
        description: t("attendance.unexpectedError"),
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      workerId: "",
      shiftId: "",
    })
  }

  const columns = [
    { header: t("attendance.worker"), accessorKey: "full_name" },
    {
      header: t("attendance.date"),
      accessorKey: (row: Attendance) => formatDate(row.date),
    },
    {
      header: t("attendance.shiftTime"),
      accessorKey: (row: Attendance) => `${row.start_time.substring(0, 5)} - ${row.end_time.substring(0, 5)}`,
    },
    {
      header: t("attendance.checkIn"),
      accessorKey: (row: Attendance) => (row.check_in ? formatDateTime(row.check_in) : t("attendance.notCheckedIn")),
    },
    {
      header: t("attendance.checkOut"),
      accessorKey: (row: Attendance) => (row.check_out ? formatDateTime(row.check_out) : t("attendance.notCheckedOut")),
    },
    {
      header: t("attendance.status"),
      accessorKey: (row: Attendance) => {
        if (!row.check_in) return t("attendance.absent")
        if (!row.check_out) return t("attendance.onShift")
        return t("attendance.completed")
      },
    },
  ]

  const renderActions = (row: Attendance) => {
    // Only show check-out action for records that are checked in but not checked out
    if (row.check_in && !row.check_out) {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedAttendance(row)
            setIsCheckOutDialogOpen(true)
          }}
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          {t("attendance.checkOut")}
        </Button>
      )
    }
    return null
  }

  // Get worker-specific shifts based on selected worker
  const filteredShifts = formData.workerId
    ? shifts.filter((shift) => shift.assigned_to === Number(formData.workerId))
    : []

  return (
    <div className="flex flex-col h-full">
      <Header user={currentUser || { full_name: "Admin", role: "admin" }} title={t("attendance.records")} />
      <main className="flex-1 overflow-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold">{t("attendance.title")}</h2>
            <p className="text-muted-foreground">{t("attendance.description")}</p>
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
                {t("attendance.recordNew")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("attendance.recordAttendance")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="workerId">{t("attendance.selectWorker")}</Label>
                  <Select value={formData.workerId} onValueChange={handleWorkerChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("attendance.selectWorkerPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {workers.map((worker) => (
                        <SelectItem key={worker.id} value={worker.id.toString()}>
                          {worker.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shiftId">{t("attendance.selectShift")}</Label>
                  <Select
                    value={formData.shiftId}
                    onValueChange={handleShiftChange}
                    disabled={!formData.workerId || filteredShifts.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("attendance.selectShiftPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredShifts.map((shift) => (
                        <SelectItem key={shift.id} value={shift.id.toString()}>
                          {formatDate(shift.date)} ({shift.start_time.substring(0, 5)} -{" "}
                          {shift.end_time.substring(0, 5)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.workerId && filteredShifts.length === 0 && (
                    <p className="text-sm text-destructive">{t("attendance.noShiftsAssigned")}</p>
                  )}
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    {t("cancel")}
                  </Button>
                  <Button
                    onClick={handleCheckIn}
                    disabled={!formData.workerId || !formData.shiftId}
                    className="flex items-center"
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    {t("attendance.checkIn")}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Dialog open={isCheckOutDialogOpen} onOpenChange={setIsCheckOutDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("attendance.confirmCheckOut")}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>
                {t("attendance.confirmCheckOutMessage", {
                  worker: selectedAttendance?.full_name || "",
                  date: selectedAttendance ? formatDate(selectedAttendance.date) : "",
                })}
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCheckOutDialogOpen(false)}>
                {t("cancel")}
              </Button>
              <Button onClick={handleCheckOut} className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4" />
                {t("attendance.checkOut")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <DataTable
          data={attendance}
          columns={columns}
          searchable
          searchKeys={["full_name", "date"]}
          actions={currentUser?.role === "admin" ? renderActions : undefined}
        />
      </main>
    </div>
  )
}
