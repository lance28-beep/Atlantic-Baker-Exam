import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "Atlantic Bakery Exam System",
  description: "A comprehensive exam management system for Atlantic Bakery employees. Take assessments, track progress, and enhance your bakery knowledge.",
  keywords: ["Atlantic Bakery", "exam system", "employee assessment", "bakery training", "online exams", "employee evaluation"],
  authors: [{ name: "Atlantic Bakery" }],
  creator: "Atlantic Bakery",
  publisher: "Atlantic Bakery",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon_io/favicon.ico" },
      { url: "/favicon_io/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon_io/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/favicon_io/apple-touch-icon.png" },
    ],
  },
  manifest: "/favicon_io/site.webmanifest",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://atlantic-bakery-exam.com",
    title: "Atlantic Bakery Exam System",
    description: "A comprehensive exam management system for Atlantic Bakery employees. Take assessments, track progress, and enhance your bakery knowledge.",
    siteName: "Atlantic Bakery Exam System",
  },
  twitter: {
    card: "summary_large_image",
    title: "Atlantic Bakery Exam System",
    description: "A comprehensive exam management system for Atlantic Bakery employees. Take assessments, track progress, and enhance your bakery knowledge.",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={poppins.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'