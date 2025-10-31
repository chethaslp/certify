import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"
import { NextAuthOptions } from "next-auth"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password")
        }

        // Check if user exists
        let user = await db.user.findUnique({
          where: { email: credentials.email },
        }) as any

        // If user doesn't exist, create a new account
        if (!user) {
          const hashedPassword = await bcrypt.hash(credentials.password, 10)
          user = await db.user.create({
            data: {
              email: credentials.email,
              password: hashedPassword,
              name: credentials.email.split("@")[0], // Use email prefix as name
            } as any,
          }) as any
          return user
        }

        // If user exists but has no password (OAuth user), reject
        if (!user.password) {
          throw new Error("Please sign in with Google")
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        if (!isPasswordValid) {
          throw new Error("Invalid email or password")
        }

        return user
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // On sign in, store the database user ID in the token
      if (user) {
        token.userId = user.id
      }
      return token
    },
    async session({ session, token }) {
      // Pass the database user ID from token to session
      if (session.user && token.userId) {
        session.user.id = token.userId as string
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }