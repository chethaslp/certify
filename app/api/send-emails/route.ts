import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import nodemailer from "nodemailer"
import { sendSSEMessage } from "../send-emails-sse/route"
import { requireAuthUserId } from "@/lib/auth"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const userId = await requireAuthUserId()

    const { profileId, templateId, emailColumn, csvData, images } = await request.json()

    if (!profileId || !templateId || !emailColumn || !csvData || !images) {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 })
    }

    // Get email profile
    const profile = await db.emailProfile.findFirst({
      where: {
        id: profileId,
        userId,
      },
    })

    if (!profile) {
      return NextResponse.json({ error: "Email profile not found" }, { status: 404 })
    }

    // Get email template
    const emailTemplate = await db.emailTemplate.findFirst({
      where: {
        id: templateId,
        userId,
      },
    })

    if (!emailTemplate) {
      return NextResponse.json({ error: "Email template not found" }, { status: 404 })
    }

    // Return success to begin the process
    const response = NextResponse.json({ success: true })

    // Continue processing in the background
    sendEmailsInBackground(profile, emailTemplate, emailColumn, csvData, images)

    return response
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error("Error starting email send:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to send emails",
      },
      { status: 500 },
    )
  }
}

async function sendEmailsInBackground(
  profile: any,
  emailTemplate: any,
  emailColumn: string,
  csvData: Array<Record<string, string>>,
  images: string[],
) {
  try {
    // Create email transporter
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

    // Verify connection
    await transporter.verify()

    let sent = 0
    let failed = 0

    // Send initial progress
    sendSSEMessage({
      type: "progress",
      total: csvData.length,
      sent,
      failed,
      currentEmail: null,
    })

    // Send emails to each recipient
    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i]
      const email = row[emailColumn]

      // Skip if no email address
      if (!email) {
        failed++

        sendSSEMessage({
          type: "progress",
          total: csvData.length,
          sent,
          failed,
          currentEmail: null,
          message: `Skipped row ${i + 1}: No email address`,
        })

        continue
      }

      try {
        // Update current status
        sendSSEMessage({
          type: "progress",
          total: csvData.length,
          sent,
          failed,
          currentEmail: email,
          message: `Sending to ${email}...`,
        })

        // Replace variables in content
        let content = emailTemplate.content
        let subject = emailTemplate.subject

        // Replace variables in subject and content
        // Support both {variable} and {{variable}} formats
        for (const [key, value] of Object.entries(row)) {
          const regex1 = new RegExp(`\\{${key}\\}`, "gi")
          const regex2 = new RegExp(`\\{\\{${key}\\}\\}`, "gi")
          subject = subject.replace(regex1, value as string)
          subject = subject.replace(regex2, value as string)
          content = content.replace(regex1, value as string)
          content = content.replace(regex2, value as string)
        }

        // Get image for this recipient
        const imageData = images[i]?.split(",")[1]

        if (!imageData) {
          throw new Error("Image data missing for this recipient")
        }

        // Send email
        await transporter.sendMail({
          from: `"${profile.senderName}" <${profile.senderEmail}>`,
          to: email,
          subject: subject,
          html: content,
          attachments: [
            {
              filename: "Certificate.png",
              content: imageData,
              encoding: "base64",
            },
          ],
        })

        sent++

        // Add slight delay to avoid overwhelming the email server
        await new Promise((resolve) => setTimeout(resolve, 200))

        sendSSEMessage({
          type: "progress",
          total: csvData.length,
          sent,
          failed,
          currentEmail: null,
          message: `Sent to ${email}`,
        })
      } catch (error) {
        console.error(`Error sending email to ${email}:`, error)
        failed++

        sendSSEMessage({
          type: "progress",
          total: csvData.length,
          sent,
          failed,
          currentEmail: null,
          message: `Failed to send to ${email}: ${error instanceof Error ? error.message : "Unknown error"}`,
        })
      }
    }

    // Send completion message
    sendSSEMessage({
      type: "complete",
      total: csvData.length,
      sent,
      failed,
      message: `Completed sending emails. Sent: ${sent}, Failed: ${failed}`,
    })
  } catch (error) {
    console.error("Error in background email sending:", error)

    // Send error message
    sendSSEMessage({
      type: "error",
      message: error instanceof Error ? error.message : "Failed to send emails",
    })
  }
}

