import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Download, Home } from "lucide-react"

export default async function ExamResultsPage({ params }: { params: { id: string } }) {
  // Get the user from the server
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If no user, redirect to login
  if (!session) {
    redirect("/auth/login")
  }

  // Get exam attempt
  const { data: examAttempt } = await supabase
    .from("exam_attempts")
    .select(`
      *,
      examiners!inner(full_name, designation, store_area)
    `)
    .eq("id", params.id)
    .single()

  if (!examAttempt) {
    redirect("/dashboard")
  }

  // Check if user is authorized to view this result
  if (examAttempt.user_id !== session.user.id) {
    // Check if user is admin
    const { data: admin } = await supabase.from("admins").select("*").eq("id", session.user.id).single()

    if (!admin) {
      redirect("/dashboard")
    }
  }

  // Get questions for this exam
  const questionIds = Object.keys(examAttempt.answers)
  const { data: questions } = await supabase.from("questions").select("*").in("id", questionIds)

  // Calculate time taken
  const timeTaken = examAttempt.time_taken || 0
  const minutes = Math.floor(timeTaken / 60)
  const seconds = timeTaken % 60

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader className="bg-primary text-white">
            <CardTitle className="text-2xl">Exam Results</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Exam Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Exam Type:</span>
                    <span className="font-medium">{examAttempt.exam_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date Taken:</span>
                    <span className="font-medium">
                      {new Date(examAttempt.completed_at || examAttempt.started_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time Taken:</span>
                    <span className="font-medium">
                      {minutes}m {seconds}s
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Score Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Score:</span>
                    <span className="font-medium">
                      {examAttempt.score}/{examAttempt.total_questions}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Percentage:</span>
                    <span className="font-medium">
                      {Math.round((examAttempt.score / examAttempt.total_questions) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Result:</span>
                    <span
                      className={`font-medium ${
                        (examAttempt.score / examAttempt.total_questions) >= 0.7 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {examAttempt.score / examAttempt.total_questions >= 0.7 ? "PASSED" : "FAILED"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div
                  className={`h-4 rounded-full ${
                    (examAttempt.score / examAttempt.total_questions) >= 0.7 ? "bg-green-600" : "bg-red-600"
                  }`}
                  style={{ width: `${(examAttempt.score / examAttempt.total_questions) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between mb-6">
          <Link href="/dashboard">
            <Button variant="outline">
              <Home className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <Link href={`/exam/pdf/${params.id}`} target="_blank">
            <Button className="bg-primary hover:bg-primary/90">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </Link>
        </div>

        <h2 className="text-2xl font-bold mb-4">Question Review</h2>

        {questions &&
          questions.map((question, index) => {
            const userAnswer = examAttempt.answers[question.id]
            const isCorrect =
              question.question_type === "essay"
                ? null
                : question.question_type === "multiple_choice"
                  ? userAnswer === question.correct_answer
                  : question.question_type === "true_false"
                    ? userAnswer === question.correct_answer
                    : question.question_type === "fill_in_blank"
                      ? userAnswer &&
                        question.correct_answer &&
                        userAnswer.toLowerCase().trim() === question.correct_answer.toLowerCase().trim()
                      : false

            return (
              <Card key={question.id} className="mb-4">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-medium">Question {index + 1}</h3>
                    {isCorrect !== null && (
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {isCorrect ? "Correct" : "Incorrect"}
                      </span>
                    )}
                  </div>

                  <p className="mb-4">{question.question_text}</p>

                  {question.image_url && (
                    <div className="mb-4">
                      <img
                        src={question.image_url || "/placeholder.svg"}
                        alt="Question"
                        className="max-h-40 object-contain rounded-lg border"
                      />
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Your Answer:</h4>
                      {question.question_type === "multiple_choice" && (
                        <p className="mt-1">
                          {userAnswer !== null && userAnswer !== undefined
                            ? question.options[Number.parseInt(userAnswer)]
                            : "No answer provided"}
                        </p>
                      )}

                      {question.question_type === "true_false" && (
                        <p className="mt-1">
                          {userAnswer !== null && userAnswer !== undefined
                            ? userAnswer
                              ? "True"
                              : "False"
                            : "No answer provided"}
                        </p>
                      )}

                      {question.question_type === "fill_in_blank" && (
                        <p className="mt-1">{userAnswer || "No answer provided"}</p>
                      )}

                      {question.question_type === "essay" && (
                        <p className="mt-1 whitespace-pre-wrap">{userAnswer || "No answer provided"}</p>
                      )}
                    </div>

                    {question.question_type !== "essay" && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Correct Answer:</h4>
                        {question.question_type === "multiple_choice" && (
                          <p className="mt-1">{question.options[Number.parseInt(question.correct_answer)]}</p>
                        )}

                        {question.question_type === "true_false" && (
                          <p className="mt-1">{question.correct_answer ? "True" : "False"}</p>
                        )}

                        {question.question_type === "fill_in_blank" && (
                          <p className="mt-1">{question.correct_answer}</p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
      </div>
    </div>
  )
}
