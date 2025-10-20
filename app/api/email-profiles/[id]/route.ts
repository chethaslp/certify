import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuthUserId } from "@/lib/auth"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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

    // If this was the default profile, make another one default if available
    if (profile.isDefault) {
      const anotherProfile = await db.emailProfile.findFirst({
        where: {
          userId,
          id: { not: profileId },
        },
      })

      if (anotherProfile) {
        await db.emailProfile.update({
          where: { id: anotherProfile.id },
          data: { isDefault: true },
        })
      }
    }

    // Delete the profile
    await db.emailProfile.delete({
      where: { id: profileId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error("Error deleting email profile:", error)
    return NextResponse.json({ error: "Failed to delete email profile" }, { status: 500 })
  }
}

