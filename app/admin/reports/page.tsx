"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { DataTable } from "@/components/ui/data-table"
import { formatDateTime } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface Report {
  id: number
  auditor_id: number
  shift_id: number
  findings: string
  timestamp: string
  full_name: string
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchReports()
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

  const columns = [
    { header: "Auditor", accessorKey: "full_name" },
    {
      header: "Time",
      accessorKey: (row: Report) => formatDateTime(row.timestamp),
    },
    { header: "Findings", accessorKey: "findings" },
  ]

  return (
    <div className="flex flex-col h-full">
      <Header user={currentUser || { full_name: "Admin", role: "admin" }} title="Safety Reports" />
      <main className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Reports</h2>
          <p className="text-muted-foreground">View safety reports submitted by auditors</p>
        </div>

        <DataTable data={reports} columns={columns} searchable searchKeys={["full_name", "findings"]} />
      </main>
    </div>
  )
}
