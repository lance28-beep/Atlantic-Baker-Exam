"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import type { Question } from "@/types"
import { supabase } from "@/lib/supabase/client"
import { Loader2, ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { use } from "react"

export default function ExamContinuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [markedForReview, setMarkedForReview] = useState<string[]>([])
  const [timeRemaining, setTimeRemaining] = useState(30 * 60) // 30 minutes in seconds
  const [examStarted, setExamStarted] = useState(false)

  // Format time remaining
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Initialize exam
  useEffect(() => {
    const initExam = async () => {
      try {
        // Get exam attempt
        const { data: examAttempt, error: attemptError } = await supabase
          .from("exam_attempts")
          .select("*")
          .eq("id", id)
          .single()

        if (attemptError) {
          throw new Error(`Error fetching exam attempt: ${attemptError.message}`)
        }

        if (!examAttempt) {
          throw new Error("Exam attempt not found")
        }

        // Check if exam is already completed
        if (examAttempt.completed_at) {
          router.push(`/exam/results/${id}`)
          return
        }

        // Get questions for this exam
        const questionIds = Object.keys(examAttempt.answers)
        const { data: questionData, error: questionError } = await supabase
          .from("questions")
          .select("*")
          .in("id", questionIds)

        if (questionError) {
          throw new Error(`Error fetching questions: ${questionError.message}`)
        }

        if (!questionData || questionData.length === 0) {
          throw new Error("No questions found for this exam")
        }

        setQuestions(questionData)
        setAnswers(examAttempt.answers)
        setExamStarted(true)

        // Calculate remaining time
        const startTime = new Date(examAttempt.started_at).getTime()
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000)
        const remainingTime = Math.max(30 * 60 - elapsedSeconds, 0)
        setTimeRemaining(remainingTime)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    initExam()
  }, [id, router])

  // Timer effect
  useEffect(() => {
    if (!examStarted) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmitExam()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [examStarted])

  // Save answers when they change
  useEffect(() => {
    const saveAnswers = async () => {
      await supabase.from("exam_attempts").update({ answers }).eq("id", id)
    }

    if (Object.keys(answers).length > 0) {
      saveAnswers()
    }
  }, [answers, id])

  // Handle answer change
  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  // Handle marking for review
  const toggleMarkForReview = (questionId: string) => {
    setMarkedForReview((prev) => {
      if (prev.includes(questionId)) {
        return prev.filter((id) => id !== questionId)
      } else {
        return [...prev, questionId]
      }
    })
  }

  // Navigation
  const goToNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const goToPrevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index)
    }
  }

  // Submit exam
  const handleSubmitExam = async () => {
    try {
      setLoading(true)

      // Calculate score
      let score = 0
      questions.forEach((question) => {
        const userAnswer = answers[question.id]
        const correctAnswer = question.correct_answer

        if (question.question_type === "multiple_choice") {
          if (userAnswer === correctAnswer) {
            score++
          }
        } else if (question.question_type === "true_false") {
          if (userAnswer === correctAnswer) {
            score++
          }
        } else if (question.question_type === "fill_in_blank") {
          if (userAnswer && correctAnswer && userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()) {
            score++
          }
        }
        // Essay questions are scored manually
      })

      // Update exam attempt
      await supabase
        .from("exam_attempts")
        .update({
          score,
          answers,
          completed_at: new Date().toISOString(),
          time_taken: 30 * 60 - timeRemaining,
        })
        .eq("id", id)

      // Redirect to results page
      router.push(`/exam/results/${id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading exam...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
              <p className="mb-6">{error}</p>
              <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">No Questions Available</h2>
              <p className="mb-6">There are no questions available for this exam.</p>
              <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Timer */}
      <div className="timer-container">
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2 text-primary" />
          <span className={`font-mono ${timeRemaining < 60 ? "text-red-500" : ""}`}>{formatTime(timeRemaining)}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(((currentIndex + 1) / questions.length) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-primary h-2.5 rounded-full"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question navigation */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap gap-2">
        {questions.map((q, index) => (
          <button
            key={q.id}
            onClick={() => goToQuestion(index)}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm
              ${
                currentIndex === index
                  ? "bg-primary text-white"
                  : answers[q.id]
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
              }
              ${markedForReview.includes(q.id) ? "ring-2 ring-yellow-400" : ""}
            `}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Current question */}
      <Card className="max-w-4xl mx-auto">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-bold">{currentQuestion.question_text}</h2>
              <button
                onClick={() => toggleMarkForReview(currentQuestion.id)}
                className={`px-3 py-1 text-xs rounded-full ${
                  markedForReview.includes(currentQuestion.id)
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {markedForReview.includes(currentQuestion.id) ? "Marked for Review" : "Mark for Review"}
              </button>
            </div>

            {currentQuestion.image_url && (
              <div className="my-4">
                <img
                  src={currentQuestion.image_url || "/placeholder.svg"}
                  alt="Question"
                  className="max-h-60 object-contain mx-auto rounded-lg border"
                />
              </div>
            )}

            {/* Question type specific answer input */}
            {currentQuestion.question_type === "multiple_choice" && (
              <RadioGroup
                value={answers[currentQuestion.id] || ""}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                className="space-y-3"
              >
                {currentQuestion.options.map((option: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="text-base">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.question_type === "true_false" && (
              <RadioGroup
                value={answers[currentQuestion.id]?.toString() || ""}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value === "true")}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="true" />
                  <Label htmlFor="true" className="text-base">
                    True
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="false" />
                  <Label htmlFor="false" className="text-base">
                    False
                  </Label>
                </div>
              </RadioGroup>
            )}

            {currentQuestion.question_type === "fill_in_blank" && (
              <Input
                type="text"
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                placeholder="Type your answer here..."
              />
            )}

            {currentQuestion.question_type === "essay" && (
              <Textarea
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                placeholder="Type your answer here..."
                rows={6}
              />
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={goToPrevQuestion} disabled={currentIndex === 0}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentIndex === questions.length - 1 ? (
                <Button className="bg-primary hover:bg-primary/90" onClick={handleSubmitExam}>
                  Submit Exam
                </Button>
              ) : (
                <Button variant="outline" onClick={goToNextQuestion}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 