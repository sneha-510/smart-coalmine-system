import { NextResponse } from "next/server"
import { getAllAlerts, getAlertsByUserId, createAlert } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    let alerts

    if (currentUser.role === "admin" || currentUser.role === "auditor") {
      alerts = await getAllAlerts()
    } else {
      alerts = await getAlertsByUserId(currentUser.id)
    }

    return NextResponse.json({
      success: true,
      alerts,
    })
  } catch (error) {
    console.error("Error fetching alerts:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser || currentUser.role !== "worker") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const { shiftId, message } = await request.json()

    if (!shiftId || !message) {
      return NextResponse.json({ success: false, error: "Shift ID and message are required" }, { status: 400 })
    }

    const alert = await createAlert(currentUser.id, shiftId, message)

    return NextResponse.json({
      success: true,
      alert,
    })
  } catch (error) {
    console.error("Error creating alert:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
