import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import { Tooltip } from "@base-ui/react/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css"

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
})

export const metadata: Metadata = {
  title: "Delivery LosLatinos",
  description: "Servicio de entrega y compra a tu disposición",
  // icon.png and apple-icon.png are automatically detected by Next.js from the app/ directory
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={jakarta.variable} suppressHydrationWarning>
      <body
        className="min-h-screen flex flex-col"
        suppressHydrationWarning
      >
        <Tooltip.Provider delay={200}>{children}</Tooltip.Provider>
        <Toaster position="bottom-right" richColors />
      </body>
      <Analytics />
      <SpeedInsights />
    </html>
  )
}