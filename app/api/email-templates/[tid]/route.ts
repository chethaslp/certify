import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuthUserId } from "@/lib/auth"

export async function GET(
    request: Request,
    { params }: { params: { tid: string } }
  ) {
  try {
    const userId = await requireAuthUserId()
    const { tid } = params

    // Get email template
    const template = await db.emailTemplate.findFirst({
      where: { 
        id: tid,
        userId 
      }
    })

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    return NextResponse.json(template)
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error("Error fetching email template:", error)
    return NextResponse.json({ error: "Failed to fetch email template" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { tid: string } }
) {
  try {
    const userId = await requireAuthUserId()
    const { tid } = params

    // Check if email template exists and belongs to user
    const template = await db.emailTemplate.findFirst({
      where: {
        id: tid,
        userId,
      },
    })

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    // Delete the email template
    await db.emailTemplate.delete({
      where: { id: tid },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error("Error deleting email template:", error)
    return NextResponse.json({ error: "Failed to delete email template" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { tid: string } }
) {
  try {
    const userId = await requireAuthUserId()
    const { tid } = params
    const { name, subject, content } = await request.json()

    // Check if email template exists and belongs to user
    const existingTemplate = await db.emailTemplate.findFirst({
      where: {
        id: tid,
        userId,
      },
    })

    if (!existingTemplate) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    // Update email template
    const updatedTemplate = await db.emailTemplate.update({
      where: { id: tid },
      data: {
        name,
        subject,
        content,
      },
    })

    return NextResponse.json({ template: updatedTemplate })
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error("Error updating email template:", error)
    return NextResponse.json({ error: "Failed to update email template" }, { status: 500 })
  }
}