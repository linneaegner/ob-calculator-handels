"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Language = "sv" | "en"

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const translations = {
  sv: {
    "page.title": "Vad tjänar du på passet?",
    "calculator.title": "OB Löneberäknare",
    "calculator.description": "Beräkna din lön inklusive OB-tillägg enligt Handels kollektivavtal",
    "calculator.workArea": "Välj arbetsområde",
    "calculator.store": "Butik",
    "calculator.warehouse": "Lager",
    "calculator.ecommerce": "E-handel",
    "calculator.date": "Datum",
    "calculator.break": "Rast (minuter)",
    "calculator.startTime": "Starttid",
    "calculator.endTime": "Sluttid",
    "calculator.baseWage": "Grundlön (SEK/timme)",
    "calculator.taxRate": "Skattesats (%)",
    "calculator.clear": "Rensa",
    "calculator.calculate": "Beräkna Lön",
    "result.title": "Beräkningsresultat",
    "result.grossSalary": "Bruttolön",
    "result.grossSalary.tooltip":
      "Bruttolön är din totala lön före skatt och andra avdrag. Den inkluderar din grundlön plus eventuella OB-tillägg enligt Handels avtal för valt område.",
    "result.netSalary": "Nettolön",
    "result.netSalary.tooltip":
      "Nettolön är den uppskattade summan du får utbetald efter att angiven skatt har dragits av från bruttolönen.",
    "result.details": "Beräkningsdetaljer",
    "result.selectedArea": "Valt Område",
    "result.workedHours": "Arbetade timmar",
    "result.basePay": "Grundlön",
    "result.obAdditions": "OB-tillägg",
    "footer.disclaimer": "Informationen baseras på Handels avtal 2025. Kontrollera alltid din lönespecifikation. Vi reserverar oss för eventuella fel.",
  },
  en: {
    "page.title": "What will you earn for your shift?",
    "calculator.title": "Inconvenient Hours Calculator",
    "calculator.description":
      "Calculate your salary including inconvenient hours supplements according to Handels collective agreement",
    "calculator.workArea": "Select work area",
    "calculator.store": "Store",
    "calculator.warehouse": "Warehouse",
    "calculator.ecommerce": "E-commerce",
    "calculator.date": "Date",
    "calculator.break": "Break (minutes)",
    "calculator.startTime": "Start time",
    "calculator.endTime": "End time",
    "calculator.baseWage": "Base wage (SEK/hour)",
    "calculator.taxRate": "Tax rate (%)",
    "calculator.clear": "Clear",
    "calculator.calculate": "Calculate Salary",
    "result.title": "Calculation Result",
    "result.grossSalary": "Gross Salary",
    "result.grossSalary.tooltip":
      "Gross salary is your total salary before tax and other deductions. It includes your base wage plus any inconvenient hours supplements according to the Handels agreement for the selected area.",
    "result.netSalary": "Net Salary",
    "result.netSalary.tooltip":
      "Net salary is the estimated amount you will receive after the specified tax has been deducted from the gross salary.",
    "result.details": "Calculation Details",
    "result.selectedArea": "Selected Area",
    "result.workedHours": "Worked Hours",
    "result.basePay": "Base Pay",
    "result.obAdditions": "Inconvenient Hours Supplements",
    "footer.disclaimer": "Based on the 2025 Handels agreement. Always check your payslip. We disclaim responsibility for any errors.",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("sv")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "sv" || savedLanguage === "en")) {
      setLanguageState(savedLanguage)
    }
  }, [])

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage)
    localStorage.setItem("language", newLanguage)
  }

  const t = (key: string): string => {
    return translations[language][key] || key
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
