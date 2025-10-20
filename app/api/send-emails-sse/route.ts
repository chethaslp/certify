import { type NextRequest, NextResponse } from "next/server"
import { requireAuthUserId } from "@/lib/auth"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    await requireAuthUserId()

    const profileId = request.nextUrl.searchParams.get("profileId")
    const templateId = request.nextUrl.searchParams.get("templateId")
    const emailColumn = request.nextUrl.searchParams.get("emailColumn")

    if (!profileId || !templateId || !emailColumn) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

  // Set up stream response
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      // Store the controller for later use
      ;(global as any).sseController = controller

      // Send initial message
      const message = {
        type: "connected",
        message: "SSE connection established",
      }
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(message)}\n\n`))
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Failed to establish SSE connection" }, { status: 500 })
  }
}

// This function will be called from the main API endpoint
export const sendSSEMessage = (message: any) => {
  const controller = (global as any).sseController
  if (controller) {
    const encoder = new TextEncoder()
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(message)}\n\n`))
  }
}

