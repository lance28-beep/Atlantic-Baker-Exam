import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import type { ExamType } from "@/types"
import DeleteQuestionButton from "@/components/delete-question-button"

export default async function QuestionsPage() {
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

  // Get questions grouped by exam type
  const examTypes: ExamType[] = ["SAP", "Management Trainee", "Sales", "QC", "Production"]
  const questionsByType: Record<ExamType, any[]> = {} as Record<ExamType, any[]>

  for (const examType of examTypes) {
    const { data } = await supabase
      .from("questions")
      .select("*")
      .eq("exam_type", examType)
      .order("created_at", { ascending: false })

    questionsByType[examType] = data || []
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Question Management</h1>
          <Link href="/admin/questions/create">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {examTypes.map((examType) => (
            <Card key={examType}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{examType}</CardTitle>
                  <span className="text-sm text-gray-500">{questionsByType[examType].length} questions</span>
                </div>
              </CardHeader>
              <CardContent>
                {questionsByType[examType].length > 0 ? (
                  <div className="space-y-4">
                    {questionsByType[examType].map((question) => (
                      <div
                        key={question.id}
                        className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{question.question_text}</h3>
                          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                            {question.question_type}
                          </span>
                        </div>

                        {question.image_url && (
                          <div className="mb-2">
                            <img
                              src={question.image_url || "/placeholder.svg"}
                              alt="Question"
                              className="h-20 object-cover rounded"
                            />
                          </div>
                        )}

                        <div className="flex space-x-2 mt-2">
                          <Link href={`/admin/questions/edit/${question.id}`}>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </Link>
                          <DeleteQuestionButton questionId={question.id} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No questions for this exam type yet.</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
