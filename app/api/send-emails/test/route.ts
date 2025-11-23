import { NextResponse, type NextRequest } from "next/server"
import { db } from "@/lib/db"
import { requireAuthUserId } from "@/lib/auth"
import nodemailer from "nodemailer"

export async function POST(request: Request) {
  try {
    const userId = await requireAuthUserId()
    const { profileId, templateId, emailTemplateId, testData } = await request.json()

    if (!profileId || !templateId || !testData || typeof testData !== "object") {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 })
    }

    // Get email profile
    const profile = await db.emailProfile.findFirst({
      where: { id: profileId, userId },
    })
    if (!profile) {
      return NextResponse.json({ error: "Email profile not found" }, { status: 404 })
    }

    // Get email template (use emailTemplateId if provided, otherwise fall back to templateId)
    const emailTemplateToUse = emailTemplateId || templateId
    const emailTemplate = await db.emailTemplate.findFirst({
      where: { id: emailTemplateToUse, userId },
    })
    if (!emailTemplate) {
      return NextResponse.json({ error: "Email template not found" }, { status: 404 })
    }

    // Get design template for image generation (optional)
    let imageDataUrl = null
    if (templateId) {
      const template = await db.template.findFirst({
        where: { id: templateId, userId },
      })
      if (!template) {
        return NextResponse.json({ error: "Design template not found" }, { status: 404 })
      }

      // Parse text fields from JSON string
      const textFields = JSON.parse(template.textFields)
      const { createCanvas, loadImage } = require("canvas")
      const CANVAS_WIDTH = 800
      const CANVAS_HEIGHT = 500
      const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT)
      const ctx = canvas.getContext("2d")
      const backgroundImage = await loadImage(template.backgroundImage)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height)
      for (const field of textFields) {
        ctx.font = `${field.fontSize}px ${field.fontFamily}`
        ctx.fillStyle = field.color
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        const fieldName = field.text.trim()
        const text = testData[fieldName] || field.text
        ctx.fillText(text, field.x, field.y)
      }
      imageDataUrl = canvas.toDataURL("image/png")
    }

    // Replace variables in subject and content (support only {{variable}} format)
    let subject = emailTemplate.subject
    let content = emailTemplate.content
    for (const [key, value] of Object.entries(testData)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, "gi")
      subject = subject.replace(regex, value as string)
      content = content.replace(regex, value as string)
    }

    // Send test email
    const transporter = profile.smtpServer === "smtp.google.com"
          ? nodemailer.createTransport({
            service: "gmail",
            auth: {
            user: profile.smtpUsername,
            pass: profile.smtpPassword,
            },
          })
          : nodemailer.createTransport({
            host: profile.smtpServer,
            port: Number.parseInt(profile.smtpPort || "587"),
            secure: profile.smtpPort === "465",
            requireTLS: profile.smtpPort !== "465",
            auth: {
            user: profile.smtpUsername,
            pass: profile.smtpPassword,
            },
          })
          
    const attachments = []
    if (imageDataUrl) {
      attachments.push({
        filename: "test-image.png",
        content: imageDataUrl.split(",")[1],
        encoding: "base64",
      })
    }

    await transporter.sendMail({
      from: `${profile.senderName} <${profile.senderEmail}>`,
      to: testData.email, // assumes 'email' is always a field
      subject: subject,
      html: content,
      attachments: attachments,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error("Error sending test email:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to send test email" }, { status: 500 })
  }
}

// Helper endpoint to get required fields for test data
export async function GET(request: NextRequest) {
  try {
    const userId = await requireAuthUserId()
    const templateId = request.nextUrl.searchParams.get("templateId")
    const emailTemplateId = request.nextUrl.searchParams.get("emailTemplateId")
    
    if (!templateId && !emailTemplateId) {
      return NextResponse.json({ error: "Missing templateId or emailTemplateId" }, { status: 400 })
    }

    let fieldNames: string[] = []

    if (templateId) {
      const template = await db.template.findFirst({ where: { id: templateId, userId } })
      if (template) {
        const textFields = JSON.parse(template.textFields)
        fieldNames = Array.from(new Set(textFields.map((f: any) => f.text.trim())))
      }
    } else if (emailTemplateId) {
      const emailTemplate = await db.emailTemplate.findFirst({ where: { id: emailTemplateId, userId } })
      if (emailTemplate) {
        const regex = /\{\{([a-zA-Z0-9_]+)\}\}/g
        const text = (emailTemplate.subject + " " + emailTemplate.content)
        let match
        while ((match = regex.exec(text)) !== null) {
          fieldNames.push(match[1])
        }
        fieldNames = Array.from(new Set(fieldNames))
      }
    }

    // Always include 'email' as required
    if (!fieldNames.includes('email')) fieldNames.push('email')
    return NextResponse.json({ requiredFields: fieldNames })
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Failed to get required fields" }, { status: 500 })
  }
}
