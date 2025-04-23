import { NextResponse } from "next/server"
import { updateUser, deleteUser, getUserById } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const id = Number.parseInt(params.id)
    const { fullName, email, password, role } = await request.json()

    if (!fullName || !email || !role) {
      return NextResponse.json({ success: false, error: "Name, email, and role are required" }, { status: 400 })
    }

    // Get the existing user to check if we need to update the password
    const existingUser = await getUserById(id)

    if (!existingUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // If password is empty, keep the existing password
    const updatedPassword = password || existingUser.password

    const user = await updateUser(id, fullName, email, updatedPassword, role)

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
    console.error("Error updating user:", error)

    // Check for duplicate email error
    if (error.code === "23505") {
      return NextResponse.json({ success: false, error: "Email already exists" }, { status: 400 })
    }

    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const id = Number.parseInt(params.id)

    // Don't allow deleting self
    if (currentUser.id === id) {
      return NextResponse.json({ success: false, error: "Cannot delete your own account" }, { status: 400 })
    }

    await deleteUser(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
