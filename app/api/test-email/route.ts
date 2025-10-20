import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { requireAuthUserId } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    // Verify user is authenticated
    await requireAuthUserId()

    const { profile } = await request.json()

    if (!profile || !profile.smtpServer || !profile.smtpUsername) {
      return NextResponse.json({ error: "Invalid profile data" }, { status: 400 })
    }

    // Create test transporter
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

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error("Error testing email connection:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to test email connection",
      },
      { status: 500 },
    )
  }
}

