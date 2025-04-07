import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profileId = params.id

    // Check if profile exists and belongs to user
    const profile = await db.emailProfile.findUnique({
      where: {
        id: profileId,
        userId: session.user.id as string,
      },
    })

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // If this was the default profile, make another one default if available
    if (profile.isDefault) {
      const anotherProfile = await db.emailProfile.findFirst({
        where: {
          userId: session.user.id as string,
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
    console.error("Error deleting email profile:", error)
    return NextResponse.json({ error: "Failed to delete email profile" }, { status: 500 })
  }
}

