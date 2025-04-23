import { NextResponse } from "next/server"
import { getAllShifts, createShift } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const shifts = await getAllShifts()

    return NextResponse.json({
      success: true,
      shifts,
    })
  } catch (error) {
    console.error("Error fetching shifts:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const { date, startTime, endTime, assignedTo } = await request.json()

    if (!date || !startTime || !endTime || !assignedTo) {
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 })
    }

    const shift = await createShift(date, startTime, endTime, assignedTo, currentUser.id)

    return NextResponse.json({
      success: true,
      shift,
    })
  } catch (error) {
    console.error("Error creating shift:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
