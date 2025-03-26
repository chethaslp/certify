"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Edit, Trash2, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { ThemeToggle } from "@/components/theme-toggle"

interface EmailTemplate {
  id: string
  name: string
  subject: string
  createdAt: string
  updatedAt: string
}

export default function EmailTemplatesPage() {
  const { toast } = useToast()
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEmailTemplates = async () => {
      try {
        const response = await fetch("/api/email-templates")
        if (response.ok) {
          const data = await response.json()
          setEmailTemplates(data.templates || [])
        } else {
          throw new Error("Failed to fetch email templates")
        }
      } catch (error) {
        console.error("Error fetching email templates:", error)
        toast({
          title: "Error",
          description: "Failed to load email templates",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchEmailTemplates()
  }, [toast])

  const deleteEmailTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this email template?")) return

    try {
      const response = await fetch(`/api/email-templates/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setEmailTemplates(emailTemplates.filter((template) => template.id !== id))
        toast({
          title: "Email template deleted",
          description: "The email template has been deleted successfully",
        })
      } else {
        throw new Error("Failed to delete email template")
      }
    } catch (error) {
      console.error("Error deleting email template:", error)
      toast({
        title: "Error",
        description: "Failed to delete email template",
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
          <h1 className="text-3xl font-bold ml-4">Email Templates</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/email-templates/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Email Template
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : emailTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {emailTemplates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <CardTitle>{template.name}</CardTitle>
                <p className="text-sm text-gray-500">
                  Last updated: {format(new Date(template.updatedAt), "MMM d, yyyy")}
                </p>
              </CardHeader>
              <CardContent>
                <div className="mb-2">
                  <span className="font-medium">Subject: </span>
                  <span className="text-gray-600">{template.subject}</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" onClick={() => deleteEmailTemplate(template.id)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <Link href={`/email-templates/edit/${template.id}`}>
                  <Button size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg dark:border-gray-700">
          <h3 className="text-xl font-medium mb-2">No email templates yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first email template to get started</p>
          <Link href="/email-templates/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Email Template
            </Button>
          </Link>
        </div>
      )}
    </main>
  )
}

