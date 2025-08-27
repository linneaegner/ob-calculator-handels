import type React from "react"
import { LanguageProvider } from "@/lib/language-context"
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  )
}

export const metadata = {
  title: 'OB Löneberäknare – Räkna ut lön med OB-tillägg',
  description: 'Beräkna din lön inklusive OB-tillägg enligt Handels kollektivavtal. Välj arbetsområde, ange tid och lön, och få snabb beräkning!',
  generator: 'v0.dev',
};
