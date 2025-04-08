"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Plus, Trash2 } from "lucide-react"
import type { ExamType, Question, QuestionType } from "@/types"
import { supabase } from "@/lib/supabase/client"

interface QuestionFormProps {
  initialData?: Question
  mode: "create" | "edit"
}

export default function QuestionForm({ initialData, mode }: QuestionFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [examType, setExamType] = useState<ExamType>(initialData?.exam_type || "SAP")
  const [questionType, setQuestionType] = useState<QuestionType>(initialData?.question_type || "multiple_choice")
  const [questionText, setQuestionText] = useState(initialData?.question_text || "")
  const [options, setOptions] = useState<string[]>(initialData?.options || ["", "", "", ""])
  const [correctAnswer, setCorrectAnswer] = useState<any>(initialData?.correct_answer || "")
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || "")
  const [imageFile, setImageFile] = useState<File | null>(null)

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validate form
      if (!questionText.trim()) {
        throw new Error("Question text is required")
      }

      if (questionType === "multiple_choice" && options.some((opt) => !opt.trim())) {
        throw new Error("All options must be filled")
      }

      if (questionType === "multiple_choice" && !correctAnswer) {
        throw new Error("Correct answer must be selected")
      }

      // Upload image if provided
      let finalImageUrl = imageUrl
      if (imageFile) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("question-images")
          .upload(`${Date.now()}-${imageFile.name}`, imageFile)

        if (uploadError) {
          throw new Error(`Error uploading image: ${uploadError.message}`)
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("question-images").getPublicUrl(uploadData.path)

        finalImageUrl = publicUrl
      }

      // Prepare question data
      const questionData = {
        exam_type: examType,
        question_type: questionType,
        question_text: questionText,
        options: questionType === "multiple_choice" ? options : null,
        correct_answer: correctAnswer,
        image_url: finalImageUrl,
      }

      // Save to database
      if (mode === "create") {
        const { error: insertError } = await supabase.from("questions").insert(questionData)

        if (insertError) {
          throw new Error(`Error creating question: ${insertError.message}`)
        }
      } else {
        const { error: updateError } = await supabase.from("questions").update(questionData).eq("id", initialData?.id)

        if (updateError) {
          throw new Error(`Error updating question: ${updateError.message}`)
        }
      }

      // Redirect back to questions page
      router.push("/admin/questions")
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle adding/removing options
  const addOption = () => {
    setOptions([...options, ""])
  }

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index))
  }

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="bg-red-500/10 border border-red-500/50 text-red-700 px-4 py-3 rounded">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="exam-type">Exam Type</Label>
          <Select value={examType} onValueChange={(value) => setExamType(value as ExamType)}>
            <SelectTrigger id="exam-type">
              <SelectValue placeholder="Select exam type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SAP">SAP</SelectItem>
              <SelectItem value="Management Trainee">Management Trainee</SelectItem>
              <SelectItem value="Sales">Sales</SelectItem>
              <SelectItem value="QC">QC</SelectItem>
              <SelectItem value="Production">Production</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="question-type">Question Type</Label>
          <Select value={questionType} onValueChange={(value) => setQuestionType(value as QuestionType)}>
            <SelectTrigger id="question-type">
              <SelectValue placeholder="Select question type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
              <SelectItem value="essay">Essay</SelectItem>
              <SelectItem value="true_false">True/False</SelectItem>
              <SelectItem value="fill_in_blank">Fill in the Blank</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="question-text">Question Text</Label>
        <Textarea
          id="question-text"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Enter the question text"
          className="min-h-[100px]"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Question Image (Optional)</Label>
        <Input id="image" type="file" accept="image/*" onChange={handleImageChange} />
        {(imageUrl || imageFile) && (
          <div className="mt-2">
            <p className="text-sm text-gray-500 mb-2">Image Preview:</p>
            <img
              src={imageFile ? URL.createObjectURL(imageFile) : imageUrl}
              alt="Question"
              className="h-40 object-contain border rounded"
            />
          </div>
        )}
      </div>

      {questionType === "multiple_choice" && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Options</h3>
                <Button type="button" variant="outline" size="sm" onClick={addOption}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Option
                </Button>
              </div>

              {options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroup
                    value={correctAnswer === index.toString() ? index.toString() : ""}
                    onValueChange={(value) => setCorrectAnswer(value)}
                    className="flex items-center space-x-2"
                  >
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  </RadioGroup>
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...options]
                      newOptions[index] = e.target.value
                      setOptions(newOptions)
                    }}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(index)}
                    disabled={options.length <= 2}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {questionType === "true_false" && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h3 className="font-medium">Correct Answer</h3>
              <RadioGroup
                value={correctAnswer === true ? "true" : "false"}
                onValueChange={(value) => setCorrectAnswer(value === "true")}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="true" />
                  <Label htmlFor="true">True</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="false" />
                  <Label htmlFor="false">False</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
      )}

      {questionType === "fill_in_blank" && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label htmlFor="correct-answer">Correct Answer</Label>
              <Input
                id="correct-answer"
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                placeholder="Enter the correct answer"
                required
              />
            </div>
          </CardContent>
        </Card>
      )}

      {questionType === "essay" && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label htmlFor="model-answer">Model Answer (Optional)</Label>
              <Textarea
                id="model-answer"
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                placeholder="Enter a model answer for reference"
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/questions")}>
          Cancel
        </Button>
        <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {mode === "create" ? "Creating..." : "Updating..."}
            </>
          ) : mode === "create" ? (
            "Create Question"
          ) : (
            "Update Question"
          )}
        </Button>
      </div>
    </form>
  )
}
