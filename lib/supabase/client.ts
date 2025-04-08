import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

// Create a singleton instance of the Supabase client for Client Components
export const supabase = createClientComponentClient<Database>()

// Helper function to check if a user is an admin
export async function isAdmin() {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) return false

  const { data } = await supabase.from("admins").select("*").eq("id", session.user.id).single()

  return !!data
}

// Helper function to check if a user is an examiner
export async function isExaminer() {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) return false

  const { data } = await supabase.from("examiners").select("*").eq("id", session.user.id).single()

  return !!data
}

// Helper function to get user role
export async function getUserRole() {
  if (await isAdmin()) return "admin"
  if (await isExaminer()) return "examiner"
  return null
}

// Helper function to ensure examiner profile exists
export async function ensureExaminerProfile() {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) return false

  // Check if examiner profile exists
  const { data: examiner } = await supabase.from("examiners").select("*").eq("id", session.user.id).single()

  if (examiner) return true

  // If no examiner profile but user has examiner metadata, create profile
  const { data: userData } = await supabase.auth.getUser()

  if (userData?.user?.user_metadata?.role === "examiner" && userData?.user?.user_metadata?.full_name) {
    // Create examiner profile from metadata
    const { error } = await supabase.from("examiners").insert({
      id: session.user.id,
      full_name: userData.user.user_metadata.full_name,
      age: userData.user.user_metadata.age || 25,
      date_deployed: userData.user.user_metadata.date_deployed || new Date().toISOString().split("T")[0],
      designation: userData.user.user_metadata.designation || "Staff",
      store_area: userData.user.user_metadata.store_area || "Main Branch",
    })

    return !error
  }

  return false
}
