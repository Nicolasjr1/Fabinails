import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth/auth"
import { AdminLoginForm } from "@/components/admin-login-form"

export const dynamic = "force-dynamic"

export default async function AdminLoginPage() {
  const session = await getServerSession(authOptions)
  if (session) {
    redirect("/admin")
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-beige-50 px-4 py-14 font-body antialiased">
      <AdminLoginForm />
    </main>
  )
}
