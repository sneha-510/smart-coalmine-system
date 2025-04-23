"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Card } from "@/components/ui/card"
import { formatDate, formatTime, formatDateTime } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, Clock } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

interface Shift {
  id: number
  date: string
  start_time: string
  end_time: string
  assigned_to: number
}

interface Attendance {
  id: number
  user_id: number
  shift_id: number
  check_in: string
  check_out: string | null
  date: string
  start_time: string
  end_time: string
}

export default function WorkerAttendancePage() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { t } = useLanguage()

  useEffect(() => {
    fetchShifts()
    fetchAttendance()
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

  const handleCheckIn = async (shiftId: number) => {
    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shiftId,
          action: "check-in",
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: t("success"),
          description: t("attendance.checkInSuccess"),
        })
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

  const handleCheckOut = async (attendanceId: number) => {
    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shiftId: attendanceId,
          action: "check-out",
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: t("success"),
          description: t("attendance.checkOutSuccess"),
        })
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

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0]

  // Find today's shift
  const todayShift = shifts.find((shift) => shift.date === today)

  // Find attendance record for today's shift
  const todayAttendance = todayShift ? attendance.find((a) => a.shift_id === todayShift.id) : null

  const attendanceColumns = [
    {
      header: t("attendance.date"),
      accessorKey: (row: Attendance) => formatDate(row.date),
    },
    {
      header: t("attendance.shiftTime"),
      accessorKey: (row: Attendance) => `${formatTime(row.start_time)} - ${formatTime(row.end_time)}`,
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

  return (
    <div className="flex flex-col h-full">
      <Header user={currentUser || { full_name: "Worker", role: "worker" }} title={t("attendance.title")} />
      <main className="flex-1 overflow-auto p-6">
        {todayShift && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">{t("attendance.todaysShift")}</h2>
            <Card className="p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">{t("attendance.date")}</p>
                  <p className="font-medium">{formatDate(todayShift.date)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("attendance.shiftTime")}</p>
                  <p className="font-medium">
                    {formatTime(todayShift.start_time)} - {formatTime(todayShift.end_time)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("attendance.status")}</p>
                  <p className="font-medium">
                    {!todayAttendance
                      ? t("attendance.notCheckedIn")
                      : !todayAttendance.check_out
                        ? t("attendance.onShift")
                        : t("attendance.completed")}
                  </p>
                </div>
                <div className="flex items-end">
                  {!todayAttendance ? (
                    <Button onClick={() => handleCheckIn(todayShift.id)} className="flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      {t("attendance.checkIn")}
                    </Button>
                  ) : !todayAttendance.check_out ? (
                    <Button onClick={() => handleCheckOut(todayAttendance.id)} className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {t("attendance.checkOut")}
                    </Button>
                  ) : (
                    <Button disabled className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {t("attendance.completed")}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-lg font-semibold">{t("attendance.history")}</h2>
          <p className="text-muted-foreground">{t("attendance.viewHistory")}</p>
        </div>

        <DataTable data={attendance} columns={attendanceColumns} searchable searchKeys={["date"]} />
      </main>
    </div>
  )
}
