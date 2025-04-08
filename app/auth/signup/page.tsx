import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import SignUpForm from "@/components/signup-form"
import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"

// Loading component for Suspense
function SignUpLoading() {
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

export default function SignUpPage() {
  return (
    <Suspense fallback={<SignUpLoading />}>
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
          <SignUpForm />
        </div>

        {/* Right side - Image */}
        <div className="hidden lg:block lg:w-1/2 bg-secondary">
          <div className="h-full flex items-center justify-center p-12">
            <div className="max-w-md text-white">
              <h2 className="text-3xl font-bold mb-6">Join Atlantic Bakery's Team</h2>
              <p className="text-lg mb-8">
                Create your account to access our comprehensive exam system and advance your career.
              </p>
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="font-semibold text-accent mb-2">Why Create an Account?</h3>
                  <ul className="list-disc list-inside text-sm space-y-2">
                    <li>Access specialized exams for your role</li>
                    <li>Track your progress and performance</li>
                    <li>Identify areas for professional development</li>
                    <li>Receive personalized feedback</li>
                    <li>Download and save your exam results</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  )
}
