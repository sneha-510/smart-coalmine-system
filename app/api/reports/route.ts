import { NextResponse } from "next/server"
import { getAllReports, createReport } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "auditor")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const reports = await getAllReports()

    return NextResponse.json({
      success: true,
      reports,
    })
  } catch (error) {
    console.error("Error fetching reports:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser || currentUser.role !== "auditor") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const { shiftId, findings } = await request.json()

    if (!shiftId || !findings) {
      return NextResponse.json({ success: false, error: "Shift ID and findings are required" }, { status: 400 })
    }

    const report = await createReport(currentUser.id, shiftId, findings)

    return NextResponse.json({
      success: true,
      report,
    })
  } catch (error) {
    console.error("Error creating report:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
