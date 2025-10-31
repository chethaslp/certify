import type React from "react"
import "@/app/globals.css"
import { AuthProvider } from "@/components/auth-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthCheck } from "@/components/auth-check"

export const metadata = {
  title: "Certify by @clp",
  description: "Create and send beautiful certificates with ease.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <AuthCheck>{children}</AuthCheck>
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}



import './globals.css'