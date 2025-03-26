"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Edit, Trash2, Download, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { ThemeToggle } from "@/components/theme-toggle"

interface Template {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
  thumbnail?: string
}

export default function TemplatesPage() {
  const { toast } = useToast()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch("/api/templates")
        if (response.ok) {
          const data = await response.json()
          setTemplates(data.templates || [])
        } else {
          throw new Error("Failed to fetch templates")
        }
      } catch (error) {
        console.error("Error fetching templates:", error)
        toast({
          title: "Error",
          description: "Failed to load templates",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTemplates()
  }, [toast])

  const deleteTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return

    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setTemplates(templates.filter((template) => template.id !== id))
        toast({
          title: "Template deleted",
          description: "The template has been deleted successfully",
        })
      } else {
        throw new Error("Failed to delete template")
      }
    } catch (error) {
      console.error("Error deleting template:", error)
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      })
    }
  }

  const downloadTemplate = async (id: string, name: string) => {
    try {
      const response = await fetch(`/api/templates/${id}/download`)

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${name.replace(/\s+/g, "-").toLowerCase()}.tmpl`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        throw new Error("Failed to download template")
      }
    } catch (error) {
      console.error("Error downloading template:", error)
      toast({
        title: "Error",
        description: "Failed to download template",
        variant: "destructive",
      })
    }
  }

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
          <h1 className="text-3xl font-bold ml-4">Saved Templates</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="overflow-hidden">
              <div className="h-40 bg-gray-100 flex items-center justify-center">
                {template.thumbnail ? (
                  <img
                    src={template.thumbnail || "/placeholder.svg"}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400">No Preview</div>
                )}
              </div>
              <CardHeader>
                <CardTitle>{template.name}</CardTitle>
                <p className="text-sm text-gray-500">
                  Last updated: {format(new Date(template.updatedAt), "MMM d, yyyy")}
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{template.description || "No description"}</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" onClick={() => deleteTemplate(template.id)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => downloadTemplate(template.id, template.name)}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Link href={`/edit/${template.id}`}>
                    <Button size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg dark:border-gray-700">
          <h3 className="text-xl font-medium mb-2">No templates yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first template to get started</p>
          <Link href="/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </Link>
        </div>
      )}
    </main>
  )
}

