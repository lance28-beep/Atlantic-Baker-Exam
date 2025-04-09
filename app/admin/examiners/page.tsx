import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Eye } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import Link from "next/link"

export default async function ExaminersPage({ searchParams }: { searchParams: { search?: string } }) {
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

  // Get examiners with search filter
  let query = supabase.from("examiners").select("*").order("full_name", { ascending: true })

  if (searchParams.search) {
    query = query.ilike("full_name", `%${searchParams.search}%`)
  }

  const { data: examiners } = await query

  // Get exam attempts for each examiner
  const examAttemptsByExaminer: Record<string, any[]> = {}
  if (examiners && examiners.length > 0) {
    const examinerIds = examiners.map((e) => e.id)
    const { data: attempts } = await supabase
      .from("exam_attempts")
      .select("*")
      .in("user_id", examinerIds)
      .order("completed_at", { ascending: false })

    if (attempts) {
      attempts.forEach((attempt) => {
        if (!examAttemptsByExaminer[attempt.user_id]) {
          examAttemptsByExaminer[attempt.user_id] = []
        }
        examAttemptsByExaminer[attempt.user_id].push(attempt)
      })
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Examiner Management</h1>

        <div className="mb-6">
          <form className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                name="search"
                placeholder="Search examiners..."
                defaultValue={searchParams.search || ""}
                className="pl-8"
              />
            </div>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Search
            </Button>
          </form>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Examiners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Age</th>
                    <th className="text-left py-3 px-4">Designation</th>
                    <th className="text-left py-3 px-4">Store Area</th>
                    <th className="text-left py-3 px-4">Date Deployed</th>
                    <th className="text-left py-3 px-4">Latest Exam</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {examiners && examiners.length > 0 ? (
                    examiners.map((examiner) => {
                      const attempts = examAttemptsByExaminer[examiner.id] || []
                      const latestAttempt = attempts[0]
                      const hasPassed = latestAttempt?.completed_at
                        ? latestAttempt.score / latestAttempt.total_questions >= 0.7
                        : null

                      return (
                        <tr key={examiner.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="py-3 px-4">{examiner.full_name}</td>
                          <td className="py-3 px-4">{examiner.age}</td>
                          <td className="py-3 px-4">{examiner.designation}</td>
                          <td className="py-3 px-4">{examiner.store_area}</td>
                          <td className="py-3 px-4">{new Date(examiner.date_deployed).toLocaleDateString()}</td>
                          <td className="py-3 px-4">
                            {latestAttempt ? (
                              <span>
                                {latestAttempt.exam_type}
                                <br />
                                <span className="text-sm text-gray-500">
                                  {new Date(latestAttempt.completed_at || latestAttempt.started_at).toLocaleDateString()}
                                </span>
                              </span>
                            ) : (
                              <span className="text-gray-500">No attempts</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {latestAttempt?.completed_at ? (
                              <span
                                className={`font-medium ${
                                  hasPassed ? "text-green-600" : "text-red-600"
                                }`}
                              >
                                {hasPassed ? "PASSED" : "FAILED"}
                              </span>
                            ) : latestAttempt ? (
                              <span className="text-yellow-600">In Progress</span>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <Link href={`/admin/examiners/${examiner.id}`}>
                              <Button variant="outline" size="sm" className="flex items-center">
                                <Eye className="h-4 w-4 mr-1" />
                                View Details
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-4 text-center text-gray-500">
                        No examiners found.
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
