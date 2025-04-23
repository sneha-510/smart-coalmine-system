import { NextResponse } from "next/server"
import { getAllAttendance, getAttendanceByUserId, checkIn, checkOut } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    let attendance

    if (currentUser.role === "admin" || currentUser.role === "auditor") {
      attendance = await getAllAttendance()
    } else {
      attendance = await getAttendanceByUserId(currentUser.id)
    }

    return NextResponse.json({
      success: true,
      attendance,
    })
  } catch (error) {
    console.error("Error fetching attendance:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser || currentUser.role !== "worker") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const { shiftId, action } = await request.json()

    if (!shiftId || !action) {
      return NextResponse.json({ success: false, error: "Shift ID and action are required" }, { status: 400 })
    }

    let result

    if (action === "check-in") {
      result = await checkIn(currentUser.id, shiftId)
    } else if (action === "check-out") {
      result = await checkOut(shiftId)
    } else {
      return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      attendance: result,
    })
  } catch (error) {
    console.error("Error recording attendance:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
