"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import TemplateCreator from "@/components/template-creator"
import { ThemeToggle } from "@/components/theme-toggle"

export default function CreateTemplate() {
  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold ml-4">Create Template</h1>
        </div>
        <ThemeToggle />
      </div>

      <TemplateCreator />
    </main>
  )
}

