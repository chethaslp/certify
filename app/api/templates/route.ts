import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuthUserId } from "@/lib/auth"

export async function GET() {
  try {
    const userId = await requireAuthUserId()

    // Get all templates for the user
    const templates = await db.template.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json({ templates })
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error("Error fetching templates:", error)
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireAuthUserId()
    const templateData = await request.json()

    // Create new template
    const template = await db.template.create({
      data: {
        userId,
        name: templateData.name,
        description: templateData.description || "",
        textFields: JSON.stringify(templateData.textFields),
        backgroundImage: templateData.backgroundImage,
        thumbnail: templateData.thumbnail,
      },
    })

    return NextResponse.json({ template })
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error("Error creating template:", error)
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 })
  }
}

