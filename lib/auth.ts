import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

/**
 * Get the authenticated user's database ID from the session
 * @returns The user ID if authenticated, null otherwise
 */
export async function getAuthUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions)
  return session?.user?.id ?? null
}

/**
 * Get the authenticated user's database ID, throwing if not authenticated
 * @throws Error if user is not authenticated
 * @returns The user ID
 */
export async function requireAuthUserId(): Promise<string> {
  const userId = await getAuthUserId()
  if (!userId) {
    throw new Error("Unauthorized: User not authenticated")
  }
  return userId
}

/**
 * Get the full session
 */
export async function getAuth() {
  return getServerSession(authOptions)
}
