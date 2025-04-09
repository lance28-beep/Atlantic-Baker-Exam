import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardLayout from "@/components/dashboard-layout"
import AdminAuthForm from "@/components/admin-auth-form"
import ExamSettingsForm from "@/components/exam-settings-form"
import ExaminerApprovalList from "@/components/examiner-approval-list"

export default async function SettingsPage() {
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

  // Get all users
  const { data: users } = await supabase.auth.admin.listUsers()

  // Get exam settings
  const { data: examSettings } = await supabase
    .from("exam_settings")
    .select("*")
    .single()

  // Get pending examiners
  const { data: examiners } = await supabase
    .from("examiners")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        <div className="grid gap-6">
          {/* Exam Settings Section */}
          <Card>
            <CardHeader>
              <CardTitle>Exam Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <ExamSettingsForm initialSettings={examSettings} />
            </CardContent>
          </Card>

          {/* Examiner Approval Section */}
          <Card>
            <CardHeader>
              <CardTitle>Examiner Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <ExaminerApprovalList examiners={examiners || []} />
            </CardContent>
          </Card>

          {/* Admin Authorization Section */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Authorization</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminAuthForm />
            </CardContent>
          </Card>

          {/* User Management Section */}
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-left py-3 px-4">Role</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users?.users.map((user) => (
                      <tr key={user.id} className="border-b">
                        <td className="py-3 px-4">{user.email}</td>
                        <td className="py-3 px-4">{user.user_metadata?.role || "No role"}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.confirmed_at ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {user.confirmed_at ? "Confirmed" : "Pending"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <form action={async (formData) => {
                            "use server"
                            const supabase = createClient()
                            const { error } = await supabase.from("admins").insert({
                              id: user.id,
                              role: "admin",
                            })
                            if (!error) {
                              redirect("/admin/settings")
                            }
                          }}>
                            <input type="hidden" name="userId" value={user.id} />
                            <button
                              type="submit"
                              className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
                            >
                              Make Admin
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
} 