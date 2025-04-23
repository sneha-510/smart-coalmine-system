import { NextResponse } from "next/server"
import { updateAlertStatus } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "auditor")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const id = Number.parseInt(params.id)
    const { status } = await request.json()

    if (!status) {
      return NextResponse.json({ success: false, error: "Status is required" }, { status: 400 })
    }

    // Validate status
    if (!["Open", "Resolved", "Escalated"].includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 })
    }

    const alert = await updateAlertStatus(id, status)

    return NextResponse.json({
      success: true,
      alert,
    })
  } catch (error) {
    console.error("Error updating alert:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
