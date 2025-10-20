import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuthUserId } from "@/lib/auth"

export async function POST(request: Request, { params }: { params: { id: string } }) {
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

    const { csvData } = await request.json()

    if (!csvData || !Array.isArray(csvData) || csvData.length === 0) {
      return NextResponse.json({ error: "CSV data is required" }, { status: 400 })
    }

    // Parse text fields from JSON string
    const textFields = JSON.parse(template.textFields)

    // Generate images using the canvas on the server
    const { createCanvas, loadImage } = require("canvas")

    const CANVAS_WIDTH = 800
    const CANVAS_HEIGHT = 500

    const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT)
    const ctx = canvas.getContext("2d")

    // Load background image
    const backgroundImage = await loadImage(template.backgroundImage)

    const images: string[] = []

    // Generate an image for each CSV row
    for (const row of csvData) {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw background
      ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height)

      // Draw text fields with data from CSV
      for (const field of textFields) {
        ctx.font = `${field.fontSize}px ${field.fontFamily}`
        ctx.fillStyle = field.color
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        // Replace text with CSV data if available
        const fieldName = field.text.trim()
        const text = row[fieldName] || field.text

        ctx.fillText(text, field.x, field.y)
      }

      // Convert to data URL
      const dataUrl = canvas.toDataURL("image/png")
      images.push(dataUrl)
    }

    return NextResponse.json({ images })
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error("Error generating images:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate images",
      },
      { status: 500 },
    )
  }
}

