import type { NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

declare module "next-auth" {
  interface User {
    id: string
    name?: string | null
    email?: string | null
    role?: "admin" | "user"
  }

  interface Session {
    user: User & {
      role: "admin" | "user"
    }
  }
}

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET não configurado — defina no .env")
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/admin/login",
    signOut: "/admin/logout",
    error: "/admin/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Usuário", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const adminUser = process.env.ADMIN_USER
        const adminHash = process.env.ADMIN_PASSWORD_HASH
        if (!adminUser || !adminHash) {
          console.error("ADMIN_USER / ADMIN_PASSWORD_HASH não configurados")
          return null
        }
        if (!credentials?.username || !credentials?.password) return null
        if (credentials.username !== adminUser) return null
        const ok = await bcrypt.compare(credentials.password, adminHash)
        if (!ok) return null
        return {
          id: "1",
          name: "Fabi",
          email: "fabi@fabinails.com",
          role: "admin",
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token?.role && session.user) {
        ;(session.user as { role: string }).role = token.role as string
      }
      return session
    },
    async jwt({ token, user }) {
      if (user?.role) {
        token.role = user.role as string
      }
      return token
    },
  },
}