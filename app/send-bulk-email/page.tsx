"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, Upload, Check, AlertCircle, Mail, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"
import { Progress } from "@/components/ui/progress"
import CSVImporter from "@/components/csv-importer"
import { TestSendDialog } from "@/components/test-send-dialog"

interface EmailProfile {
  id: string
  profileName: string
  senderEmail: string
  senderName: string
  isDefault: boolean
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
}

interface SendingStatus {
  total: number
  sent: number
  failed: number
  currentEmail?: string
  error?: string
  inProgress: boolean
  complete: boolean
}

export default function SendBulkEmailPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [emailProfiles, setEmailProfiles] = useState<EmailProfile[]>([])
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([])
  const [selectedEmailProfile, setSelectedEmailProfile] = useState<string>("")
  const [selectedEmailTemplate, setSelectedEmailTemplate] = useState<string>("")
  const [csvData, setCsvData] = useState<Array<Record<string, string>>>([])
  const [emailColumnField, setEmailColumnField] = useState<string>("")
  const [sendingStatus, setSendingStatus] = useState<SendingStatus>({
    total: 0,
    sent: 0,
    failed: 0,
    inProgress: false,
    complete: false,
  })
  const [activeTab, setActiveTab] = useState<string>("setup")
  const [testDialogOpen, setTestDialogOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch email profiles
        const profilesResponse = await fetch("/api/email-profiles")
        if (profilesResponse.ok) {
          const data = await profilesResponse.json()
          setEmailProfiles(data.profiles || [])

          // Set default profile if available
          const defaultProfile = data.profiles?.find((p: EmailProfile) => p.isDefault)
          if (defaultProfile) {
            setSelectedEmailProfile(defaultProfile.id)
          } else if (data.profiles && data.profiles.length > 0) {
            setSelectedEmailProfile(data.profiles[0].id)
          }
        }

        // Fetch email templates
        const emailTemplatesResponse = await fetch("/api/email-templates")
        if (emailTemplatesResponse.ok) {
          const data = await emailTemplatesResponse.json()
          setEmailTemplates(data.templates || [])
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load required data. Please try again.",
          variant: "destructive",
        })
      }
    }

    if (session?.user?.id) {
      fetchData()
    }
  }, [session, toast])

  const handleCSVImport = (data: Array<Record<string, string>>) => {
    setCsvData(data)
    setEmailColumnField("") // Reset email column selection

    toast({
      title: "CSV Imported",
      description: `Successfully imported ${data.length} rows of data.`,
    })
  }

  const handleSendEmails = async () => {
    if (!selectedEmailProfile || !selectedEmailTemplate || !emailColumnField || !csvData.length) {
      toast({
        title: "Missing requirements",
        description: "Please complete all setup steps before sending.",
        variant: "destructive",
      })
      return
    }

    // Switch to status tab and initialize sending status
    setActiveTab("status")
    setSendingStatus({
      total: csvData.length,
      sent: 0,
      failed: 0,
      inProgress: true,
      complete: false,
    })
    try {
      // Create a connection to the server using EventSource
      const eventSource = new EventSource(
        `/api/send-emails-sse?profileId=${selectedEmailProfile}&templateId=${selectedEmailTemplate}&emailColumn=${emailColumnField}`,
      )

      // Listen for messages from the server
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data)

        // Update status based on the message
        if (data.type === "progress") {
          setSendingStatus({
            total: data.total,
            sent: data.sent,
            failed: data.failed,
            currentEmail: data.currentEmail,
            inProgress: true,
            complete: false,
          })
        } else if (data.type === "complete") {
          setSendingStatus({
            total: data.total,
            sent: data.sent,
            failed: data.failed,
            inProgress: false,
            complete: true,
          })

          // Close the connection
          eventSource.close()

          toast({
            title: "Email sending complete",
            description: `Successfully sent ${data.sent} emails. Failed: ${data.failed}.`,
          })
        } else if (data.type === "error") {
          setSendingStatus((prev) => ({
            ...prev,
            error: data.message,
            inProgress: false,
            complete: true,
          }))

          // Close the connection
          eventSource.close()

          toast({
            title: "Error sending emails",
            description: data.message,
            variant: "destructive",
          })
        }
      }

      // Handle errors
      eventSource.onerror = (error) => {
        console.error("EventSource error:", error)
        eventSource.close()

        setSendingStatus((prev) => ({
          ...prev,
          error: "Connection to server lost. Please try again.",
          inProgress: false,
          complete: true,
        }))

        toast({
          title: "Connection error",
          description: "Lost connection to the server. Please try again.",
          variant: "destructive",
        })
      }

      // Send initial request to start the email sending process
      const response = await fetch("/api/send-bulk-emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profileId: selectedEmailProfile,
          templateId: selectedEmailTemplate,
          emailColumn: emailColumnField,
          csvData,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to start sending emails")
      }
    } catch (error) {
      console.error("Error starting email send:", error)

      setSendingStatus((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to send emails",
        inProgress: false,
        complete: true,
      }))

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send emails",
        variant: "destructive",
      })
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Create a FileReader to read the CSV file
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const csvText = event.target?.result as string

        // Use the CSVImporter logic to parse the CSV
        const lines = csvText.split(/\r\n|\n/)
        if (lines.length < 2) throw new Error("CSV must have headers and at least one data row")

        // Parse headers
        const headers = lines[0].split(",").map((header) => header.trim())

        // Parse data rows
        const result: Array<Record<string, string>> = []
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue // Skip empty lines

          const values = lines[i].split(",").map((value) => value.trim())
          if (values.length !== headers.length) {
            console.warn(`Line ${i + 1} has ${values.length} values, expected ${headers.length}`)
            continue
          }

          const row: Record<string, string> = {}
          headers.forEach((header, index) => {
            row[header] = values[index] || ""
          })

          result.push(row)
        }

        setCsvData(result)
        toast({
          title: "CSV Imported",
          description: `Successfully imported ${result.length} rows of data.`,
        })
      } catch (error) {
        console.error("Failed to parse CSV file:", error)
        toast({
          title: "Error",
          description: "Failed to parse CSV file. Please check the format.",
          variant: "destructive",
        })
      }
    }

    reader.onerror = () => {
      toast({
        title: "Error",
        description: "Failed to read the file",
        variant: "destructive",
      })
    }

    reader.readAsText(file)
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
          <h1 className="text-3xl font-bold ml-4">Send Bulk Emails</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserNav />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="setup" disabled={sendingStatus.inProgress}>
                Setup
              </TabsTrigger>
              <TabsTrigger value="preview" disabled={sendingStatus.inProgress}>
                Preview & Send
              </TabsTrigger>
              <TabsTrigger value="status" disabled={!sendingStatus.inProgress && !sendingStatus.complete}>
                Status
              </TabsTrigger>
            </TabsList>

            <TabsContent value="setup">
              <Card>
                <CardHeader>
                  <CardTitle>Email Setup</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email-profile">Email Profile</Label>
                    <Select value={selectedEmailProfile} onValueChange={setSelectedEmailProfile}>
                      <SelectTrigger id="email-profile">
                        <SelectValue placeholder="Select an email profile" />
                      </SelectTrigger>
                      <SelectContent>
                        {emailProfiles.map((profile) => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {profile.profileName}
                            {profile.isDefault ? " (Default)" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {emailProfiles.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        <Link href="/settings" className="text-primary hover:underline">
                          Add an email profile
                        </Link>{" "}
                        to send emails.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email-template">Email Template</Label>
                    <div className="flex gap-2">
                      <Select value={selectedEmailTemplate} onValueChange={setSelectedEmailTemplate}>
                        <SelectTrigger id="email-template" className="flex-1">
                          <SelectValue placeholder="Select an email template" />
                        </SelectTrigger>
                        <SelectContent>
                          {emailTemplates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Link href="/email-templates/create">
                        <Button variant="outline" size="icon" title="Create new email template">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>CSV Data</Label>
                    <div className="border rounded-lg p-4">
                      <CSVImporter onDataImported={handleCSVImport} />
                    </div>
                  </div>

                  {csvData.length > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="email-column">Email Address Column</Label>
                      <Select value={emailColumnField} onValueChange={setEmailColumnField}>
                        <SelectTrigger id="email-column">
                          <SelectValue placeholder="Select the column with email addresses" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(csvData[0]).map((header) => (
                            <SelectItem key={header} value={header}>
                              {header}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Button
                    onClick={() => setActiveTab("preview")}
                    disabled={!selectedEmailTemplate || csvData.length === 0 || !emailColumnField}
                    className="w-full"
                  >
                    Continue to Preview
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview">
              <Card>
                <CardHeader>
                  <CardTitle>Preview & Send</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {csvData.length > 0 ? (
                    <>
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">Email Configuration</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="border rounded-lg p-4">
                            <p className="text-sm font-medium">From:</p>
                            <p className="text-sm text-muted-foreground">
                              {emailProfiles.find((p) => p.id === selectedEmailProfile)?.senderName} &lt;
                              {emailProfiles.find((p) => p.id === selectedEmailProfile)?.senderEmail}&gt;
                            </p>
                          </div>
                          <div className="border rounded-lg p-4">
                            <p className="text-sm font-medium">Template:</p>
                            <p className="text-sm text-muted-foreground">
                              {emailTemplates.find((t) => t.id === selectedEmailTemplate)?.name}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">Recipients Preview</h3>
                        <div className="border rounded-lg p-4 max-h-40 overflow-y-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2">Email</th>
                                <th className="text-left py-2">Data</th>
                              </tr>
                            </thead>
                            <tbody>
                              {csvData.slice(0, 5).map((row, index) => (
                                <tr key={index} className="border-b last:border-0">
                                  <td className="py-2">{row[emailColumnField]}</td>
                                  <td className="py-2">
                                    {Object.entries(row)
                                      .filter(([key]) => key !== emailColumnField)
                                      .map(([key, value]) => `${key}: ${value}`)
                                      .join(", ")}
                                  </td>
                                </tr>
                              ))}
                              {csvData.length > 5 && (
                                <tr>
                                  <td colSpan={2} className="py-2 text-center text-muted-foreground">
                                    ... and {csvData.length - 5} more recipients
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => setTestDialogOpen(true)}
                          variant="outline"
                          className="flex-1"
                          disabled={!selectedEmailTemplate}
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          Send Test Email
                        </Button>
                        <Button
                          onClick={handleSendEmails}
                          className="flex-1"
                          disabled={!selectedEmailProfile || !selectedEmailTemplate || !emailColumnField}
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          Send Emails ({csvData.length})
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <Mail className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No data imported</h3>
                      <p className="text-muted-foreground mb-4">
                        Please import CSV data to send emails
                      </p>
                      <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload CSV File
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <TestSendDialog
                open={testDialogOpen}
                onOpenChange={setTestDialogOpen}
                profileId={selectedEmailProfile}
                emailTemplateId={selectedEmailTemplate}
              />
            </TabsContent>

            <TabsContent value="status">
              <Card>
                <CardHeader>
                  <CardTitle>Email Sending Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between mb-1">
                      <p className="text-sm font-medium">Progress</p>
                      <p className="text-sm font-medium">
                        {sendingStatus.sent + sendingStatus.failed} of {sendingStatus.total}
                      </p>
                    </div>
                    <Progress
                      value={
                        sendingStatus.total > 0
                          ? ((sendingStatus.sent + sendingStatus.failed) / sendingStatus.total) * 100
                          : 0
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-2" />
                        <p className="font-medium">Sent</p>
                      </div>
                      <p className="font-medium">{sendingStatus.sent}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                        <p className="font-medium">Failed</p>
                      </div>
                      <p className="font-medium">{sendingStatus.failed}</p>
                    </div>
                  </div>

                  {sendingStatus.currentEmail && (
                    <div className="border rounded-lg p-4 bg-muted">
                      <p className="text-sm font-medium">Currently sending to:</p>
                      <p className="text-sm">{sendingStatus.currentEmail}</p>
                    </div>
                  )}

                  {sendingStatus.error && (
                    <div className="border border-red-200 rounded-lg p-4 bg-red-50 dark:bg-red-900/20 dark:border-red-900/30">
                      <p className="text-sm font-medium text-red-800 dark:text-red-300">Error:</p>
                      <p className="text-sm text-red-600 dark:text-red-400">{sendingStatus.error}</p>
                    </div>
                  )}

                  {sendingStatus.complete && (
                    <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
                      <p className="text-sm font-medium text-green-800 dark:text-green-300">Sending complete!</p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Successfully sent {sendingStatus.sent} emails.
                        {sendingStatus.failed > 0 && ` Failed: ${sendingStatus.failed}`}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          {selectedEmailTemplate ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">
                  Template Preview
                  {csvData.length > 0 && <span className="ml-2 text-xs font-normal text-muted-foreground">(with data from row 1)</span>}
                </CardTitle>
                <Link href={`/email-templates/edit/${selectedEmailTemplate}`}>
                  <Button variant="ghost" size="sm" className="h-8 text-xs">
                    Edit
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {(() => {
                  const template = emailTemplates.find(t => t.id === selectedEmailTemplate)
                  if (!template) return null

                  let subject = template.subject
                  let content = template.content

                  if (csvData.length > 0) {
                    const row = csvData[0]
                    for (const [key, value] of Object.entries(row)) {
                      const regex = new RegExp(`\\{\\{${key}\\}\\}`, "gi")
                      subject = subject.replace(regex, value)
                      content = content.replace(regex, value)
                    }
                  }

                  return (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Subject</Label>
                        <div className="text-sm font-medium border rounded px-3 py-2 bg-muted/20">
                          {subject}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Content</Label>
                        <div 
                          className="text-sm border rounded p-3 bg-background min-h-[200px] max-h-[400px] overflow-y-auto prose prose-sm max-w-none dark:prose-invert"
                          dangerouslySetInnerHTML={{ __html: content }}
                        />
                      </div>
                    </div>
                  )
                })()}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Email Sending Guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">1. Set up your email</h3>
                  <p className="text-sm text-muted-foreground">
                    Select the email profile you want to use for sending. This determines the "From" address.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">2. Choose template</h3>
                  <p className="text-sm text-muted-foreground">
                    Select the email content template to use.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">3. Import data</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload a CSV file with recipient data and select which column contains email addresses.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">4. Review and send</h3>
                  <p className="text-sm text-muted-foreground">
                    Preview the recipient list before sending.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {csvData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>CSV Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-2">{csvData.length} rows imported</div>
                <div className="border rounded-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted border-b">
                          {Object.keys(csvData[0]).map((header) => (
                            <th key={header} className="px-4 py-2 text-left font-medium">
                              {header}
                              {header === emailColumnField && <span className="ml-1 text-primary">(Email)</span>}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvData.slice(0, 3).map((row, i) => (
                          <tr key={i} className="border-b">
                            {Object.values(row).map((value, j) => (
                              <td key={j} className="px-4 py-2 text-muted-foreground">
                                {value}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {csvData.length > 3 && (
                    <div className="px-4 py-2 text-xs text-muted-foreground border-t">
                      ...and {csvData.length - 3} more rows
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  )
}
