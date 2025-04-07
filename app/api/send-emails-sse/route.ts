import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const session = await getServerSession()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

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
}

// This function will be called from the main API endpoint
export const sendSSEMessage = (message: any) => {
  const controller = (global as any).sseController
  if (controller) {
    const encoder = new TextEncoder()
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(message)}\n\n`))
  }
}

