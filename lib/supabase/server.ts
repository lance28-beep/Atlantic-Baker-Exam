import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { cache } from "react"
import type { Database } from "@/types/supabase"

// Create a cached version of the Supabase client for Server Components
export const createClient = cache(() => {
  const cookieStore = cookies()
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
})

// Helper function to check if a user is an admin (server-side)
export async function isAdminServer() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) return false

  const { data } = await supabase.from("admins").select("*").eq("id", session.user.id).single()

  return !!data
}

// Helper function to check if a user is an examiner (server-side)
export async function isExaminerServer() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) return false

  const { data } = await supabase.from("examiners").select("*").eq("id", session.user.id).single()

  return !!data
}

// Helper function to get user role (server-side)
export async function getUserRoleServer() {
  if (await isAdminServer()) return "admin"
  if (await isExaminerServer()) return "examiner"
  return null
}
