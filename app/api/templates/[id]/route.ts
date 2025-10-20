import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuthUserId } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await requireAuthUserId()
    const templateId = params.id

    // Get template
    const template = await db.template.findFirst({
      where: {
        id: templateId,
        userId,
      },
    })

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    // Parse text fields before returning
    const parsedTemplate = {
      ...template,
      textFields: JSON.parse(template.textFields),
    }

    return NextResponse.json({ template: parsedTemplate })
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error("Error fetching template:", error)
    return NextResponse.json({ error: "Failed to fetch template" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await requireAuthUserId()
    const templateId = params.id

    // Check if template exists and belongs to user
    const template = await db.template.findFirst({
      where: {
        id: templateId,
        userId,
      },
    })

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    // Delete the template
    await db.template.delete({
      where: { id: templateId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error("Error deleting template:", error)
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await requireAuthUserId()
    const templateId = params.id
    const templateData = await request.json()

    // Check if template exists and belongs to user
    const existingTemplate = await db.template.findFirst({
      where: {
        id: templateId,
        userId,
      },
    })

    if (!existingTemplate) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    // Update template
    const updatedTemplate = await db.template.update({
      where: { id: templateId },
      data: {
        name: templateData.name,
        description: templateData.description || "",
        textFields: JSON.stringify(templateData.textFields),
        backgroundImage: templateData.backgroundImage,
        thumbnail: templateData.thumbnail,
      },
    })

    return NextResponse.json({ template: updatedTemplate })
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error("Error updating template:", error)
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 })
  }
}

