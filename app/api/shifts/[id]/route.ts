import { NextResponse } from "next/server"
import { updateShift, deleteShift } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const id = Number.parseInt(params.id)
    const { date, startTime, endTime, assignedTo } = await request.json()

    if (!date || !startTime || !endTime || !assignedTo) {
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 })
    }

    const shift = await updateShift(id, date, startTime, endTime, assignedTo)

    return NextResponse.json({
      success: true,
      shift,
    })
  } catch (error) {
    console.error("Error updating shift:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const id = Number.parseInt(params.id)

    await deleteShift(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting shift:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
