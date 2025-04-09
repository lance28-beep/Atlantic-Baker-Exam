"use client"

import { useState } from "react"
import { useFormState } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { updateExamSettings } from "@/lib/actions"

type ExamSettingsState = {
  error?: string;
  success?: string;
}

export default function ExamSettingsForm({ initialSettings }: { initialSettings: any }) {
  const [state, formAction] = useFormState(updateExamSettings, {})

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
        <Label htmlFor="defaultTime">Default Exam Time (minutes)</Label>
        <Input
          id="defaultTime"
          name="defaultTime"
          type="number"
          defaultValue={initialSettings?.default_time || 60}
          min="1"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="warningTime">Warning Time (minutes before end)</Label>
        <Input
          id="warningTime"
          name="warningTime"
          type="number"
          defaultValue={initialSettings?.warning_time || 5}
          min="1"
          required
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="autoSubmit"
          name="autoSubmit"
          defaultChecked={initialSettings?.auto_submit || false}
        />
        <Label htmlFor="autoSubmit">Auto-submit when time expires</Label>
      </div>

      <Button type="submit">Save Exam Settings</Button>
    </form>
  )
} 