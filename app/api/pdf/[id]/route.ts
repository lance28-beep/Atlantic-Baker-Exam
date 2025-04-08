import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { PDFDocument, rgb, StandardFonts, PDFPage } from "pdf-lib"
import fs from "fs"
import path from "path"

// Constants for PDF styling
const PDF_CONSTANTS = {
  PAGE_SIZE: [595.28, 841.89] as [number, number], // A4 size
  MARGIN: 50,
  HEADER_HEIGHT: 100,
  FOOTER_HEIGHT: 50,
  LINE_SPACING: 25,
  SECTION_SPACING: 30,
  FONT_SIZES: {
    TITLE: 16,
    HEADING: 14,
    BODY: 12,
    FOOTER: 10
  },
  COLORS: {
    BLACK: rgb(0, 0, 0),
    WHITE: rgb(1, 1, 1),
    GREEN: rgb(0, 0.5, 0),
    RED: rgb(0.8, 0, 0),
    LIGHT_GRAY: rgb(0.97, 0.97, 0.97)
  },
  PASSING_SCORE: 70
}

// Types for better type safety
interface Examiner {
  full_name: string;
  designation: string;
  store_area: string;
}

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options?: string[];
  correct_answer: string | number;
}

interface ExamAttempt {
  id: string;
  user_id: string;
  exam_type: string;
  score: number;
  total_questions: number;
  answers: Record<string, string | number>;
  completed_at?: string;
  started_at: string;
}

// Helper functions for PDF generation
const createHeader = async (page: PDFPage, pdfDoc: PDFDocument, width: number, height: number) => {
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)
  const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)
   
  // Read and embed the header image
  try {
    const headerPath = path.join(process.cwd(), 'public', 'pdf-header.png')
    const headerImage = await pdfDoc.embedPng(fs.readFileSync(headerPath))
    
    // Scale the header image to fit the width of the page with margins
    const scaleFactor = (width - (PDF_CONSTANTS.MARGIN * 2)) / headerImage.width
    const scaledDims = headerImage.scale(scaleFactor)

    // Draw the header image centered at the top of the page
    page.drawImage(headerImage, {
      x: PDF_CONSTANTS.MARGIN,
      y: height - scaledDims.height - 30,
      width: scaledDims.width,
      height: scaledDims.height,
    })
  } catch (error) {
    console.error("Error loading header image:", error)
    // Continue without header if image fails to load
  }

  // Add green line separator
  page.drawLine({
    start: { x: PDF_CONSTANTS.MARGIN, y: height - PDF_CONSTANTS.HEADER_HEIGHT },
    end: { x: width - PDF_CONSTANTS.MARGIN, y: height - PDF_CONSTANTS.HEADER_HEIGHT },
    thickness: 1,
    color: PDF_CONSTANTS.COLORS.GREEN,
  })
   
  return { timesRomanFont, timesRomanBoldFont }
}

const createFooter = (page: PDFPage, width: number, timesRomanFont: any) => {
  // Add footer line
  page.drawLine({
    start: { x: PDF_CONSTANTS.MARGIN, y: PDF_CONSTANTS.FOOTER_HEIGHT },
    end: { x: width - PDF_CONSTANTS.MARGIN, y: PDF_CONSTANTS.FOOTER_HEIGHT },
    thickness: 1,
    color: PDF_CONSTANTS.COLORS.GREEN,
  })

  // Add footer text
  page.drawText("Atlantic Bakery Exam System", {
    x: width / 2 - 80,
    y: 15,
    size: PDF_CONSTANTS.FONT_SIZES.FOOTER,
    font: timesRomanFont,
    color: PDF_CONSTANTS.COLORS.BLACK,
  })
}

const addExamInformation = (
  page: PDFPage, 
  currentY: number, 
  examiner: Examiner | null, 
  examAttempt: ExamAttempt, 
  timesRomanFont: any, 
  timesRomanBoldFont: any
) => {
  // Exam Information section
  page.drawText("Exam Information", {
    x: PDF_CONSTANTS.MARGIN,
    y: currentY,
    size: PDF_CONSTANTS.FONT_SIZES.HEADING,
    font: timesRomanBoldFont,
    color: PDF_CONSTANTS.COLORS.BLACK,
  })

  let newY = currentY - PDF_CONSTANTS.LINE_SPACING

  // Examiner details
  page.drawText(`Examiner: ${examiner?.full_name || 'N/A'}`, {
    x: PDF_CONSTANTS.MARGIN,
    y: newY,
    size: PDF_CONSTANTS.FONT_SIZES.BODY,
    font: timesRomanFont,
    color: PDF_CONSTANTS.COLORS.BLACK,
  })
  newY -= PDF_CONSTANTS.LINE_SPACING

  page.drawText(`Designation: ${examiner?.designation || 'N/A'}`, {
    x: PDF_CONSTANTS.MARGIN,
    y: newY,
    size: PDF_CONSTANTS.FONT_SIZES.BODY,
    font: timesRomanFont,
    color: PDF_CONSTANTS.COLORS.BLACK,
  })
  newY -= PDF_CONSTANTS.LINE_SPACING

  page.drawText(`Store Area: ${examiner?.store_area || 'N/A'}`, {
    x: PDF_CONSTANTS.MARGIN,
    y: newY,
    size: PDF_CONSTANTS.FONT_SIZES.BODY,
    font: timesRomanFont,
    color: PDF_CONSTANTS.COLORS.BLACK,
  })
  newY -= PDF_CONSTANTS.LINE_SPACING

  page.drawText(`Exam Type: ${examAttempt.exam_type}`, {
    x: PDF_CONSTANTS.MARGIN,
    y: newY,
    size: PDF_CONSTANTS.FONT_SIZES.BODY,
    font: timesRomanFont,
    color: PDF_CONSTANTS.COLORS.BLACK,
  })
  newY -= PDF_CONSTANTS.LINE_SPACING

  const dateTaken = new Date(examAttempt.completed_at || examAttempt.started_at).toLocaleDateString()
  page.drawText(`Date Taken: ${dateTaken}`, {
    x: PDF_CONSTANTS.MARGIN,
    y: newY,
    size: PDF_CONSTANTS.FONT_SIZES.BODY,
    font: timesRomanFont,
    color: PDF_CONSTANTS.COLORS.BLACK,
  })
  
  return newY - PDF_CONSTANTS.SECTION_SPACING
}

const addScoreSummary = (
  page: PDFPage, 
  currentY: number, 
  examAttempt: ExamAttempt, 
  timesRomanFont: any, 
  timesRomanBoldFont: any,
  width: number
) => {
  // Score Summary section
  page.drawText("Score Summary", {
    x: PDF_CONSTANTS.MARGIN,
    y: currentY,
    size: PDF_CONSTANTS.FONT_SIZES.HEADING,
    font: timesRomanBoldFont,
    color: PDF_CONSTANTS.COLORS.BLACK,
  })
   
  let newY = currentY - PDF_CONSTANTS.LINE_SPACING

  const score = examAttempt.score
  const totalQuestions = examAttempt.total_questions
  const percentage = Math.round((score / totalQuestions) * 100)
  const passed = percentage >= PDF_CONSTANTS.PASSING_SCORE

  // Score information
  page.drawText(`Score: ${score}/${totalQuestions}`, {
    x: PDF_CONSTANTS.MARGIN,
    y: newY - 15,
    size: PDF_CONSTANTS.FONT_SIZES.BODY,
    font: timesRomanFont,
    color: PDF_CONSTANTS.COLORS.BLACK,
  })

  page.drawText(`Percentage: ${percentage}%`, {
    x: PDF_CONSTANTS.MARGIN + 200,
    y: newY - 15,
    size: PDF_CONSTANTS.FONT_SIZES.BODY,
    font: timesRomanFont,
    color: PDF_CONSTANTS.COLORS.BLACK,
  })

  // Result text
  page.drawText(passed ? "PASSED" : "FAILED", {
    x: width - 200,
    y: newY - 15,
    size: PDF_CONSTANTS.FONT_SIZES.HEADING,
    font: timesRomanBoldFont,
    color: passed ? PDF_CONSTANTS.COLORS.GREEN : PDF_CONSTANTS.COLORS.RED,
  })

  return newY - 50 // Reduced spacing since we removed the box
}

const addQuestionReview = (
  pdfDoc: PDFDocument,
  page: PDFPage,
  currentY: number,
  questions: Question[],
  examAttempt: ExamAttempt,
  timesRomanFont: any,
  timesRomanBoldFont: any,
  width: number
) => {
  // Question Review section
  page.drawText("Question Review", {
    x: PDF_CONSTANTS.MARGIN,
    y: currentY,
    size: PDF_CONSTANTS.FONT_SIZES.HEADING,
    font: timesRomanBoldFont,
    color: PDF_CONSTANTS.COLORS.BLACK,
  })
   
  let newY = currentY - PDF_CONSTANTS.LINE_SPACING
  let currentPage = page

  // Add questions with proper spacing
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i]
    const userAnswer = examAttempt.answers[question.id]

    // Check if we need a new page
    if (newY < 100) {
      currentPage = pdfDoc.addPage(PDF_CONSTANTS.PAGE_SIZE)
      newY = currentPage.getSize().height - 50
    }

    // Question
    currentPage.drawText(`Question ${i + 1}: ${question.question_text}`, {
      x: PDF_CONSTANTS.MARGIN,
      y: newY,
      size: PDF_CONSTANTS.FONT_SIZES.BODY,
      font: timesRomanBoldFont,
      color: PDF_CONSTANTS.COLORS.BLACK,
    })

    // User Answer
    const userAnswerText = question.question_type === "multiple_choice" 
      ? question.options?.[Number(userAnswer)] || "Invalid option"
      : userAnswer?.toString() || "No answer"

    currentPage.drawText(`Your Answer: ${userAnswerText}`, {
      x: PDF_CONSTANTS.MARGIN,
      y: newY - 20,
      size: PDF_CONSTANTS.FONT_SIZES.BODY,
      font: timesRomanFont,
      color: PDF_CONSTANTS.COLORS.BLACK,
    })

    // Correct Answer
    if (question.question_type !== "essay") {
      const correctAnswerText = question.question_type === "multiple_choice"
        ? question.options?.[Number(question.correct_answer)] || "Invalid option"
        : question.correct_answer?.toString()

      currentPage.drawText(`Correct Answer: ${correctAnswerText}`, {
        x: PDF_CONSTANTS.MARGIN,
        y: newY - 40,
        size: PDF_CONSTANTS.FONT_SIZES.BODY,
        font: timesRomanFont,
        color: PDF_CONSTANTS.COLORS.BLACK,
      })
    }

    newY -= 70 // Reduced spacing between questions since we removed the box
  }
   
  return currentPage
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get exam attempt
    console.log("Fetching exam attempt with ID:", params.id)
    
    const { data: examAttempt, error: examError } = await supabase
      .from("exam_attempts")
      .select("*")
      .eq("id", params.id)
      .single()

    if (examError) {
      console.error("Error fetching exam attempt:", examError)
      console.error("Error details:", {
        code: examError.code,
        message: examError.message,
        details: examError.details,
        hint: examError.hint
      })
      return new NextResponse(`Error fetching exam attempt: ${examError.message}`, { status: 500 })
    }

    if (!examAttempt) {
      console.error("Exam attempt not found for ID:", params.id)
      return new NextResponse("Exam attempt not found", { status: 404 })
    }

    console.log("Successfully fetched exam attempt:", {
      id: examAttempt.id,
      user_id: examAttempt.user_id
    })

    // Check if user is authorized to view this result
    if (examAttempt.user_id !== session.user.id) {
      // Check if user is admin
      const { data: admin } = await supabase.from("admins").select("*").eq("id", session.user.id).single()

      if (!admin) {
        return new NextResponse("Unauthorized", { status: 401 })
      }
    }

    // Get examiner data separately
    const { data: examiner, error: examinerError } = await supabase
      .from("examiners")
      .select("full_name, designation, store_area")
      .eq("id", examAttempt.user_id)
      .single()

    if (examinerError) {
      console.error("Error fetching examiner data:", examinerError)
      // Continue without examiner data
    }

    // Get questions for this exam
    const questionIds = Object.keys(examAttempt.answers)
    const { data: questions, error: questionsError } = await supabase.from("questions").select("*").in("id", questionIds)

    if (questionsError) {
      console.error("Error fetching questions:", questionsError)
      return new NextResponse("Error fetching questions", { status: 500 })
    }

    if (!questions) {
      return new NextResponse("Questions not found", { status: 404 })
    }

    // Create PDF document
    const pdfDoc = await PDFDocument.create()
    
    // Add first page
    const page = pdfDoc.addPage(PDF_CONSTANTS.PAGE_SIZE)
    const { width, height } = page.getSize()

    // Create header and get fonts
    const { timesRomanFont, timesRomanBoldFont } = await createHeader(page, pdfDoc, width, height)

    // Add exam info in a structured layout
    const mainStartY = height - 140
    let currentY = mainStartY

    // Add exam information
    currentY = addExamInformation(page, currentY, examiner, examAttempt, timesRomanFont, timesRomanBoldFont)
    
    // Add score summary
    currentY = addScoreSummary(page, currentY, examAttempt, timesRomanFont, timesRomanBoldFont, width)
    
    // Add question review
    const lastPage = addQuestionReview(
      pdfDoc, 
      page, 
      currentY, 
      questions, 
      examAttempt, 
      timesRomanFont, 
      timesRomanBoldFont, 
      width
    )
    
    // Add footer to all pages
    const pages = pdfDoc.getPages()
    for (let i = 0; i < pages.length; i++) {
      createFooter(pages[i], width, timesRomanFont)
    }

    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save()

    // Return the PDF
    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="exam-results-${params.id}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return new NextResponse("Error generating PDF", { status: 500 })
  }
}
