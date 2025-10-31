"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Settings, Mail, FileText, ArrowRight, CheckCircle2, Sparkles, Zap, Users, Shield } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  const { data: session } = useSession()

  // Landing page for non-authenticated users
  if (!session) {
    return (
      <main className="min-h-screen">
        {/* Hero Section */}
        <div className="border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">Certify</span>
              </div>
              <div className="flex gap-2 items-center">
                <ThemeToggle />
                <Link href="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/login">
                  <Button>Get Started</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Create & Send Beautiful
              <span className="text-primary"> Certificates</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Design personalized certificates, generate them in bulk, and send them via email automatically. Perfect for events, courses, and achievements.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Link href="/login">
                <Button size="lg" className="text-lg px-8">
                  Start For Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground text-lg">Powerful features to streamline your certificate workflow</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Custom Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Design beautiful certificate templates with your own background images and dynamic text fields.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Bulk Generation</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Upload a CSV file and generate hundreds of personalized certificates in seconds.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Email Automation</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Automatically send personalized emails with certificates attached to all recipients.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Variable Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Use dynamic variables like name, team, date, etc. for fully personalized certificates.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-muted/50 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How It Works</h2>
              <p className="text-muted-foreground text-lg">Get started in 4 simple steps</p>
            </div>

            <div className="max-w-4xl mx-auto space-y-8">
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Configure Email Settings</h3>
                  <p className="text-muted-foreground">
                    Set up your SMTP credentials to send emails from your own domain. Supports Gmail, Outlook, and custom SMTP servers.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Design Certificate Template</h3>
                  <p className="text-muted-foreground">
                    Upload a background image and add text fields with variables. Position them exactly where you want.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Create Email Template</h3>
                  <p className="text-muted-foreground">
                    Write your email message with a built-in HTML editor. Include variables for personalization.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  4
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Upload & Send</h3>
                  <p className="text-muted-foreground">
                    Upload your recipient data as CSV, preview everything, and send to everyone with one click.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center space-y-6 border rounded-2xl p-12 bg-primary/5">
            <h2 className="text-4xl font-bold">Ready to Get Started?</h2>
            <p className="text-xl text-muted-foreground">
              Join others who are already creating and sending beautiful certificates.
            </p>
            <Link href="/login">
              <Button size="lg" className="text-lg px-8">
                Create Your First Certificate
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <p>© 2025 Certify. All rights reserved.</p>
              <div className="flex gap-6">
                <Link href="#" className="hover:text-foreground">Privacy</Link>
                <Link href="#" className="hover:text-foreground">Terms</Link>
                <Link href="#" className="hover:text-foreground">Contact</Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // Dashboard for authenticated users
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