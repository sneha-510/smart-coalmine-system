"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { AlertTriangle, Calendar, ClipboardCheck, FileText, Home, LogOut, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { useLanguage } from "@/lib/language-context"

interface SidebarProps {
  role: string
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { t } = useLanguage()

  const adminLinks = [
    { href: "/admin/dashboard", label: t("nav.dashboard"), icon: Home },
    { href: "/admin/users", label: t("nav.users"), icon: Users },
    { href: "/admin/shifts", label: t("nav.shifts"), icon: Calendar },
    { href: "/admin/attendance", label: t("nav.attendance"), icon: ClipboardCheck },
    { href: "/admin/alerts", label: t("nav.alerts"), icon: AlertTriangle },
    { href: "/admin/reports", label: t("nav.reports"), icon: FileText },
  ]

  const workerLinks = [
    { href: "/worker/dashboard", label: t("nav.dashboard"), icon: Home },
    { href: "/worker/attendance", label: t("nav.attendance"), icon: ClipboardCheck },
    { href: "/worker/alerts", label: t("nav.alerts"), icon: AlertTriangle },
  ]

  const auditorLinks = [
    { href: "/auditor/dashboard", label: t("nav.dashboard"), icon: Home },
    { href: "/auditor/alerts", label: t("nav.alerts"), icon: AlertTriangle },
    { href: "/auditor/reports", label: t("nav.reports"), icon: FileText },
  ]

  const links = role === "admin" ? adminLinks : role === "worker" ? workerLinks : auditorLinks

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        // Clear any client-side state if needed
        router.push("/")
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: "Failed to logout. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="flex h-screen flex-col border-r bg-background">
      <div className="p-6">
        <h2 className="text-lg font-semibold">{t("app.name")}</h2>
        <p className="text-sm text-muted-foreground capitalize">
          {role.charAt(0).toUpperCase() + role.slice(1)} {t("dashboard.title")}
        </p>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm font-medium">
          {links.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  pathname === link.href ? "bg-muted text-primary" : "hover:bg-muted",
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="mt-auto p-4">
        <Button variant="outline" className="w-full justify-start" onClick={handleLogout} disabled={isLoggingOut}>
          <LogOut className="mr-2 h-4 w-4" />
          {isLoggingOut ? "Logging out..." : t("auth.logout")}
        </Button>
      </div>
    </div>
  )
}
