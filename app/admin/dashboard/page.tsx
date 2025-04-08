import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardLayout from "@/components/dashboard-layout"
import type { ExamType } from "@/types"
import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { cookies } from "next/headers"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"

// Loading component for Suspense
function AdminDashboardLoading() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="h-60 bg-gray-200 rounded"></div>
            <div className="h-60 bg-gray-200 rounded"></div>
          </div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default async function AdminDashboard() {
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

  // If not an admin, redirect to examiner dashboard
  if (!admin) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p>You do not have admin privileges. Please contact an administrator for assistance.</p>
              <form
                action={async () => {
                  "use server"
                  const cookieStore = cookies()
                  const supabase = createServerActionClient({ cookies: () => cookieStore })
                  await supabase.auth.signOut()
                  redirect("/auth/login")
                }}
                className="mt-4"
              >
                <Button type="submit">Sign Out</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  // Get total number of examiners
  const { count: examinerCount } = await supabase.from("examiners").select("*", { count: "exact", head: true })

  // Get question counts by exam type
  const examTypes: ExamType[] = ["SAP", "Management Trainee", "Sales", "QC", "Production"]
  const questionCounts: Record<ExamType, number> = {} as Record<ExamType, number>

  for (const examType of examTypes) {
    const { count } = await supabase
      .from("questions")
      .select("*", { count: "exact", head: true })
      .eq("exam_type", examType)

    questionCounts[examType] = count || 0
  }

  // Get recent exam attempts
  const { data: recentAttempts } = await supabase
    .from("exam_attempts")
    .select(`
      id,
      exam_type,
      score,
      total_questions,
      completed_at,
      examiners!inner(full_name)
    `)
    .order("completed_at", { ascending: false })
    .limit(10)

  return (
    <Suspense fallback={<AdminDashboardLoading />}>
      <DashboardLayout>
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Examiners</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{examinerCount || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {Object.values(questionCounts).reduce((sum, count) => sum + count, 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Exam Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{examTypes.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Recent Attempts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{recentAttempts?.length || 0}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Questions by Exam Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {examTypes.map((examType) => (
                    <div key={examType} className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-4 mr-2">
                        <div
                          className="bg-primary h-4 rounded-full"
                          style={{
                            width: `${Math.min(100, (questionCounts[examType] / 50) * 100)}%`,
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between w-36">
                        <span>{examType}</span>
                        <span className="font-bold">{questionCounts[examType]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Exam Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {recentAttempts && recentAttempts.length > 0 ? (
                  <div className="space-y-4">
                    {recentAttempts.map((attempt) => (
                      <div key={attempt.id} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <p className="font-medium">{attempt.examiners.full_name}</p>
                          <p className="text-sm text-gray-500">{attempt.exam_type}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            {attempt.score}/{attempt.total_questions}
                          </p>
                          <p className="text-sm text-gray-500">{new Date(attempt.completed_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No recent exam activity.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Examiners</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Manage employee accounts, view their exam history, and track performance over time.
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Questions</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Create, edit, and organize questions for different exam types. Upload images and set correct
                    answers.
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Results</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    View detailed exam results, generate PDF reports, and analyze performance metrics.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </Suspense>
  )
}
