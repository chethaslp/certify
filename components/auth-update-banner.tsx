import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"

export function AuthUpdateBanner() {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  return (
    <Alert className="mb-4 border-yellow-500 bg-yellow-50">
      <AlertTitle className="text-yellow-800 font-semibold">
        🔒 Security Update Required
      </AlertTitle>
      <AlertDescription className="text-yellow-700">
        <p className="mb-2">
          We've updated our authentication system for better security. 
          Please sign out and sign in again to continue using the application.
        </p>
        <Button 
          onClick={handleSignOut}
          variant="outline"
          className="mt-2"
        >
          Sign Out Now
        </Button>
      </AlertDescription>
    </Alert>
  )
}
