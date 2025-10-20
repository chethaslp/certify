import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuthUserId } from "@/lib/auth"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await requireAuthUserId()
    const profileId = params.id

    // Check if profile exists and belongs to user
    const profile = await db.emailProfile.findFirst({
      where: {
        id: profileId,
        userId,
      },
    })

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Remove default from other profiles
    await db.emailProfile.updateMany({
      where: {
        userId,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    })

    // Set this profile as default
    await db.emailProfile.update({
      where: { id: profileId },
      data: { isDefault: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error("Error setting default email profile:", error)
    return NextResponse.json({ error: "Failed to set default email profile" }, { status: 500 })
  }
}

