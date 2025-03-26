import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
    request: Request,
    { params }: { params: { tid: string } }
  ) {
    const { tid } = params;
  try {
    // Get all email templates
    const template = await db.emailTemplate.findFirst({
      where: { id: tid }
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error("Error fetching email templates:", error)
    return NextResponse.json({ error: "Failed to fetch email templates" }, { status: 500 })
  }
}