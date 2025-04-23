import { NextResponse } from "next/server"
import { getUserById } from "@/lib/db"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const userId = cookies().get("userId")?.value

    if (!userId) {
      return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"))
    }

    const user = await getUserById(Number(userId))

    if (!user) {
      // If user doesn't exist, clear the cookie and redirect to login
      cookies().delete("userId")
      return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"))
    }

    // Redirect based on user role
    if (user.role === "admin") {
      return NextResponse.redirect(
        new URL("/admin/dashboard", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
      )
    } else if (user.role === "worker") {
      return NextResponse.redirect(
        new URL("/worker/dashboard", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
      )
    } else if (user.role === "auditor") {
      return NextResponse.redirect(
        new URL("/auditor/dashboard", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
      )
    }

    // Fallback to login if role is not recognized
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"))
  } catch (error) {
    console.error("Redirect error:", error)
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"))
  }
}
