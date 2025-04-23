import { NextResponse } from "next/server"
import { getUsersByRole } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const users = await getUsersByRole("worker")

    return NextResponse.json({
      success: true,
      users,
    })
  } catch (error) {
    console.error("Error fetching workers:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
