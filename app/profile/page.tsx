import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardLayout from "@/components/dashboard-layout"
import { Suspense } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cookies } from "next/headers"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"

// Loading component for Suspense
function ProfileLoading() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-80 bg-gray-200 rounded"></div>
            <div className="h-80 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default async function ProfilePage() {
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
      const { error: profileError, data: newExaminer } = await supabase
        .from("examiners")
        .insert({
          id: session.user.id,
          full_name: userData.user.user_metadata.full_name,
          age: userData.user.user_metadata.age || 25,
          date_deployed: userData.user.user_metadata.date_deployed || new Date().toISOString().split("T")[0],
          designation: userData.user.user_metadata.designation || "Staff",
          store_area: userData.user.user_metadata.store_area || "Main Branch",
        })
        .select()
        .single()

      if (profileError || !newExaminer) {
        // If we can't create the profile, show error
        return (
          <DashboardLayout>
            <div className="p-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Error</CardTitle>
                  <CardDescription>Your account is not properly configured.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Your account does not have an examiner profile. Please contact an administrator for assistance.
                  </p>
                  {profileError && <p className="text-sm text-red-600">Error: {profileError.message}</p>}
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

      // Use the newly created examiner profile
      const examiner = newExaminer
    } else {
      // If neither examiner nor admin, show error
      return (
        <DashboardLayout>
          <div className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Error</CardTitle>
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
  }

  // Get exam attempts count
  const { count: attemptCount } = await supabase
    .from("exam_attempts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", session.user.id)

  // Get completed exam attempts count
  const { count: completedCount } = await supabase
    .from("exam_attempts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", session.user.id)
    .not("completed_at", "is", null)

  // Get passed exam attempts count
  const { data: passedAttempts } = await supabase
    .from("exam_attempts")
    .select("*")
    .eq("user_id", session.user.id)
    .not("completed_at", "is", null)

  const passedCount = passedAttempts?.filter((attempt) => attempt.score / attempt.total_questions >= 0.7).length || 0

  return (
    <Suspense fallback={<ProfileLoading />}>
      <DashboardLayout>
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">My Profile</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={session.user.email} readOnly className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input id="full_name" value={examiner.full_name} readOnly className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" value={examiner.age} readOnly className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Input id="designation" value={examiner.designation} readOnly className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store_area">Branch/Store Area</Label>
                  <Input id="store_area" value={examiner.store_area} readOnly className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_deployed">Date Deployed</Label>
                  <Input
                    id="date_deployed"
                    value={new Date(examiner.date_deployed).toLocaleDateString()}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Edit Profile
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Exam Statistics</CardTitle>
                <CardDescription>Your exam performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-3xl font-bold text-primary">{attemptCount || 0}</p>
                      <p className="text-sm text-gray-500">Total Attempts</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-3xl font-bold text-secondary">{completedCount || 0}</p>
                      <p className="text-sm text-gray-500">Completed</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-3xl font-bold text-accent">{passedCount}</p>
                      <p className="text-sm text-gray-500">Passed</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium">Pass Rate</p>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-green-600 h-4 rounded-full"
                        style={{
                          width: `${completedCount ? Math.round((passedCount / completedCount) * 100) : 0}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 text-right">
                      {completedCount ? Math.round((passedCount / completedCount) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-primary hover:bg-primary/90" asChild>
                  <Link href="/exams">View Exam History</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </Suspense>
  )
}
