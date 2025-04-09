"use client"

import { useState, useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createAdmin } from "@/lib/actions"
import { Eye, EyeOff } from "lucide-react"

type AdminFormState = {
  error?: string;
  success?: string;
}

export default function AdminAuthForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [state, formAction] = useActionState<AdminFormState, FormData>(createAdmin, {})

  return (
    <form action={formAction} className="space-y-4">
      {(state.error || state.success) && (
        <div className={`p-3 rounded ${
          state.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {state.success || state.error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Enter email address"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <Button type="submit">Authorize New Admin</Button>
    </form>
  )
} 