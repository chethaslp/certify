import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Get all templates
    const templates = await db.template.findMany({
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json({ templates })
  } catch (error) {
    console.error("Error fetching templates:", error)
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const templateData = await request.json()

    // Create new template
    const template = await db.template.create({
      data: {
        name: templateData.name,
        description: templateData.description || "",
        textFields: JSON.stringify(templateData.textFields),
        backgroundImage: templateData.backgroundImage,
        thumbnail: templateData.thumbnail,
      },
    })

    return NextResponse.json({ template })
  } catch (error) {
    console.error("Error creating template:", error)
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 })
  }
}

