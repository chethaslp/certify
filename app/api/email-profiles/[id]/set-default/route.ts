import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"

export async function POST(request: Request, { params }: { params: { id: string } }) {
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

    // Remove default from other profiles
    await db.emailProfile.updateMany({
      where: {
        userId: session.user.id as string,
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
    console.error("Error setting default email profile:", error)
    return NextResponse.json({ error: "Failed to set default email profile" }, { status: 500 })
  }
}

