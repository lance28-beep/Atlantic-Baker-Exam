"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { signOut } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, FileText, Users, Settings, LogOut, Menu, X, Moon, Sun, Database, User } from "lucide-react"
import { useTheme } from "next-themes"
import { supabase } from "@/lib/supabase/client"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          const { data: adminData } = await supabase.from("admins").select("*").eq("id", session.user.id).single()

          setIsAdmin(!!adminData)
        }
      } catch (error) {
        console.error("Error checking user role:", error)
      } finally {
        setLoading(false)
      }
    }

    checkUserRole()
  }, [])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile sidebar toggle */}
      <button
        className="fixed z-50 bottom-4 right-4 p-2 rounded-full bg-primary text-white lg:hidden"
        onClick={toggleSidebar}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:relative lg:translate-x-0 z-40 transition duration-200 ease-in-out lg:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700`}
      >
        <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="Atlantic Bakery Logo" width={150} height={40} priority />
          </Link>
        </div>

        <div className="flex flex-col flex-grow p-4 overflow-y-auto">
          <nav className="flex-1 space-y-2">
            {isAdmin ? (
              <>
                <Link
                  href="/admin/dashboard"
                  className={`flex items-center px-4 py-2 rounded-lg ${
                    pathname === "/admin/dashboard"
                      ? "bg-primary text-white"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <LayoutDashboard className="mr-3 h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  href="/admin/questions"
                  className={`flex items-center px-4 py-2 rounded-lg ${
                    pathname === "/admin/questions"
                      ? "bg-primary text-white"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <FileText className="mr-3 h-5 w-5" />
                  Questions
                </Link>
                <Link
                  href="/admin/examiners"
                  className={`flex items-center px-4 py-2 rounded-lg ${
                    pathname === "/admin/examiners"
                      ? "bg-primary text-white"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Users className="mr-3 h-5 w-5" />
                  Examiners
                </Link>
                <Link
                  href="/admin/sql-editor"
                  className={`flex items-center px-4 py-2 rounded-lg ${
                    pathname === "/admin/sql-editor"
                      ? "bg-primary text-white"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Database className="mr-3 h-5 w-5" />
                  SQL Editor
                </Link>
                <Link
                  href="/admin/settings"
                  className={`flex items-center px-4 py-2 rounded-lg ${
                    pathname === "/admin/settings"
                      ? "bg-primary text-white"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Settings className="mr-3 h-5 w-5" />
                  Settings
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className={`flex items-center px-4 py-2 rounded-lg ${
                    pathname === "/dashboard"
                      ? "bg-primary text-white"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <LayoutDashboard className="mr-3 h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  href="/exams"
                  className={`flex items-center px-4 py-2 rounded-lg ${
                    pathname === "/exams"
                      ? "bg-primary text-white"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <FileText className="mr-3 h-5 w-5" />
                  My Exams
                </Link>
                <Link
                  href="/profile"
                  className={`flex items-center px-4 py-2 rounded-lg ${
                    pathname === "/profile"
                      ? "bg-primary text-white"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <User className="mr-3 h-5 w-5" />
                  Profile
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">Theme</span>
            <button onClick={toggleTheme} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-700" />
              )}
            </button>
          </div>
          <form action={signOut}>
            <Button type="submit" variant="outline" className="w-full flex items-center justify-center">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </form>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  )
}
