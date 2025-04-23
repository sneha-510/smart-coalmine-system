"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, CheckCircle, MessageSquare, Send } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { useToast } from "@/hooks/use-toast"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface Alert {
  id: number
  message: string
  status: string
  timestamp: string
}

interface Report {
  id: number
  findings: string
  timestamp: string
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { t } = useLanguage()
  const { toast } = useToast()

  useEffect(() => {
    fetchCurrentUser()
    fetchAlerts()
    fetchReports()

    // Add welcome message
    setMessages([
      {
        role: "assistant",
        content: t("chatbot.welcome"),
      },
    ])
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/users/current")
      const data = await response.json()
      if (data.success) {
        setCurrentUser(data.user)
      }
    } catch (error) {
      console.error("Error fetching current user:", error)
    }
  }

  const fetchAlerts = async () => {
    try {
      const response = await fetch("/api/alerts")
      const data = await response.json()
      if (data.success) {
        setAlerts(data.alerts)
      }
    } catch (error) {
      console.error("Error fetching alerts:", error)
    }
  }

  const fetchReports = async () => {
    try {
      const response = await fetch("/api/reports")
      const data = await response.json()
      if (data.success) {
        setReports(data.reports)
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    try {
      // Simulate AI response based on user input and historical data
      await new Promise((resolve) => setTimeout(resolve, 1000))

      let response = ""

      // Simple keyword matching for demo purposes
      if (userMessage.toLowerCase().includes("safety") || userMessage.toLowerCase().includes("सुरक्षा")) {
        response = generateSafetyResponse(alerts, reports)
      } else if (userMessage.toLowerCase().includes("alert") || userMessage.toLowerCase().includes("अलर्ट")) {
        response = generateAlertResponse(alerts)
      } else if (userMessage.toLowerCase().includes("report") || userMessage.toLowerCase().includes("रिपोर्ट")) {
        response = generateReportResponse(reports)
      } else {
        response = generateGenericResponse(userMessage)
      }

      setMessages((prev) => [...prev, { role: "assistant", content: response }])
    } catch (error) {
      console.error("Error processing message:", error)
      toast({
        title: t("error"),
        description: "Failed to process your message",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateSafetyResponse = (alerts: Alert[], reports: Report[]) => {
    const openAlerts = alerts.filter((alert) => alert.status === "Open")

    if (openAlerts.length === 0) {
      return "Based on our records, there are no open safety concerns at the moment. However, always remember to follow standard safety protocols:\n\n1. Always wear proper safety equipment\n2. Check equipment before use\n3. Report any concerns immediately\n4. Follow evacuation procedures during emergencies"
    }

    return `I've analyzed the current safety situation and found ${openAlerts.length} open safety concerns. Here are some recommendations:\n\n${openAlerts.map((alert, index) => `${index + 1}. ${generateRecommendation(alert.message)}`).join("\n\n")}`
  }

  const generateAlertResponse = (alerts: Alert[]) => {
    if (alerts.length === 0) {
      return "There are no alerts in the system currently. This is good news for safety!"
    }

    const openAlerts = alerts.filter((alert) => alert.status === "Open")
    const resolvedAlerts = alerts.filter((alert) => alert.status === "Resolved")
    const escalatedAlerts = alerts.filter((alert) => alert.status === "Escalated")

    return `Alert Status Summary:\n\n- Open Alerts: ${openAlerts.length}\n- Resolved Alerts: ${resolvedAlerts.length}\n- Escalated Alerts: ${escalatedAlerts.length}\n\nMost recent alert: "${alerts[0]?.message || "None"}"`
  }

  const generateReportResponse = (reports: Report[]) => {
    if (reports.length === 0) {
      return "There are no safety reports in the system currently."
    }

    return `There are ${reports.length} safety reports in the system. The most recent report findings: "${reports[0]?.findings || "None"}"`
  }

  const generateGenericResponse = (message: string) => {
    const responses = [
      "I'm here to help with safety concerns and provide recommendations based on historical data. Could you ask me about safety, alerts, or reports?",
      "I can analyze safety data and provide recommendations. Try asking about current safety status, alerts, or reports.",
      "I'm your safety assistant. I can help with information about safety protocols, current alerts, and historical reports.",
      "I'm designed to help improve mine safety. Ask me about safety recommendations, current alerts, or safety reports.",
    ]

    return responses[Math.floor(Math.random() * responses.length)]
  }

  const generateRecommendation = (alertMessage: string) => {
    // Simple keyword matching for demo purposes
    if (alertMessage.toLowerCase().includes("gas") || alertMessage.toLowerCase().includes("गैस")) {
      return "Ensure proper ventilation and gas monitoring equipment is functioning. All workers should carry personal gas detectors and know evacuation routes."
    } else if (
      alertMessage.toLowerCase().includes("roof") ||
      alertMessage.toLowerCase().includes("ceiling") ||
      alertMessage.toLowerCase().includes("छत")
    ) {
      return "Inspect roof support systems regularly. Use proper scaling techniques and never work under unsupported roof areas."
    } else if (
      alertMessage.toLowerCase().includes("water") ||
      alertMessage.toLowerCase().includes("flood") ||
      alertMessage.toLowerCase().includes("पानी")
    ) {
      return "Monitor water levels and ensure pumping systems are operational. Keep emergency evacuation routes clear and practice water emergency drills."
    } else if (
      alertMessage.toLowerCase().includes("equipment") ||
      alertMessage.toLowerCase().includes("machine") ||
      alertMessage.toLowerCase().includes("उपकरण")
    ) {
      return "Implement regular equipment maintenance checks. Ensure all operators are properly trained and follow lockout/tagout procedures."
    } else {
      return "Follow standard safety protocols and report any changes in conditions immediately. Regular safety training and awareness are key to preventing incidents."
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Header user={currentUser || { full_name: "User", role: "guest" }} title={t("chatbot.title")} />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-col flex-1 overflow-hidden">
          <main className="flex-1 overflow-auto p-6">
            <div className="flex flex-col space-y-4 pb-20">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-lg px-4 py-2 max-w-[80%] bg-muted">
                    <p>{t("chatbot.loading")}</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </main>
          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("chatbot.placeholder")}
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4 mr-2" />
                {t("chatbot.send")}
              </Button>
            </form>
          </div>
        </div>
        <div className="hidden lg:block border-l w-80 overflow-auto p-4">
          <div className="space-y-6">
            <div>
              <h3 className="font-medium flex items-center mb-2">
                <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                {t("chatbot.recentAlerts")}
              </h3>
              <div className="space-y-2">
                {alerts.length > 0 ? (
                  alerts.slice(0, 3).map((alert) => (
                    <div key={alert.id} className="text-sm border rounded-md p-2">
                      <p className="line-clamp-2">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(alert.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">{t("chatbot.noAlertsFound")}</p>
                )}
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="font-medium flex items-center mb-2">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                {t("chatbot.safetyTips")}
              </h3>
              <div className="space-y-2">
                <div className="text-sm border rounded-md p-2">
                  <p>
                    Always wear appropriate personal protective equipment (PPE) including helmets, safety glasses, and
                    respirators.
                  </p>
                </div>
                <div className="text-sm border rounded-md p-2">
                  <p>Check gas levels regularly and ensure proper ventilation in all work areas.</p>
                </div>
                <div className="text-sm border rounded-md p-2">
                  <p>Maintain communication with team members and supervisors at all times.</p>
                </div>
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="font-medium flex items-center mb-2">
                <MessageSquare className="h-4 w-4 mr-2 text-blue-500" />
                {t("chatbot.recommendations")}
              </h3>
              <div className="space-y-2">
                {alerts.length > 0 ? (
                  <Card className="text-sm">
                    <CardHeader className="py-2 px-3">
                      <CardTitle className="text-sm">{t("chatbot.alertsFound")}</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 px-3 space-y-2">
                      {alerts.slice(0, 2).map((alert, index) => (
                        <p key={index} className="text-xs">
                          • {generateRecommendation(alert.message)}
                        </p>
                      ))}
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="text-sm">
                    <CardHeader className="py-2 px-3">
                      <CardTitle className="text-sm">{t("chatbot.noAlertsFound")}</CardTitle>
                    </CardHeader>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
