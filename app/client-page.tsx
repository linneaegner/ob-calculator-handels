"use client"

import { LanguageSwitcher } from "@/components/language-switcher"
import { SalaryCalculator } from "@/components/salary-calculator"
import { useLanguage } from "@/lib/language-context"

export default function ClientPage() {
  const { t } = useLanguage()

  return (
    <main className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#0a3e41]">{t("page.title")}</h1>
          <LanguageSwitcher />
        </div>
        <SalaryCalculator />
      </div>

      <footer className="bg-[#0a3e41] text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">{t("footer.disclaimer")}</p>
        </div>
      </footer>
    </main>
  )
}
