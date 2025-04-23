import { NextResponse } from "next/server"
import { checkIn, checkOut } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { action } = body

    let result

    if (action === "check-in") {
      const { userId, shiftId } = body

      if (!userId || !shiftId) {
        return NextResponse.json({ success: false, error: "User ID and Shift ID are required" }, { status: 400 })
      }

      result = await checkIn(userId, shiftId)
    } else if (action === "check-out") {
      const { attendanceId } = body

      if (!attendanceId) {
        return NextResponse.json({ success: false, error: "Attendance ID is required" }, { status: 400 })
      }

      result = await checkOut(attendanceId)
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
