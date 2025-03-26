import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: Request) {
  try {
    const { settings, template, recipients } = await request.json()

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: settings.smtpServer,
      port: Number.parseInt(settings.smtpPort),
      secure: settings.smtpPort === "465",
      auth: {
        user: settings.smtpUsername,
        pass: settings.smtpPassword,
      },
    })

    let sent = 0
    let failed = 0

    // Send emails to each recipient
    for (const recipient of recipients) {
      try {
        // Skip if no email address
        if (!recipient.email) {
          failed++
          continue
        }

        // Replace variables in content
        let content = template.content
        let subject = template.subject

        // Replace variables in subject and content
        for (const [key, value] of Object.entries(recipient.data)) {
          const regex = new RegExp(`{{${key}}}`, "g")
          subject = subject.replace(regex, value as string)
          content = content.replace(regex, value as string)
        }

        // Convert image data URL to attachment
        const imageData = recipient.imageUrl.split(",")[1]

        // Send email
        await transporter.sendMail({
          from: `"${settings.senderName}" <${settings.senderEmail}>`,
          to: recipient.email,
          subject: subject,
          html: content,
          attachments: [
            {
              filename: "generated-image.png",
              content: imageData,
              encoding: "base64",
            },
          ],
        })

        sent++
      } catch (error) {
        console.error(`Error sending email to ${recipient.email}:`, error)
        failed++
      }
    }

    return NextResponse.json({ sent, failed })
  } catch (error) {
    console.error("Error sending emails:", error)
    return NextResponse.json({ error: "Failed to send emails" }, { status: 500 })
  }
}

