import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const templateId = params.id

    // Get template
    const template = await db.template.findUnique({
      where: {
        id: templateId,
        userId: session.user.id as string,
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
    console.error("Error fetching template:", error)
    return NextResponse.json({ error: "Failed to fetch template" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const templateId = params.id

    // Check if template exists and belongs to user
    const template = await db.template.findUnique({
      where: {
        id: templateId,
        userId: session.user.id as string,
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
    console.error("Error deleting template:", error)
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const templateId = params.id
    const templateData = await request.json()

    // Check if template exists and belongs to user
    const existingTemplate = await db.template.findUnique({
      where: {
        id: templateId,
        userId: session.user.id as string,
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
    console.error("Error updating template:", error)
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 })
  }
}

