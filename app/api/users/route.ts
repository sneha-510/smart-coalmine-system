import { NextResponse } from "next/server"
import { getNonAdminUsers, createUser } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const users = await getNonAdminUsers()

    return NextResponse.json({
      success: true,
      users,
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const { fullName, email, password, role } = await request.json()

    if (!fullName || !email || !password || !role) {
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 })
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
    console.error("Error creating user:", error)

    // Check for duplicate email error
    if (error.code === "23505") {
      return NextResponse.json({ success: false, error: "Email already exists" }, { status: 400 })
    }

    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
