import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import QuestionForm from "@/components/question-form"

export default async function EditQuestionPage({ params }: { params: { id: string } }) {
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

  // Get question data
  const { data: question } = await supabase.from("questions").select("*").eq("id", params.id).single()

  if (!question) {
    redirect("/admin/questions")
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Edit Question</h1>
        <QuestionForm mode="edit" initialData={question} />
      </div>
    </DashboardLayout>
  )
}
