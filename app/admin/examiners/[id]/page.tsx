import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardLayout from "@/components/dashboard-layout"
import Link from "next/link"
import { ArrowLeft, FileText } from "lucide-react"

export default async function ExaminerDetailsPage({ params }: { params: { id: string } }) {
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
    redirect("/dashboard")
  }

  // Get examiner details
  const { data: examiner } = await supabase.from("examiners").select("*").eq("id", params.id).single()

  if (!examiner) {
    redirect("/admin/examiners")
  }

  // Get examiner's exam attempts
  const { data: examAttempts } = await supabase
    .from("exam_attempts")
    .select("*")
    .eq("user_id", params.id)
    .order("completed_at", { ascending: false })

  // Calculate statistics
  const totalAttempts = examAttempts?.length || 0
  const completedAttempts = examAttempts?.filter((attempt) => attempt.completed_at).length || 0
  const passedAttempts = examAttempts?.filter(
    (attempt) => attempt.completed_at && attempt.score / attempt.total_questions >= 0.7
  ).length || 0

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/examiners">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Examiners
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Examiner Details</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Full Name:</span>
                  <span className="font-medium">{examiner.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Age:</span>
                  <span className="font-medium">{examiner.age}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Designation:</span>
                  <span className="font-medium">{examiner.designation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Store Area:</span>
                  <span className="font-medium">{examiner.store_area}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date Deployed:</span>
                  <span className="font-medium">{new Date(examiner.date_deployed).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Exam Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-3xl font-bold text-primary">{totalAttempts}</p>
                  <p className="text-sm text-gray-500">Total Attempts</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-3xl font-bold text-secondary">{completedAttempts}</p>
                  <p className="text-sm text-gray-500">Completed</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-3xl font-bold text-accent">{passedAttempts}</p>
                  <p className="text-sm text-gray-500">Passed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
                  {examAttempts && examAttempts.length > 0 ? (
                    examAttempts.map((attempt) => (
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
                                attempt.score / attempt.total_questions >= 0.7
                                  ? "text-green-600 font-medium"
                                  : "text-red-600 font-medium"
                              }
                            >
                              {attempt.score / attempt.total_questions >= 0.7 ? "PASSED" : "FAILED"}
                            </span>
                          ) : (
                            <span className="text-yellow-600">Incomplete</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {attempt.completed_at && (
                            <div className="flex space-x-2">
                              <Link href={`/exam/results/${attempt.id}`}>
                                <Button variant="outline" size="sm">
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
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-gray-500">
                        No exam attempts found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
} 