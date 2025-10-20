import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuthUserId } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const userId = await requireAuthUserId()

    // Get email profiles for the current user
    const profiles = await db.emailProfile.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ profiles })
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error("Error fetching email profiles:", error)
    return NextResponse.json({ error: "Failed to fetch email profiles" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireAuthUserId()

    console.log("Creating email profile for user:", userId)

    // Parse and validate JSON body
    let profileData: any
    try {
      profileData = await request.json()
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    if (!profileData || typeof profileData !== "object") {
      return NextResponse.json({ error: "Request body must be an object" }, { status: 400 })
    }

    const requiredFields = [
      "profileName",
      "smtpServer",
      "smtpPort",
      "smtpUsername",
      "smtpPassword",
      "senderEmail",
      "senderName",
    ] as const

    for (const field of requiredFields) {
      if (!profileData[field] || typeof profileData[field] !== "string") {
        return NextResponse.json({ error: `Missing or invalid field: ${field}` }, { status: 400 })
      }
    }

    // Normalize/Defaults
    const isDefault = Boolean(profileData.isDefault)
    const smtpPortStr = String(profileData.smtpPort)

    // If this is set as default, remove default from other profiles
    if (isDefault) {
      await db.emailProfile.updateMany({
        where: {
          userId,
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
        userId,
        profileName: profileData.profileName,
        smtpServer: profileData.smtpServer,
        smtpPort: smtpPortStr,
        smtpUsername: profileData.smtpUsername,
        smtpPassword: profileData.smtpPassword,
        senderEmail: profileData.senderEmail,
        senderName: profileData.senderName,
        isDefault: isDefault,
      },
    })

    return NextResponse.json({ success: true, profile })
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const message = error instanceof Error ? error.message : String(error)
    console.error("Error creating email profile:", { message })
    return NextResponse.json({ error: message || "Failed to create email profile" }, { status: 500 })
  }
}

