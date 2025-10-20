import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Settings, Mail, Save, FileText } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"

export default function Home() {
  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Template Creator</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Create templates with background images and text fields, then generate images using CSV data.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <ThemeToggle />
          <Link href="/settings">
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
          <UserNav />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/create" className="block">
          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:border-primary hover:shadow-md transition-all">
            <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center mb-4">
              <Save className="h-12 w-12 text-gray-400 dark:text-gray-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Create New Template</h2>
            <p className="text-gray-600 dark:text-gray-400">Start from scratch and create a new template</p>
          </div>
        </Link>

        <Link href="/templates" className="block">
          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:border-primary hover:shadow-md transition-all">
            <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center mb-4">
              <Save className="h-12 w-12 text-gray-400 dark:text-gray-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Saved Templates</h2>
            <p className="text-gray-600 dark:text-gray-400">View and edit your saved templates</p>
          </div>
        </Link>

        <Link href="/send-email" className="block">
          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:border-primary hover:shadow-md transition-all">
            <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center mb-4">
              <Mail className="h-12 w-12 text-gray-400 dark:text-gray-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Send Emails</h2>
            <p className="text-gray-600 dark:text-gray-400">Send emails using templates and CSV data</p>
          </div>
        </Link>

        <Link href="/email-templates" className="block">
          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:border-primary hover:shadow-md transition-all">
            <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center mb-4">
              <FileText className="h-12 w-12 text-gray-400 dark:text-gray-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Email Templates</h2>
            <p className="text-gray-600 dark:text-gray-400">Create and manage email templates for campaigns</p>
          </div>
        </Link>
      </div>
    </main>
  )
}

