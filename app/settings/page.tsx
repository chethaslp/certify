"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, Mail, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"
import { Switch } from "@/components/ui/switch"
import { useSession } from "next-auth/react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface EmailProfile {
  id?: string
  profileName: string
  smtpServer: string
  smtpPort: string
  smtpUsername: string
  smtpPassword: string
  senderEmail: string
  senderName: string
  isDefault: boolean
}

export default function Settings() {
  const { toast } = useToast()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [emailProfiles, setEmailProfiles] = useState<EmailProfile[]>([])
  const [showNewProfileDialog, setShowNewProfileDialog] = useState(false)
  const [testProfileId, setTestProfileId] = useState<string | null>(null)

  const [newEmailProfile, setNewEmailProfile] = useState<EmailProfile>({
    profileName: "",
    smtpServer: "",
    smtpPort: "587",
    smtpUsername: "",
    smtpPassword: "",
    senderEmail: "",
    senderName: "",
    isDefault: false,
  })

  // Load email profiles from database on component mount
  useEffect(() => {
    const fetchEmailProfiles = async () => {
      try {
        const response = await fetch("/api/email-profiles")
        if (response.ok) {
          const data = await response.json()
          setEmailProfiles(data.profiles || [])
        }
      } catch (error) {
        console.error("Failed to fetch email profiles:", error)
      }
    }

    if (session?.user?.id) {
      fetchEmailProfiles()
    }
  }, [session])

  const handleNewProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewEmailProfile((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleNewProfileSwitchChange = (checked: boolean) => {
    setNewEmailProfile((prev) => ({
      ...prev,
      isDefault: checked,
    }))
  }

  const saveNewEmailProfile = async () => {
    if (
      !newEmailProfile.profileName ||
      !newEmailProfile.smtpServer ||
      !newEmailProfile.smtpUsername ||
      !newEmailProfile.senderEmail
    ) {
      toast({
        title: "Required fields missing",
        description: "Please fill all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/email-profiles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEmailProfile),
      })

      if (response.ok) {
        const data = await response.json()

        // If this is set as default, update other profiles
        if (newEmailProfile.isDefault) {
          setEmailProfiles((prevProfiles) =>
            prevProfiles
              .map((profile) => ({
                ...profile,
                isDefault: false,
              }))
              .concat([data.profile]),
          )
        } else {
          setEmailProfiles((prevProfiles) => [...prevProfiles, data.profile])
        }

        toast({
          title: "Email profile saved",
          description: "Your email profile has been saved successfully",
        })

        // Reset form and close dialog
        setNewEmailProfile({
          profileName: "",
          smtpServer: "",
          smtpPort: "587",
          smtpUsername: "",
          smtpPassword: "",
          senderEmail: "",
          senderName: "",
          isDefault: false,
        })
        setShowNewProfileDialog(false)
      } else {
        throw new Error("Failed to save email profile")
      }
    } catch (error) {
      console.error("Error saving email profile:", error)
      toast({
        title: "Error",
        description: "Failed to save email profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const testEmailConnection = async (profileId: string) => {
    setTestProfileId(profileId)
    try {
      const profile = emailProfiles.find((p) => p.id === profileId)
      if (!profile) return

      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profile }),
      })

      if (response.ok) {
        toast({
          title: "Connection successful",
          description: "Email connection test was successful",
        })
      } else {
        const data = await response.json()
        throw new Error(data.error || "Connection test failed")
      }
    } catch (error) {
      toast({
        title: "Connection failed",
        description: error instanceof Error ? error.message : "Failed to test email connection",
        variant: "destructive",
      })
    } finally {
      setTestProfileId(null)
    }
  }

  const deleteEmailProfile = async (profileId: string) => {
    if (!confirm("Are you sure you want to delete this email profile?")) return

    try {
      const response = await fetch(`/api/email-profiles/${profileId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setEmailProfiles((profiles) => profiles.filter((p) => p.id !== profileId))
        toast({
          title: "Profile deleted",
          description: "Email profile has been deleted successfully",
        })
      } else {
        throw new Error("Failed to delete profile")
      }
    } catch (error) {
      console.error("Error deleting profile:", error)
      toast({
        title: "Error",
        description: "Failed to delete email profile",
        variant: "destructive",
      })
    }
  }

  const setDefaultProfile = async (profileId: string) => {
    try {
      const response = await fetch(`/api/email-profiles/${profileId}/set-default`, {
        method: "POST",
      })

      if (response.ok) {
        setEmailProfiles((profiles) =>
          profiles.map((profile) => ({
            ...profile,
            isDefault: profile.id === profileId,
          })),
        )

        toast({
          title: "Default profile updated",
          description: "Default email profile has been updated",
        })
      } else {
        throw new Error("Failed to update default profile")
      }
    } catch (error) {
      console.error("Error updating default profile:", error)
      toast({
        title: "Error",
        description: "Failed to update default profile",
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
          <h1 className="text-3xl font-bold ml-4">Settings</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserNav />
        </div>
      </div>

      <Tabs defaultValue="email">
        <TabsList className="mb-6">
          <TabsTrigger value="email">Email Settings</TabsTrigger>
          <TabsTrigger value="general">General Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="email">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Email Profiles</h2>
            <Button onClick={() => setShowNewProfileDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Email Profile
            </Button>
          </div>

          {emailProfiles.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Mail className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No email profiles configured yet</p>
                <Button className="mt-4" onClick={() => setShowNewProfileDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Email Profile
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {emailProfiles.map((profile) => (
                <Card key={profile.id} className={profile.isDefault ? "border-primary" : ""}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center">
                        {profile.profileName}
                        {profile.isDefault && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                            Default
                          </span>
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testEmailConnection(profile.id!)}
                          disabled={testProfileId === profile.id}
                        >
                          {testProfileId === profile.id ? (
                            <>Testing...</>
                          ) : (
                            <>
                              <Mail className="mr-2 h-4 w-4" />
                              Test
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteEmailProfile(profile.id!)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      {profile.senderEmail} via {profile.smtpServer}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium mb-1">SMTP Server</p>
                        <p className="text-sm text-muted-foreground">
                          {profile.smtpServer}:{profile.smtpPort}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Username</p>
                        <p className="text-sm text-muted-foreground">{profile.smtpUsername}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Sender</p>
                        <p className="text-sm text-muted-foreground">
                          {profile.senderName} ({profile.senderEmail})
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    {!profile.isDefault && (
                      <Button variant="secondary" onClick={() => setDefaultProfile(profile.id!)}>
                        Set as Default
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure general application settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">General settings will be added in a future update.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Email Profile Dialog */}
      <Dialog open={showNewProfileDialog} onOpenChange={setShowNewProfileDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Email Profile</DialogTitle>
            <DialogDescription>
              Configure an email profile to send templates from different email accounts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="profileName">Profile Name</Label>
              <Input
                id="profileName"
                name="profileName"
                placeholder="e.g., Work Email"
                value={newEmailProfile.profileName}
                onChange={handleNewProfileChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtpServer">SMTP Server</Label>
                <Input
                  id="smtpServer"
                  name="smtpServer"
                  placeholder="smtp.example.com"
                  value={newEmailProfile.smtpServer}
                  onChange={handleNewProfileChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpPort">SMTP Port</Label>
                <Input
                  id="smtpPort"
                  name="smtpPort"
                  placeholder="587"
                  value={newEmailProfile.smtpPort}
                  onChange={handleNewProfileChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtpUsername">SMTP Username</Label>
                <Input
                  id="smtpUsername"
                  name="smtpUsername"
                  placeholder="username@example.com"
                  value={newEmailProfile.smtpUsername}
                  onChange={handleNewProfileChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpPassword">SMTP Password</Label>
                <Input
                  id="smtpPassword"
                  name="smtpPassword"
                  type="password"
                  placeholder="••••••••"
                  value={newEmailProfile.smtpPassword}
                  onChange={handleNewProfileChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="senderEmail">Sender Email</Label>
                <Input
                  id="senderEmail"
                  name="senderEmail"
                  placeholder="sender@example.com"
                  value={newEmailProfile.senderEmail}
                  onChange={handleNewProfileChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senderName">Sender Name</Label>
                <Input
                  id="senderName"
                  name="senderName"
                  placeholder="Your Name"
                  value={newEmailProfile.senderName}
                  onChange={handleNewProfileChange}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isDefault"
                checked={newEmailProfile.isDefault}
                onCheckedChange={handleNewProfileSwitchChange}
              />
              <Label htmlFor="isDefault">Set as default email profile</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewProfileDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveNewEmailProfile} disabled={loading}>
              {loading ? "Saving..." : "Save Profile"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}

