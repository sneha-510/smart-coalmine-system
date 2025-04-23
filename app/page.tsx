"use client";
import { LanguageSwitcher } from "@/components/language-switcher"
import { MessageSquare } from "lucide-react"

// Server component that renders the client component
export default function LandingPage() {
  return <LandingPageContent />
}
// Client component for language support


import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-context"

function LandingPageContent() {
  const { t } = useLanguage()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Coal Mine Logo" width={40} height={40} />
            <span className="text-xl font-bold">{t("app.name")}</span>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="outline">{t("auth.login")}</Button>
              </Link>
              <Link href="/register">
                <Button>{t("auth.register")}</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="bg-gradient-to-b from-muted/50 to-muted py-20 md:py-32">
          <div className="container flex flex-col items-center gap-4 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{t("app.tagline")}</h1>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">{t("app.description")}</p>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/login">
                <Button size="lg">{t("landing.getStarted")}</Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline">
                  {t("landing.createAccount")}
                </Button>
              </Link>
              <Link href="/chatbot">
                <Button size="lg" variant="secondary" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  {t("landing.chatWithUs")}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="container py-12 md:py-24">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="text-xl font-bold">{t("features.adminDashboard")}</h3>
              <p className="mt-2 text-muted-foreground">{t("features.adminDescription")}</p>
            </div>
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="text-xl font-bold">{t("features.workerPortal")}</h3>
              <p className="mt-2 text-muted-foreground">{t("features.workerDescription")}</p>
            </div>
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="text-xl font-bold">{t("features.safetyAuditing")}</h3>
              <p className="mt-2 text-muted-foreground">{t("features.safetyDescription")}</p>
            </div>
          </div>
        </section>

        <section className="bg-muted py-12 md:py-24">
          <div className="container">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                {t("landing.readyToImprove")}
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">{t("landing.joinPlatform")}</p>
              <Link href="/register">
                <Button size="lg">{t("landing.signUpNow")}</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {t("app.name")}. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:underline">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:underline">
              Terms of Service
            </Link>
            <Link href="#" className="hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
