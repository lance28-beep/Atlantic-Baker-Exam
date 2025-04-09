"use client"

import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Suspense } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { motion } from "framer-motion"

// Loading component for Suspense
function HomeLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-64"></div>
      </div>
    </div>
  )
}

// Testimonial component
function Testimonial({ name, role, company, content, image }: { name: string; role: string; company: string; content: string; image: string }) {
  return (
    <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <div className="relative w-12 h-12 mr-4">
            <Image src={image} alt={name} fill className="rounded-full object-cover" />
          </div>
          <div>
            <h4 className="font-semibold text-lg">{name}</h4>
            <p className="text-sm text-gray-600">{role}, {company}</p>
          </div>
        </div>
        <p className="text-gray-700 italic">&quot;{content}&quot;</p>
      </CardContent>
    </Card>
  )
}

export default function ClientHome() {
  return (
    <Suspense fallback={<HomeLoading />}>
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 py-4 sticky top-0 z-50">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <div className="flex items-center">
              <Image src="/logo.png" alt="Atlantic Bakery Logo" width={150} height={40} priority className="hover:opacity-90 transition-opacity" />
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="outline" className="hover:bg-gray-100 transition-colors">Log In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-primary hover:bg-primary/90 transition-colors">Sign Up</Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/90 to-primary text-white py-24 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-10"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"></div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30">New Platform</Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">Atlantic Bakery Exam System</h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
                A comprehensive platform for employee assessment and professional development
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/auth/login">
                  <Button size="lg" className="bg-white text-primary hover:bg-gray-100 transition-colors">
                    Log In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="lg" className="bg-accent text-black hover:bg-accent/90 transition-colors">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Vision & Mission Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <Badge className="mb-4 bg-accent/10 text-accent">Our Values</Badge>
              <h2 className="text-3xl font-bold mb-4">Vision & Mission</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                The guiding principles that drive Atlantic Bakery forward
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              {/* Vision Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg shadow-lg p-8 border border-gray-100"
              >
                <h3 className="text-2xl font-bold text-primary mb-4">Our Vision</h3>
                <p className="text-lg italic text-gray-700 mb-6">
                  "Dekalidad na kita, tinapay, pagkakan asin Serbisyo. sa pag uswag ka antabay, sa guiya nin kagurangnan"
                </p>
                <p className="text-gray-600">
                  Quality people, bread, food and service. Guided by excellence, under the guidance of the Lord.
                </p>
              </motion.div>
              
              {/* Mission Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg shadow-lg p-8 border border-gray-100"
              >
                <h3 className="text-2xl font-bold text-primary mb-4">Our Mission</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Take care of People.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>To Produce quality, consistent, and affordable breads</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Continuous improvement of working environment and organizational structure.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Expand Business Through Branding and Branching.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Community Service.</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-12 mt-auto">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <Image src="/logo.png" alt="Atlantic Bakery Logo" width={120} height={30} priority className="mb-4" />
                <p className="text-gray-400">Empowering employee growth through assessment</p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="/auth/login" className="text-gray-400 hover:text-white transition-colors">
                      Log In
                    </Link>
                  </li>
                  <li>
                    <Link href="/auth/signup" className="text-gray-400 hover:text-white transition-colors">
                      Sign Up
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Contact</h4>
                <ul className="space-y-2">
                  <li className="text-gray-400">Email: info@atlanticbakery.com</li>
                  <li className="text-gray-400">Phone: (123) 456-7890</li>
                  <li className="text-gray-400">Address: 123 Bakery Street, City, Country</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; {new Date().getFullYear()} Atlantic Bakery. All rights reserved.</p>
              <p className="mt-2">
                This was developed by{" "}
                <a 
                  href="https://lance28-beep.github.io/portfolio-website/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  Pareng Lance
                </a>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Suspense>
  )
} 