import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import LoginForm from "@/components/login-form"
import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"

// Loading component for Suspense
function LoginLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
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

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      {/* Auth check */}
      <AuthCheck />

      <div className="flex min-h-screen bg-gray-50">
        {/* Left side - Form */}
        <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link href="/">
              <Image src="/logo.png" alt="Atlantic Bakery Logo" width={180} height={80} priority />
            </Link>
          </div>
          <LoginForm />
        </div>

        {/* Right side - Image */}
        <div className="hidden lg:block lg:w-1/2 bg-primary">
          <div className="h-full flex items-center justify-center p-12">
            <div className="max-w-md text-white">
              <h2 className="text-3xl font-bold mb-6">Welcome to Atlantic Bakery Exam System</h2>
              <p className="text-lg mb-8">Our comprehensive platform for employee assessment and development.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="font-semibold text-accent mb-2">Comprehensive Exams</h3>
                  <p className="text-sm">Multiple exam types for different roles and departments</p>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="font-semibold text-accent mb-2">Instant Results</h3>
                  <p className="text-sm">Get immediate feedback on your performance</p>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="font-semibold text-accent mb-2">Progress Tracking</h3>
                  <p className="text-sm">Monitor your improvement over time</p>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="font-semibold text-accent mb-2">Skill Development</h3>
                  <p className="text-sm">Identify areas for growth and improvement</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  )
}
