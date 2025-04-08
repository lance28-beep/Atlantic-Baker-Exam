import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Create user with admin role in metadata
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: "admin",
      },
    })

    if (userError) {
      console.error("Error creating user:", userError)
      return NextResponse.json({ error: userError.message }, { status: 400 })
    }

    if (!userData.user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    // Add admin role
    const { error: adminError } = await supabase.from("admins").insert({
      id: userData.user.id,
      role: "admin",
    })

    if (adminError) {
      console.error("Error creating admin record:", adminError)
      return NextResponse.json({ error: adminError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      user: {
        id: userData.user.id,
        email: userData.user.email,
      },
    })
  } catch (error) {
    console.error("Error creating admin:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
