import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import type { User } from "next-auth"

// In-memory user store for demo (replace with database in production)
const users = new Map<string, any>([
  ["demo@example.com", {
    id: "1",
    name: "Demo User",
    email: "demo@example.com",
    password: "demo123", // In production, use hashed passwords!
    knowledgeLevel: "intermediate",
    image: null,
  }],
]);

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      image?: string | null
      knowledgeLevel: "beginner" | "intermediate" | "advanced"
    }
  }

  interface User {
    id: string
    name: string
    email: string
    knowledgeLevel: "beginner" | "intermediate" | "advanced"
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials.email as string
        const password = credentials.password as string

        const user = users.get(email)

        if (!user || user.password !== password) {
          return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          knowledgeLevel: user.knowledgeLevel,
        } as User
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.knowledgeLevel = user.knowledgeLevel
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.knowledgeLevel = token.knowledgeLevel as "beginner" | "intermediate" | "advanced"
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production",
})

// Helper function to register new users
export function registerUser(email: string, password: string, name: string, knowledgeLevel: "beginner" | "intermediate" | "advanced" = "beginner") {
  const id = String(users.size + 1)
  const user = {
    id,
    name,
    email,
    password, // In production, hash this!
    knowledgeLevel,
    image: null,
  }
  users.set(email, user)
  return user
}
