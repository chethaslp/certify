"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import TemplateCreator from "@/components/template-creator"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"
import { useToast } from "@/hooks/use-toast"

export default function EditTemplatePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [template, setTemplate] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await fetch(`/api/templates/${params.id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch template")
        }

        const data = await response.json()
        setTemplate(data.template)
      } catch (error) {
        console.error("Error fetching template:", error)
        setError("Failed to load template. It might not exist or you don't have permission to view it.")
        toast({
          title: "Error",
          description: "Failed to load template",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchTemplate()
    }
  }, [params.id, toast])

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href="/templates">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-3xl font-bold ml-4">Edit Template</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserNav />
          </div>
        </div>

        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6 text-center">
          <p className="text-destructive font-medium mb-4">{error}</p>
          <Button onClick={() => router.push("/templates")}>Return to Templates</Button>
        </div>
      </div>
    )
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/templates">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold ml-4">Edit Template: {template?.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserNav />
        </div>
      </div>

      {template && <TemplateCreator initialTemplate={template} />}
    </main>
  )
}

