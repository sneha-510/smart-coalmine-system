import { NextResponse } from "next/server"
import { getShiftsByUserId } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser || currentUser.role !== "worker") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const shifts = await getShiftsByUserId(currentUser.id)

    return NextResponse.json({
      success: true,
      shifts,
    })
  } catch (error) {
    console.error("Error fetching worker shifts:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
