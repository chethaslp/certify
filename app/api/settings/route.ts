import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Get settings from database
    const settings = await db.settings.findFirst()

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { settings } = await request.json()

    // Update or create settings
    const updatedSettings = await db.settings.upsert({
      where: { id: 1 }, // Assuming there's only one settings record
      update: settings,
      create: {
        ...settings,
        id: 1,
      },
    })

    return NextResponse.json({ settings: updatedSettings })
  } catch (error) {
    console.error("Error saving settings:", error)
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
  }
}

