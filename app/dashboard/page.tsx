import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { ExamType } from "@/types"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import { Suspense } from "react"
import { cookies } from "next/headers"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"

// Loading component for Suspense
function DashboardLoading() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="h-40 bg-gray-200 rounded"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="h-60 bg-gray-200 rounded"></div>
            <div className="h-60 bg-gray-200 rounded"></div>
            <div className="h-60 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default async function Dashboard() {
  // Get the user from the server
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If no user, redirect to login
  if (!session) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: admin } = await supabase.from("admins").select("*").eq("id", session.user.id).single()

  // If admin, redirect to admin dashboard
  if (admin) {
    redirect("/admin/dashboard")
  }

  // Get examiner data
  const { data: examiner } = await supabase.from("examiners").select("*").eq("id", session.user.id).single()

  // If not an examiner, show error
  if (!examiner) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Error</CardTitle>
              <CardDescription>Your account is not properly configured.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Your account does not have an examiner profile. Please contact an administrator for assistance.</p>
            </CardContent>
            <CardFooter>
              <form
                action={async () => {
                  "use server"
                  const cookieStore = cookies()
                  const supabase = createServerActionClient({ cookies: () => cookieStore })
                  await supabase.auth.signOut()
                  redirect("/auth/login")
                }}
              >
                <Button type="submit">Sign Out</Button>
              </form>
            </CardFooter>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  // Get recent exam attempts
  const { data: recentAttempts } = await supabase
    .from("exam_attempts")
    .select("*")
    .eq("user_id", session.user.id)
    .order("completed_at", { ascending: false })
    .limit(5)

  // Define exam types
  const examTypes: ExamType[] = ["SAP", "Management Trainee", "Sales", "QC", "Production"]

  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardLayout>
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">Welcome, {examiner.full_name}</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>Your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Full Name:</span>
                    <span>{examiner.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Designation:</span>
                    <span>{examiner.designation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Store Area:</span>
                    <span>{examiner.store_area}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Date Deployed:</span>
                    <span>{new Date(examiner.date_deployed).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Exams</CardTitle>
                <CardDescription>Your latest exam attempts</CardDescription>
              </CardHeader>
              <CardContent>
                {recentAttempts && recentAttempts.length > 0 ? (
                  <div className="space-y-4">
                    {recentAttempts.map((attempt) => (
                      <div key={attempt.id} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <p className="font-medium">{attempt.exam_type}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(attempt.completed_at || attempt.started_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            {attempt.score}/{attempt.total_questions}
                          </p>
                          <p className="text-sm text-gray-500">
                            {Math.round((attempt.score / attempt.total_questions) * 100)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No exam attempts yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-bold mb-4">Available Exams</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {examTypes.map((examType) => (
              <Card key={examType} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{examType}</CardTitle>
                  <CardDescription>Assessment for {examType} role</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    {examType === "SAP" && "Test your knowledge of SAP systems and processes."}
                    {examType === "Management Trainee" && "Evaluate your management and leadership skills."}
                    {examType === "Sales" && "Assess your sales techniques and customer service abilities."}
                    {examType === "QC" && "Test your quality control knowledge and attention to detail."}
                    {examType === "Production" && "Evaluate your production process knowledge and efficiency."}
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href={`/exam/start?type=${examType}`} className="w-full">
                    <Button className="w-full bg-primary hover:bg-primary/90">Start Exam</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    </Suspense>
  )
}
