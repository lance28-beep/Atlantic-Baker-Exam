"use client"

import { useState } from "react"
import { useFormState } from "react-dom"
import { Button } from "@/components/ui/button"
import { approveExaminer } from "@/lib/actions"

type ExaminerApprovalState = {
  error?: string;
  success?: string;
}

type Examiner = {
  id: string;
  email: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export default function ExaminerApprovalList({ examiners }: { examiners: Examiner[] }) {
  const [state, formAction] = useFormState(approveExaminer, {})

  return (
    <div className="space-y-4">
      {(state.error || state.success) && (
        <div className={`p-3 rounded ${
          state.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {state.success || state.error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Email</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Requested On</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {examiners?.map((examiner) => (
              <tr key={examiner.id} className="border-b">
                <td className="py-3 px-4">{examiner.email}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    examiner.status === "approved" ? "bg-green-100 text-green-800" :
                    examiner.status === "rejected" ? "bg-red-100 text-red-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {examiner.status ? examiner.status.charAt(0).toUpperCase() + examiner.status.slice(1) : "Pending"}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {examiner.created_at ? new Date(examiner.created_at).toLocaleDateString() : "N/A"}
                </td>
                <td className="py-3 px-4 space-x-2">
                  {(!examiner.status || examiner.status === "pending") && (
                    <>
                      <form action={formAction} className="inline">
                        <input type="hidden" name="examinerId" value={examiner.id} />
                        <input type="hidden" name="status" value="approved" />
                        <Button type="submit" variant="outline" size="sm">
                          Approve
                        </Button>
                      </form>
                      <form action={formAction} className="inline">
                        <input type="hidden" name="examinerId" value={examiner.id} />
                        <input type="hidden" name="status" value="rejected" />
                        <Button type="submit" variant="outline" size="sm" className="text-red-600">
                          Reject
                        </Button>
                      </form>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 