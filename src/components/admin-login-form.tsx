"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Crown } from "lucide-react"

export function AdminLoginForm() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await signIn("credentials", {
        username,
        password,
        redirect: false,
      })
      if (res?.ok) {
        router.push("/admin")
        router.refresh()
      } else {
        setError("Usuário ou senha inválidos")
      }
    } catch {
      setError("Erro ao tentar entrar. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-3xl border border-beige-200 bg-white p-8 shadow-xl shadow-maroon-900/10 md:p-10">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-maroon-900 text-rose-200">
          <Crown className="h-7 w-7" />
        </span>
        <h1 className="mt-5 text-center font-display text-2xl font-semibold text-maroon-900">
          Área da Fabi
        </h1>
        <p className="mt-1 text-center text-sm text-beige-500">
          Entre para ver e gerenciar os agendamentos
        </p>

        {error && (
          <p className="mt-5 rounded-xl bg-rose-100 px-4 py-3 text-center text-sm text-rose-700">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-beige-700">
              Usuário
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-beige-200 bg-beige-50 px-4 py-3 text-beige-900 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-beige-700">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-beige-200 bg-beige-50 px-4 py-3 text-beige-900 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-maroon-900 px-7 py-3.5 text-sm font-semibold text-beige-50 shadow-xl shadow-maroon-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-maroon-800 disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  )
}
