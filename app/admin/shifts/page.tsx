"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Plus, Trash } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatDate, formatTime } from "@/lib/utils"

interface User {
  id: number
  full_name: string
  email: string
  role: string
}

interface Shift {
  id: number
  date: string
  start_time: string
  end_time: string
  assigned_to: number
  created_by: number
  full_name: string
}

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [workers, setWorkers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    id: undefined as number | undefined,
    date: "",
    startTime: "",
    endTime: "",
    assignedTo: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchShifts()
    fetchWorkers()
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
    setIsLoading(true)
    try {
      const response = await fetch("/api/shifts")
      const data = await response.json()
      if (data.success) {
        setShifts(data.shifts)
      }
    } catch (error) {
      console.error("Error fetching shifts:", error)
      toast({
        title: "Error",
        description: "Failed to fetch shifts",
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleWorkerChange = (value: string) => {
    setFormData((prev) => ({ ...prev, assignedTo: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = formData.id ? `/api/shifts/${formData.id}` : "/api/shifts"

      const method = formData.id ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          assignedTo: Number.parseInt(formData.assignedTo),
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: formData.id ? "Shift updated successfully" : "Shift created successfully",
        })
        setIsDialogOpen(false)
        fetchShifts()
      } else {
        toast({
          title: "Error",
          description: data.error || "Operation failed",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (shift: Shift) => {
    setFormData({
      id: shift.id,
      date: shift.date,
      startTime: shift.start_time,
      endTime: shift.end_time,
      assignedTo: shift.assigned_to.toString(),
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/shifts/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Shift deleted successfully",
        })
        fetchShifts()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete shift",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
    }
  }

  const resetForm = () => {
    setFormData({
      id: undefined,
      date: "",
      startTime: "",
      endTime: "",
      assignedTo: "",
    })
  }

  const columns = [
    {
      header: "Date",
      accessorKey: (row: Shift) => formatDate(row.date),
    },
    {
      header: "Start Time",
      accessorKey: (row: Shift) => formatTime(row.start_time),
    },
    {
      header: "End Time",
      accessorKey: (row: Shift) => formatTime(row.end_time),
    },
    {
      header: "Assigned To",
      accessorKey: "full_name",
    },
  ]

  const renderActions = (shift: Shift) => {
    return (
      <div className="flex space-x-2">
        <Button variant="outline" size="icon" onClick={() => handleEdit(shift)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            setFormData({ id: shift.id })
            setIsDeleteDialogOpen(true)
          }}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <Header user={currentUser || { full_name: "Admin", role: "admin" }} title="Shift Management" />
      <main className="flex-1 overflow-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Shifts</h2>
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
                Add Shift
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{formData.id ? "Edit Shift" : "Add New Shift"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    name="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    name="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Assign To</Label>
                  <Select value={formData.assignedTo} onValueChange={handleWorkerChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a worker" />
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
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">{formData.id ? "Update" : "Create"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Are you sure you want to delete this shift? This action cannot be undone.</p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => formData.id && handleDelete(formData.id)}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <DataTable
          data={shifts}
          columns={columns}
          searchable
          searchKeys={["full_name", "date"]}
          actions={renderActions}
        />
      </main>
    </div>
  )
}
