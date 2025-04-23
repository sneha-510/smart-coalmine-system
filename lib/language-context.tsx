"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Language = "en" | "hi"

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string, params?: Record<string, string>) => string
}

const translations = {
  en: {
    // Common
    "app.name": "Coal Mine Management System",
    "app.tagline": "Smart Coal Mine Productivity & Safety Management System",
    "app.description":
      "A comprehensive solution for managing coal mine operations, worker safety, and productivity tracking.",
    success: "Success",
    error: "Error",
    cancel: "Cancel",

    // Auth
    "auth.login": "Login",
    "auth.register": "Register",
    "auth.logout": "Logout",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.forgotPassword": "Forgot password?",
    "auth.noAccount": "Don't have an account?",
    "auth.hasAccount": "Already have an account?",
    "auth.signIn": "Sign In",
    "auth.createAccount": "Create Account",

    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.welcome": "Welcome",

    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.users": "Users",
    "nav.shifts": "Shifts",
    "nav.attendance": "Attendance",
    "nav.alerts": "Alerts",
    "nav.reports": "Reports",

    // Profile
    "profile.settings": "Settings",
    "profile.logout": "Logout",

    // Landing
    "landing.getStarted": "Get Started",
    "landing.createAccount": "Create Account",
    "landing.readyToImprove": "Ready to improve mine safety and productivity?",
    "landing.joinPlatform": "Join our platform to streamline operations and enhance safety measures.",
    "landing.signUpNow": "Sign Up Now",
    "landing.chatWithUs": "Chat with Safety Assistant",

    // Features
    "features.adminDashboard": "Admin Dashboard",
    "features.adminDescription":
      "Manage workers, assign shifts, track attendance, and handle safety alerts from a centralized dashboard.",
    "features.workerPortal": "Worker Portal",
    "features.workerDescription":
      "View shifts, check-in/out, report safety concerns, and track personal attendance records.",
    "features.safetyAuditing": "Safety Auditing",
    "features.safetyDescription":
      "Review safety alerts, submit detailed reports, and ensure compliance with safety protocols.",

    // Attendance
    "attendance.title": "Attendance",
    "attendance.records": "Attendance Records",
    "attendance.description": "View and manage worker attendance records",
    "attendance.recordNew": "Record Attendance",
    "attendance.recordAttendance": "Record Worker Attendance",
    "attendance.selectWorker": "Select Worker",
    "attendance.selectWorkerPlaceholder": "Choose a worker",
    "attendance.selectShift": "Select Shift",
    "attendance.selectShiftPlaceholder": "Choose a shift",
    "attendance.noShiftsAssigned": "No shifts assigned to this worker",
    "attendance.checkIn": "Check In",
    "attendance.checkOut": "Check Out",
    "attendance.confirmCheckOut": "Confirm Check Out",
    "attendance.confirmCheckOutMessage": "Are you sure you want to check out {worker} for the shift on {date}?",
    "attendance.worker": "Worker",
    "attendance.date": "Date",
    "attendance.shiftTime": "Shift Time",
    "attendance.notCheckedIn": "Not checked in",
    "attendance.notCheckedOut": "Not checked out",
    "attendance.status": "Status",
    "attendance.absent": "Absent",
    "attendance.onShift": "On Shift",
    "attendance.completed": "Completed",
    "attendance.checkInSuccess": "Worker checked in successfully",
    "attendance.checkInError": "Failed to check in worker",
    "attendance.checkOutSuccess": "Worker checked out successfully",
    "attendance.checkOutError": "Failed to check out worker",
    "attendance.unexpectedError": "An unexpected error occurred",
    "attendance.fetchError": "Failed to fetch attendance records",

    // Chatbot
    "chatbot.title": "Safety Assistant",
    "chatbot.welcome": "Welcome to the Coal Mine Safety Assistant! How can I help you today?",
    "chatbot.placeholder": "Type your question about safety...",
    "chatbot.send": "Send",
    "chatbot.loading": "Thinking...",
    "chatbot.recentAlerts": "Recent Alerts Analysis",
    "chatbot.safetyTips": "Safety Tips",
    "chatbot.recommendations": "Recommendations",
    "chatbot.noAlertsFound": "No recent alerts found. The mine appears to be operating safely.",
    "chatbot.alertsFound": "Based on recent alerts, here are some safety recommendations:",
  },
  hi: {
    // Common
    "app.name": "कोयला खदान प्रबंधन प्रणाली",
    "app.tagline": "स्मार्ट कोयला खदान उत्पादकता और सुरक्षा प्रबंधन प्रणाली",
    "app.description": "कोयला खदान संचालन, श्रमिक सुरक्षा और उत्पादकता ट्रैकिंग के प्रबंधन के लिए एक व्यापक समाधान।",
    success: "सफलता",
    error: "त्रुटि",
    cancel: "रद्द करें",

    // Auth
    "auth.login": "लॉगिन",
    "auth.register": "रजिस्टर",
    "auth.logout": "लॉगआउट",
    "auth.email": "ईमेल",
    "auth.password": "पासवर्ड",
    "auth.forgotPassword": "पासवर्ड भूल गए?",
    "auth.noAccount": "खाता नहीं है?",
    "auth.hasAccount": "पहले से ही खाता है?",
    "auth.signIn": "साइन इन करें",
    "auth.createAccount": "खाता बनाएं",

    // Dashboard
    "dashboard.title": "डैशबोर्ड",
    "dashboard.welcome": "स्वागत है",

    // Navigation
    "nav.dashboard": "डैशबोर्ड",
    "nav.users": "उपयोगकर्ता",
    "nav.shifts": "शिफ्ट",
    "nav.attendance": "उपस्थिति",
    "nav.alerts": "अलर्ट",
    "nav.reports": "रिपोर्ट",

    // Profile
    "profile.settings": "सेटिंग्स",
    "profile.logout": "लॉगआउट",

    // Landing
    "landing.getStarted": "शुरू करें",
    "landing.createAccount": "खाता बनाएं",
    "landing.readyToImprove": "खदान सुरक्षा और उत्पादकता में सुधार के लिए तैयार हैं?",
    "landing.joinPlatform": "संचालन को सुव्यवस्थित करने और सुरक्षा उपायों को बढ़ाने के लिए हमारे प्लेटफॉर्म से जुड़ें।",
    "landing.signUpNow": "अभी साइन अप करें",
    "landing.chatWithUs": "सुरक्षा सहायक से चैट करें",

    // Features
    "features.adminDashboard": "व्यवस्थापक डैशबोर्ड",
    "features.adminDescription":
      "एक केंद्रीकृत डैशबोर्ड से श्रमिकों का प्रबंधन करें, शिफ्ट असाइन करें, उपस्थिति ट्रैक करें और सुरक्षा अलर्ट संभालें।",
    "features.workerPortal": "श्रमिक पोर्टल",
    "features.workerDescription": "शिफ्ट देखें, चेक-इन/आउट करें, सुरक्षा चिंताओं की रिपोर्ट करें और व्यक्तिगत उपस्थिति रिकॉर्ड ट्रैक करें।",
    "features.safetyAuditing": "सुरक्षा ऑडिटिंग",
    "features.safetyDescription":
      "सुरक्षा अलर्ट की समीक्षा करें, विस्तृत रिपोर्ट जमा करें और सुरक्षा प्रोटोकॉल के अनुपालन को सुनिश्चित करें।",

    // Attendance
    "attendance.title": "उपस्थिति",
    "attendance.records": "उपस्थिति रिकॉर्ड",
    "attendance.description": "श्रमिक उपस्थिति रिकॉर्ड देखें और प्रबंधित करें",
    "attendance.recordNew": "उपस्थिति दर्ज करें",
    "attendance.recordAttendance": "श्रमिक उपस्थिति दर्ज करें",
    "attendance.selectWorker": "श्रमिक चुनें",
    "attendance.selectWorkerPlaceholder": "एक श्रमिक चुनें",
    "attendance.selectShift": "शिफ्ट चुनें",
    "attendance.selectShiftPlaceholder": "एक शिफ्ट चुनें",
    "attendance.noShiftsAssigned": "इस श्रमिक को कोई शिफ्ट असाइन नहीं की गई है",
    "attendance.checkIn": "चेक इन",
    "attendance.checkOut": "चेक आउट",
    "attendance.confirmCheckOut": "चेक आउट की पुष्टि करें",
    "attendance.confirmCheckOutMessage": "क्या आप वाकई {worker} को {date} की शिफ्ट के लिए चेक आउट करना चाहते हैं?",
    "attendance.worker": "श्रमिक",
    "attendance.date": "दिनांक",
    "attendance.shiftTime": "शिफ्ट समय",
    "attendance.notCheckedIn": "चेक इन नहीं किया",
    "attendance.notCheckedOut": "चेक आउट नहीं किया",
    "attendance.status": "स्थिति",
    "attendance.absent": "अनुपस्थित",
    "attendance.onShift": "शिफ्ट पर",
    "attendance.completed": "पूर्ण",
    "attendance.checkInSuccess": "श्रमिक सफलतापूर्वक चेक इन किया गया",
    "attendance.checkInError": "श्रमिक को चेक इन करने में विफल",
    "attendance.checkOutSuccess": "श्रमिक सफलतापूर्वक चेक आउट किया गया",
    "attendance.checkOutError": "श्रमिक को चेक आउट करने में विफल",
    "attendance.unexpectedError": "एक अप्रत्याशित त्रुटि हुई",
    "attendance.fetchError": "उपस्थिति रिकॉर्ड प्राप्त करने में विफल",

    // Chatbot
    "chatbot.title": "सुरक्षा सहायक",
    "chatbot.welcome": "कोयला खदान सुरक्षा सहायक में आपका स्वागत है! मैं आज आपकी कैसे मदद कर सकता हूँ?",
    "chatbot.placeholder": "सुरक्षा के बारे में अपना प्रश्न टाइप करें...",
    "chatbot.send": "भेजें",
    "chatbot.loading": "सोच रहा हूँ...",
    "chatbot.recentAlerts": "हाल के अलर्ट का विश्लेषण",
    "chatbot.safetyTips": "सुरक्षा टिप्स",
    "chatbot.recommendations": "अनुशंसाएँ",
    "chatbot.noAlertsFound": "कोई हालिया अलर्ट नहीं मिला। खदान सुरक्षित रूप से संचालित हो रही है।",
    "chatbot.alertsFound": "हाल के अलर्ट के आधार पर, यहां कुछ सुरक्षा अनुशंसाएँ हैं:",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "hi")) {
      setLanguageState(savedLanguage)
    }
  }, [])

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage)
    localStorage.setItem("language", newLanguage)
  }

  const t = (key: string, params?: Record<string, string>) => {
    let text = translations[language][key] || key

    // Replace parameters if provided
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        text = text.replace(`{${key}}`, value)
      })
    }

    return text
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
