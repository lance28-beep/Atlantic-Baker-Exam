import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Suspense } from "react"

// Loading component for Suspense
function HomeLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-64"></div>
      </div>
    </div>
  )
}

// Auth check component
async function AuthCheck() {
  // Check if user is already logged in
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is logged in, redirect to appropriate dashboard
  if (session) {
    // Check if user is admin
    const { data: adminData } = await supabase.from("admins").select("*").eq("id", session.user.id).single()

    if (adminData) {
      redirect("/admin/dashboard")
    } else {
      redirect("/dashboard")
    }
  }

  return null
}

export default function Home() {
  return (
    <Suspense fallback={<HomeLoading />}>
      {/* Auth check */}
      <AuthCheck />

      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 py-4">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <div className="flex items-center">
              <Image src="/logo.png" alt="Atlantic Bakery Logo" width={150} height={40} priority />
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="outline">Log In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-primary hover:bg-primary/90">Sign Up</Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-primary text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Atlantic Bakery Exam System</h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              A comprehensive platform for employee assessment and professional development
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/auth/login">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                  Log In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="lg" className="bg-accent text-black hover:bg-accent/90">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Comprehensive Exams</h3>
                <p className="text-gray-600">
                  Multiple exam types tailored for different roles including SAP, Management Trainee, Sales, QC, and
                  Production.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-secondary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Instant Results</h3>
                <p className="text-gray-600">
                  Get immediate feedback on your performance with detailed breakdowns and downloadable PDF reports.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-accent"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Skill Development</h3>
                <p className="text-gray-600">
                  Identify areas for growth and improvement with detailed question reviews and performance analytics.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-12 mt-auto">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-6 md:mb-0">
                <Image src="/logo.png" alt="Atlantic Bakery Logo" width={120} height={30} priority />
                <p className="mt-2 text-gray-400">Empowering employee growth through assessment</p>
              </div>
              <div className="flex flex-col md:flex-row gap-8">
                <div>
                  <h4 className="font-semibold mb-3">Quick Links</h4>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/auth/login" className="text-gray-400 hover:text-white">
                        Log In
                      </Link>
                    </li>
                    <li>
                      <Link href="/auth/signup" className="text-gray-400 hover:text-white">
                        Sign Up
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Contact</h4>
                  <ul className="space-y-2">
                    <li className="text-gray-400">Email: info@atlanticbakery.com</li>
                    <li className="text-gray-400">Phone: (123) 456-7890</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; {new Date().getFullYear()} Atlantic Bakery. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </Suspense>
  )
}
