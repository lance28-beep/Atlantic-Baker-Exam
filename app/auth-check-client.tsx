"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AuthCheckClient() {
  const router = useRouter()

  useEffect(() => {
    // This is a client-side placeholder for the server-side AuthCheck
    // The actual auth check will be handled by the server component
    // This component is just to satisfy the client component requirements
  }, [])

  return null
} 