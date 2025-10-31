import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Settings, Mail, FileText, ArrowRight, CheckCircle2 } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <main className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Certify</h1>
          <p className="text-muted-foreground text-lg">
            Create personalized certificates and send them via email with ease
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

      {/* Step-by-Step Guide */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Getting Started</CardTitle>
          <CardDescription>Follow these steps to create and send personalized certificates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  Set Up Email Profile
                  <Link href="/settings">
                    <Button variant="outline" size="sm">
                      Go to Settings <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </h3>
                <p className="text-muted-foreground">
                  Configure your SMTP settings and sender information. This allows you to send emails from your own email address.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  Create Certificate Template
                  <Link href="/templates">
                    <Button variant="outline" size="sm">
                      View Templates <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </h3>
                <p className="text-muted-foreground">
                  Design your certificate template by uploading a background image and adding text fields. Use placeholders like name, email, team, etc.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  3
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  Create Email Template
                  <Link href="/email-templates">
                    <Button variant="outline" size="sm">
                      Manage Email Templates <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </h3>
                <p className="text-muted-foreground">
                  Write the email content that will be sent along with the certificate. You can use variables like {"{Name}"} or {"{Team}"} for personalization.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  4
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  Send Certificates
                  <Link href="/send-email">
                    <Button size="sm">
                      Start Sending <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </h3>
                <p className="text-muted-foreground">
                  Upload a CSV file with recipient data, select your templates, preview everything, and send personalized certificates to all recipients at once.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/templates" className="block">
          <div className="border rounded-lg p-6 hover:border-primary hover:shadow-md transition-all h-full">
            <div className="h-32 bg-muted rounded-md flex items-center justify-center mb-4">
              <FileText className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Certificate Templates</h2>
            <p className="text-muted-foreground">View and edit your saved certificate templates</p>
          </div>
        </Link>

        <Link href="/email-templates" className="block">
          <div className="border rounded-lg p-6 hover:border-primary hover:shadow-md transition-all h-full">
            <div className="h-32 bg-muted rounded-md flex items-center justify-center mb-4">
              <Mail className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Email Templates</h2>
            <p className="text-muted-foreground">Create and manage email templates</p>
          </div>
        </Link>

        <Link href="/send-email" className="block">
          <div className="border border-primary rounded-lg p-6 hover:shadow-md transition-all h-full bg-primary/5">
            <div className="h-32 bg-primary/10 rounded-md flex items-center justify-center mb-4">
              <CheckCircle2 className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Send Certificates</h2>
            <p className="text-muted-foreground">Ready to send? Upload CSV and start sending</p>
          </div>
        </Link>
      </div>
    </main>
  )
}