import type React from "react"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { Sidebar } from "@/components/sidebar"

export default async function AuditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  // If not logged in or not an auditor, redirect to login
  if (!user) {
    redirect("/login")
  }

  if (user.role !== "auditor") {
    redirect("/login")
  }

  const handleLogout = async () => {
    "use server"
    redirect("/login")
  }

  return (
    <div className="flex h-screen">
      <Sidebar role="auditor" onLogout={handleLogout} />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
