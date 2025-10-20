import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuthUserId } from "@/lib/auth"

export async function GET() {
  try {
    const userId = await requireAuthUserId()

    // Get all email templates for the user
    const templates = await db.emailTemplate.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json({ templates })
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error("Error fetching email templates:", error)
    return NextResponse.json({ error: "Failed to fetch email templates" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireAuthUserId()
    const { name, subject, content } = await request.json()

    // Create new email template
    const template = await db.emailTemplate.create({
      data: {
        userId,
        name,
        subject,
        content,
      },
    })

    return NextResponse.json({ template })
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error("Error creating email template:", error)
    return NextResponse.json({ error: "Failed to create email template" }, { status: 500 })
  }
}

