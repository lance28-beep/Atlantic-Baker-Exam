import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AuthCheck() {
  // Check if user is already logged in
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is logged in, redirect to appropriate dashboard
  if (session) {
    // Check if user is admin
    const { data: adminData } = await supabase.from("admins").select("*").eq("id", session.user.id).single()

    if (adminData) {
      redirect("/admin/dashboard")
    } else {
      redirect("/dashboard")
    }
  }

  return null
} 