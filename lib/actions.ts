"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"

// Validation schemas
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

const signupSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
    full_name: z.string().min(2, "Full name is required"),
    age: z.number().min(18, "You must be at least 18 years old"),
    date_deployed: z.string(),
    designation: z.string(),
    store_area: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

// Login action
export async function signIn(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // Validate input
  try {
    loginSchema.parse({ email, password })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: "Invalid input" }
  }

  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: error.message }
    }

    // Get user role
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { error: "Authentication failed" }
    }

    const { data: adminData } = await supabase.from("admins").select("*").eq("id", session.user.id).single()

    if (adminData) {
      return { success: true, role: "admin" }
    }

    // Check for examiner profile
    const { data: examinerData } = await supabase.from("examiners").select("*").eq("id", session.user.id).single()

    if (examinerData) {
      return { success: true, role: "examiner" }
    }

    // If no examiner profile but user has examiner metadata, create profile
    const { data: userData } = await supabase.auth.getUser()

    if (userData?.user?.user_metadata?.role === "examiner" && userData?.user?.user_metadata?.full_name) {
      // Create examiner profile from metadata
      const { error: profileError } = await supabase.from("examiners").insert({
        id: session.user.id,
        full_name: userData.user.user_metadata.full_name,
        age: userData.user.user_metadata.age || 25,
        date_deployed: userData.user.user_metadata.date_deployed || new Date().toISOString().split("T")[0],
        designation: userData.user.user_metadata.designation || "Staff",
        store_area: userData.user.user_metadata.store_area || "Main Branch",
      })

      if (!profileError) {
        return { success: true, role: "examiner" }
      }
    }

    // User exists but has no role
    return { error: "User account exists but has no assigned role" }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

// Signup action for examiners
export async function signUp(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string
  const full_name = formData.get("full_name") as string
  const age = Number.parseInt(formData.get("age") as string)
  const date_deployed = formData.get("date_deployed") as string
  const designation = formData.get("designation") as string
  const store_area = formData.get("store_area") as string

  // Validate input
  try {
    signupSchema.parse({
      email,
      password,
      confirmPassword,
      full_name,
      age,
      date_deployed,
      designation,
      store_area,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: "Invalid input" }
  }

  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    // Create user account with metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          age,
          date_deployed,
          designation,
          store_area,
          role: "examiner",
        },
      },
    })

    if (authError) {
      console.error("Auth error:", authError)
      return { error: authError.message }
    }

    if (!authData.user) {
      return { error: "Failed to create user account" }
    }

    // Add examiner profile
    const { error: profileError } = await supabase.from("examiners").insert({
      id: authData.user.id,
      full_name,
      age,
      date_deployed,
      designation,
      store_area,
    })

    if (profileError) {
      console.error("Profile creation error:", profileError)
      return { error: `Failed to create examiner profile: ${profileError.message}` }
    }

    return { success: "Account created successfully. Please check your email to confirm your account." }
  } catch (error) {
    console.error("Sign up error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

// Sign out action
export async function signOut() {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  await supabase.auth.signOut()
  redirect("/auth/login")
}

// Create admin account (to be used by existing admins only)
export async function createAdmin(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // Validate input
  try {
    loginSchema.parse({ email, password })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: "Invalid input" }
  }

  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    // Check if current user is an admin
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { error: "Authentication required" }
    }

    const { data: adminData } = await supabase.from("admins").select("*").eq("id", session.user.id).single()

    if (!adminData) {
      return { error: "Only existing admins can create new admin accounts" }
    }

    // Create new admin account
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: "admin",
      },
    })

    if (authError) {
      return { error: authError.message }
    }

    if (!authData.user) {
      return { error: "Failed to create admin account" }
    }

    // Add admin profile
    const { error: profileError } = await supabase.from("admins").insert({
      id: authData.user.id,
      role: "admin",
    })

    if (profileError) {
      return { error: profileError.message }
    }

    return { success: "Admin account created successfully." }
  } catch (error) {
    console.error("Create admin error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function updateExaminerProfile(prevState: any, formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { error: "Not authenticated" }
    }

    const full_name = formData.get("full_name") as string
    const age = parseInt(formData.get("age") as string)
    const designation = formData.get("designation") as string
    const store_area = formData.get("store_area") as string
    const date_deployed = formData.get("date_deployed") as string

    const { error } = await supabase
      .from("examiners")
      .update({
        full_name,
        age,
        designation,
        store_area,
        date_deployed,
      })
      .eq("id", session.user.id)

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Profile update error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

// Exam Settings Actions
export async function updateExamSettings(prevState: any, formData: FormData) {
  const supabase = createServerActionClient({ cookies: () => cookies() })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return { error: "Not authenticated" }
  }

  // Check if user is admin
  const { data: admin } = await supabase
    .from("admins")
    .select("*")
    .eq("id", session.user.id)
    .single()

  if (!admin) {
    return { error: "Not authorized" }
  }

  const defaultTime = formData.get("defaultTime") as string
  const warningTime = formData.get("warningTime") as string
  const autoSubmit = formData.get("autoSubmit") === "true"

  const { error } = await supabase
    .from("exam_settings")
    .upsert({
      id: 1, // Using a single row for global settings
      default_time: parseInt(defaultTime),
      warning_time: parseInt(warningTime),
      auto_submit: autoSubmit,
      updated_by: session.user.id
    })

  if (error) {
    return { error: "Failed to update exam settings" }
  }

  return { success: "Exam settings updated successfully" }
}

// Examiner Approval Actions
export async function approveExaminer(prevState: any, formData: FormData) {
  const supabase = createServerActionClient({ cookies: () => cookies() })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return { error: "Not authenticated" }
  }

  // Check if user is admin
  const { data: admin } = await supabase
    .from("admins")
    .select("*")
    .eq("id", session.user.id)
    .single()

  if (!admin) {
    return { error: "Not authorized" }
  }

  const examinerId = formData.get("examinerId") as string
  const status = formData.get("status") as "approved" | "rejected"

  const { error } = await supabase
    .from("examiners")
    .upsert({
      id: examinerId,
      status,
      approved_by: session.user.id,
      approved_at: new Date().toISOString()
    })

  if (error) {
    return { error: "Failed to update examiner status" }
  }

  return { success: `Examiner ${status} successfully` }
}

// Enhanced Admin Management
export async function updateAdminRole(prevState: any, formData: FormData) {
  const supabase = createServerActionClient({ cookies: () => cookies() })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return { error: "Not authenticated" }
  }

  // Check if user is super admin
  const { data: admin } = await supabase
    .from("admins")
    .select("*")
    .eq("id", session.user.id)
    .single()

  if (!admin || admin.role !== "super_admin") {
    return { error: "Not authorized" }
  }

  const adminId = formData.get("adminId") as string
  const role = formData.get("role") as "admin" | "super_admin"

  const { error } = await supabase
    .from("admins")
    .upsert({
      id: adminId,
      role,
      updated_by: session.user.id,
      updated_at: new Date().toISOString()
    })

  if (error) {
    return { error: "Failed to update admin role" }
  }

  return { success: "Admin role updated successfully" }
}
