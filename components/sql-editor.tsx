"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Play } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

export default function SQLEditor() {
  const [query, setQuery] = useState("")
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [savedQueries, setSavedQueries] = useState<{ name: string; query: string }[]>([
    {
      name: "Get All Questions",
      query: "SELECT * FROM questions LIMIT 100;",
    },
    {
      name: "Get Questions by Exam Type",
      query: "SELECT * FROM questions WHERE exam_type = 'SAP' LIMIT 100;",
    },
    {
      name: "Insert Multiple Choice Question",
      query: `INSERT INTO questions (exam_type, question_type, question_text, options, correct_answer)
VALUES (
  'SAP',
  'multiple_choice',
  'What is the primary function of SAP ERP?',
  '["Enterprise resource planning", "Customer relationship management", "Supply chain management", "Business intelligence"]',
  '0'
);`,
    },
    {
      name: "Insert True/False Question",
      query: `INSERT INTO questions (exam_type, question_type, question_text, correct_answer)
VALUES (
  'Management Trainee',
  'true_false',
  'A good manager always prioritizes tasks based on urgency and importance.',
  true
);`,
    },
    {
      name: "Insert Fill in Blank Question",
      query: `INSERT INTO questions (exam_type, question_type, question_text, correct_answer)
VALUES (
  'Sales',
  'fill_in_blank',
  'The process of identifying potential customers is called ________.',
  'prospecting'
);`,
    },
    {
      name: "Insert Essay Question",
      query: `INSERT INTO questions (exam_type, question_type, question_text, correct_answer)
VALUES (
  'QC',
  'essay',
  'Explain the importance of quality control in a bakery production environment.',
  'A comprehensive answer should discuss food safety, consistency, customer satisfaction, and regulatory compliance.'
);`,
    },
    {
      name: "Update Question",
      query: "UPDATE questions SET question_text = 'Updated question text' WHERE id = 'question-id-here';",
    },
    {
      name: "Delete Question",
      query: "DELETE FROM questions WHERE id = 'question-id-here';",
    },
    {
      name: "Create Examiner Profile",
      query: `INSERT INTO examiners (id, full_name, age, date_deployed, designation, store_area)
VALUES (
  'user-id-here',
  'John Doe',
  30,
  '2023-01-01',
  'Sales Associate',
  'Main Branch'
);`,
    },
  ])

  const executeQuery = async () => {
    if (!query.trim()) {
      setError("Query cannot be empty")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // Determine if it's a SELECT query or a modification query
      const isSelectQuery = query.trim().toLowerCase().startsWith("select")

      if (isSelectQuery) {
        // For SELECT queries, use the RPC function
        const { data, error: queryError } = await supabase.rpc("execute_select_query", { sql_query: query })

        if (queryError) {
          throw queryError
        }

        setResult({
          data,
          command: "SELECT",
          rowCount: data?.length || 0,
        })
      } else {
        // For INSERT, UPDATE, DELETE queries
        const { data, error: queryError } = await supabase.rpc("execute_sql", { sql_query: query })

        if (queryError) {
          throw queryError
        }

        setResult({
          data,
          command: data?.command || "EXECUTED",
          rowCount: data?.rowCount || 0,
        })
      }
    } catch (err: any) {
      console.error("SQL execution error:", err)
      setError(err.message || "An error occurred while executing the query")
    } finally {
      setLoading(false)
    }
  }

  const loadSavedQuery = (queryText: string) => {
    setQuery(queryText)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="editor">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="editor">SQL Editor</TabsTrigger>
          <TabsTrigger value="templates">Query Templates</TabsTrigger>
        </TabsList>
        <TabsContent value="editor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SQL Query</CardTitle>
              <CardDescription>Write your SQL query to manage questions</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SELECT * FROM questions LIMIT 100;"
                className="font-mono min-h-[200px]"
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setQuery("")}>
                Clear
              </Button>
              <Button onClick={executeQuery} disabled={loading} className="bg-primary hover:bg-primary/90">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Execute
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {error && (
            <Card className="border-red-500">
              <CardHeader className="text-red-600">
                <CardTitle>Error</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-red-50 p-4 rounded overflow-x-auto text-red-600">{error}</pre>
              </CardContent>
            </Card>
          )}

          {result && (
            <Card>
              <CardHeader>
                <CardTitle>Result</CardTitle>
                <CardDescription>
                  {result.command} - {result.rowCount} rows affected
                </CardDescription>
              </CardHeader>
              <CardContent>
                {result.data && result.data.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          {Object.keys(result.data[0]).map((key) => (
                            <th key={key} className="border p-2 text-left">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.data.map((row: any, i: number) => (
                          <tr key={i} className="border-b hover:bg-gray-50">
                            {Object.values(row).map((value: any, j: number) => (
                              <td key={j} className="border p-2">
                                {typeof value === "object" ? JSON.stringify(value) : String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>No data returned</p>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Query Templates</CardTitle>
              <CardDescription>Select a template to load into the editor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedQueries.map((savedQuery, index) => (
                  <Card
                    key={index}
                    className="cursor-pointer hover:shadow-md"
                    onClick={() => loadSavedQuery(savedQuery.query)}
                  >
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm">{savedQuery.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <pre className="text-xs bg-gray-50 p-2 rounded overflow-hidden text-ellipsis max-h-20">
                        {savedQuery.query}
                      </pre>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
