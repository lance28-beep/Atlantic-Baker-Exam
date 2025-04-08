import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import type { ExamType } from "@/types"

export default async function ExamStartPage({ searchParams }: { searchParams: { type?: string } }) {
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

  // If not an examiner, redirect to admin dashboard
  if (!examiner) {
    const { data: admin } = await supabase.from("admins").select("*").eq("id", session.user.id).single()

    if (admin) {
      redirect("/admin/dashboard")
    }

    redirect("/auth/login")
  }

  // Validate exam type
  const examType = searchParams.type as ExamType
  const validExamTypes: ExamType[] = ["SAP", "Management Trainee", "Sales", "QC", "Production"]

  if (!examType || !validExamTypes.includes(examType)) {
    redirect("/dashboard")
  }

  // Get question count for this exam type
  const { count } = await supabase
    .from("questions")
    .select("*", { count: "exact", head: true })
    .eq("exam_type", examType)

  if (!count || count < 5) {
    // Not enough questions for this exam type
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Exam Not Available</CardTitle>
            <CardDescription>There are not enough questions available for this exam type.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Please contact an administrator to add more questions for the {examType} exam.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard" className="w-full">
              <Button className="w-full">Return to Dashboard</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Check if user already has an incomplete exam attempt
  const { data: existingAttempt } = await supabase
    .from("exam_attempts")
    .select("*")
    .eq("user_id", session.user.id)
    .eq("exam_type", examType)
    .is("completed_at", null)
    .single()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{examType} Exam</CardTitle>
          <CardDescription>You are about to start the {examType} assessment.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              This exam contains {Math.min(count, 20)} questions and will test your knowledge of {examType} concepts.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h3 className="font-medium text-yellow-800 mb-2">Important Information</h3>
              <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                <li>You will have 30 minutes to complete the exam</li>
                <li>Your answers are automatically saved</li>
                <li>You can review questions before submitting</li>
                <li>Once submitted, you cannot retake the exam</li>
              </ul>
            </div>
            {existingAttempt && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="text-blue-700">
                  You have an incomplete exam attempt. You can continue where you left off.
                </p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link href="/dashboard">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Link href={existingAttempt ? `/exam/${existingAttempt.id}` : `/exam/take?type=${examType}`}>
            <Button className="bg-primary hover:bg-primary/90">
              {existingAttempt ? "Continue Exam" : "Start Exam"}
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
