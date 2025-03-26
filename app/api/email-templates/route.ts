import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Get all email templates
    const templates = await db.emailTemplate.findMany({
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json({ templates })
  } catch (error) {
    console.error("Error fetching email templates:", error)
    return NextResponse.json({ error: "Failed to fetch email templates" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, subject, content } = await request.json()

    // Create new email template
    const template = await db.emailTemplate.create({
      data: {
        name,
        subject,
        content,
      },
    })

    return NextResponse.json({ template })
  } catch (error) {
    console.error("Error creating email template:", error)
    return NextResponse.json({ error: "Failed to create email template" }, { status: 500 })
  }
}

