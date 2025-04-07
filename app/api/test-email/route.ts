import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import nodemailer from "nodemailer"

export async function POST(request: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { profile } = await request.json()

    if (!profile || !profile.smtpServer || !profile.smtpUsername) {
      return NextResponse.json({ error: "Invalid profile data" }, { status: 400 })
    }

    // Create test transporter
    const transporter = nodemailer.createTransport({
      host: profile.smtpServer,
      port: Number.parseInt(profile.smtpPort || "587"),
      secure: profile.smtpPort === "465",
      auth: {
        user: profile.smtpUsername,
        pass: profile.smtpPassword,
      },
    })

    // Verify connection
    await transporter.verify()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error testing email connection:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to test email connection",
      },
      { status: 500 },
    )
  }
}

