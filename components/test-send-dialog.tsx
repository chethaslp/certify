import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

interface TestSendDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  templateId: string
  profileId: string
  emailTemplateId?: string // Optional, not used in current API
}

export function TestSendDialog({ open, onOpenChange, templateId, profileId, emailTemplateId }: TestSendDialogProps) {
  const [fields, setFields] = useState<string[]>([])
  const [form, setForm] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  React.useEffect(() => {
    if (open && templateId) {
      fetch(`/api/send-emails/test?templateId=${templateId}`)
        .then(r => r.json())
        .then(data => {
          if (data.requiredFields) {
            setFields(data.requiredFields)
            setForm(Object.fromEntries(data.requiredFields.map((f: string) => [f, ""])))
          }
        })
    }
  }, [open, templateId])

  const handleChange = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch("/api/send-emails/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileId,
        templateId,
        emailTemplateId,
        testData: form,
      }),
    })
    const data = await res.json()
    setLoading(false)
    if (data.success) {
      toast({ title: "Test email sent!", description: "Check your inbox." })
      onOpenChange(false)
    } else {
      toast({ title: "Failed to send test email", description: data.error || "Unknown error", variant: "destructive" })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Test Email</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(field => (
            <div key={field}>
              <Label htmlFor={field}>{field.charAt(0).toUpperCase() + field.slice(1)}</Label>
              <Input
                id={field}
                value={form[field] || ""}
                onChange={e => handleChange(field, e.target.value)}
                required
                type={field === "email" ? "email" : "text"}
                autoComplete="off"
              />
            </div>
          ))}
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Test"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
