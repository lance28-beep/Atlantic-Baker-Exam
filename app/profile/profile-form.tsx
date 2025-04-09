"use client"

import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CardContent, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { updateExaminerProfile } from "@/lib/actions"
import { useState } from "react"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Saving..." : "Save Changes"}
    </Button>
  )
}

export default function ProfileForm({ examiner, email }: { examiner: any; email: string }) {
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  async function handleSubmit(formData: FormData) {
    try {
      const result = await updateExaminerProfile(null, formData)
      
      if (result?.error) {
        setErrorMessage(result.error)
        setShowError(true)
        setTimeout(() => setShowError(false), 3000)
      } else {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred. Please try again.")
      setShowError(true)
      setTimeout(() => setShowError(false), 3000)
    }
  }

  return (
    <form action={handleSubmit}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={email} readOnly className="bg-gray-50" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name</Label>
          <Input id="full_name" name="full_name" defaultValue={examiner.full_name} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input id="age" name="age" type="number" defaultValue={examiner.age} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="designation">Designation</Label>
          <Input id="designation" name="designation" defaultValue={examiner.designation} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="store_area">Branch/Store Area</Label>
          <Input id="store_area" name="store_area" defaultValue={examiner.store_area} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date_deployed">Date Deployed</Label>
          <Input
            id="date_deployed"
            name="date_deployed"
            type="date"
            defaultValue={examiner.date_deployed}
            required
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <SubmitButton />
        {showSuccess && (
          <Alert>
            <AlertDescription>Profile updated successfully!</AlertDescription>
          </Alert>
        )}
        {showError && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
      </CardFooter>
    </form>
  )
} 