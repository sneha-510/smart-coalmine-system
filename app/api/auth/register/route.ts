import { NextResponse } from "next/server"
import { createUser } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { fullName, email, password, role } = await request.json()

    if (!fullName || !email || !password || !role) {
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 })
    }

    // Only allow worker and auditor roles for registration
    if (role !== "worker" && role !== "auditor") {
      return NextResponse.json({ success: false, error: "Invalid role" }, { status: 400 })
    }

    const user = await createUser(fullName, email, password, role)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    })
  } catch (error: any) {
    console.error("Registration error:", error)

    // Check for duplicate email error
    if (error.code === "23505") {
      return NextResponse.json({ success: false, error: "Email already exists" }, { status: 400 })
    }

    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
