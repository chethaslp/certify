import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get email profiles for the current user
    const profiles = await db.emailProfile.findMany({
      where: {
        userId: session.user.id as string,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ profiles })
  } catch (error) {
    console.error("Error fetching email profiles:", error)
    return NextResponse.json({ error: "Failed to fetch email profiles" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profileData = await request.json()

    // If this is set as default, remove default from other profiles
    if (profileData.isDefault) {
      await db.emailProfile.updateMany({
        where: {
          userId: session.user.id as string,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      })
    }

    // Create new email profile
    const profile = await db.emailProfile.create({
      data: {
        userId: session.user.id as string,
        profileName: profileData.profileName,
        smtpServer: profileData.smtpServer,
        smtpPort: profileData.smtpPort,
        smtpUsername: profileData.smtpUsername,
        smtpPassword: profileData.smtpPassword,
        senderEmail: profileData.senderEmail,
        senderName: profileData.senderName,
        isDefault: profileData.isDefault,
      },
    })

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("Error creating email profile:", error)
    return NextResponse.json({ error: "Failed to create email profile" }, { status: 500 })
  }
}

