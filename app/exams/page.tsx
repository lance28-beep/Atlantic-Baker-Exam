import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardLayout from "@/components/dashboard-layout"
import Link from "next/link"
import { Eye, FileText } from "lucide-react"

export default async function MyExamsPage() {
  // Get the user from the server
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If no user, redirect to login
  if (!session) {
    redirect("/auth/login")
  }

  // Check if user is examiner
  const { data: examiner } = await supabase.from("examiners").select("*").eq("id", session.user.id).single()

  // If not an examiner, check if admin
  if (!examiner) {
    const { data: admin } = await supabase.from("admins").select("*").eq("id", session.user.id).single()

    if (admin) {
      redirect("/admin/dashboard")
    }

    // Try to create examiner profile from metadata
    const { data: userData } = await supabase.auth.getUser()

    if (userData?.user?.user_metadata?.role === "examiner" && userData?.user?.user_metadata?.full_name) {
      // Create examiner profile from metadata
      const { error: profileError } = await supabase.from("examiners").insert({
        id: session.user.id,
        full_name: userData.user.user_metadata.full_name,
        age: userData.user.user_metadata.age || 25,
        date_deployed: userData.user.user_metadata.date_deployed || new Date().toISOString().split("T")[0],
        designation: userData.user.user_metadata.designation || "Staff",
        store_area: userData.user.user_metadata.store_area || "Main Branch",
      })

      if (profileError) {
        // If we can't create the profile, show error
        return (
          <DashboardLayout>
            <div className="p-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Error</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Your account does not have an examiner profile. Please contact an administrator for assistance.
                  </p>
                  <p className="text-sm text-red-600">Error: {profileError.message}</p>
                  <form action="/auth/logout" method="post" className="mt-4">
                    <Button type="submit" variant="destructive">
                      Sign Out
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </DashboardLayout>
        )
      }

      // Refresh the examiner data
      const { data: newExaminer } = await supabase.from("examiners").select("*").eq("id", session.user.id).single()

      if (!newExaminer) {
        return (
          <DashboardLayout>
            <div className="p-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Error</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Your account does not have an examiner profile. Please contact an administrator for assistance.</p>
                  <form action="/auth/logout" method="post" className="mt-4">
                    <Button type="submit" variant="destructive">
                      Sign Out
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </DashboardLayout>
        )
      }
    } else {
      // If no metadata, show error
      return (
        <DashboardLayout>
          <div className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Error</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Your account does not have an examiner profile. Please contact an administrator for assistance.</p>
                <form action="/auth/logout" method="post" className="mt-4">
                  <Button type="submit" variant="destructive">
                    Sign Out
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      )
    }
  }

  // Get exam attempts
  const { data: examAttempts } = await supabase
    .from("exam_attempts")
    .select("*")
    .eq("user_id", session.user.id)
    .order("completed_at", { ascending: false })

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Exams</h1>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {examAttempts && examAttempts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Exam History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Exam Type</th>
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">Score</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {examAttempts.map((attempt) => (
                        <tr key={attempt.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="py-3 px-4">{attempt.exam_type}</td>
                          <td className="py-3 px-4">
                            {new Date(attempt.completed_at || attempt.started_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            {attempt.completed_at ? (
                              <span>
                                {attempt.score}/{attempt.total_questions} (
                                {Math.round((attempt.score / attempt.total_questions) * 100)}%)
                              </span>
                            ) : (
                              <span className="text-yellow-600">In Progress</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {attempt.completed_at ? (
                              <span
                                className={
                                  attempt.score / attempt.total_questions >= 0.7 ? "text-green-600" : "text-red-600"
                                }
                              >
                                {attempt.score / attempt.total_questions >= 0.7 ? "PASSED" : "FAILED"}
                              </span>
                            ) : (
                              <span className="text-yellow-600">Incomplete</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {attempt.completed_at ? (
                              <div className="flex space-x-2">
                                <Link href={`/exam/results/${attempt.id}`}>
                                  <Button variant="outline" size="sm" className="flex items-center">
                                    <Eye className="h-4 w-4 mr-1" />
                                    View Results
                                  </Button>
                                </Link>
                                <Link href={`/exam/pdf/${attempt.id}`} target="_blank">
                                  <Button variant="outline" size="sm" className="flex items-center">
                                    <FileText className="h-4 w-4 mr-1" />
                                    PDF
                                  </Button>
                                </Link>
                              </div>
                            ) : (
                              <Link href={`/exam/${attempt.id}`}>
                                <Button variant="outline" size="sm" className="flex items-center">
                                  <Eye className="h-4 w-4 mr-1" />
                                  Continue
                                </Button>
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-medium mb-2">No Exam Attempts Yet</h3>
                <p className="text-gray-500 mb-6">You haven't taken any exams yet.</p>
                <Link href="/dashboard">
                  <Button className="bg-primary hover:bg-primary/90">Start an Exam</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
