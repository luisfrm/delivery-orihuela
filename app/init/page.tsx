"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function InitPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const supabase = createClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    })

    if (error) {
      setMessage({ type: "error", text: error.message })
    } else if (data.user) {
      setMessage({ type: "success", text: "Usuario creado. Ahora necesitas iniciar sesión." })
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-xl p-8 shadow-lg border border-outline-variant">
          <h1 className="text-headline-lg font-bold text-on-surface text-center mb-2">Bootstrapping</h1>
          <p className="text-body-md text-on-surface-variant text-center mb-6">
            Crea el primer usuario administrador
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-on-surface">Nombre</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full mt-1 h-10 px-3 rounded-lg border border-border bg-background text-sm"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-on-surface">Apellido</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full mt-1 h-10 px-3 rounded-lg border border-border bg-background text-sm"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-on-surface">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 h-10 px-3 rounded-lg border border-border bg-background text-sm"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-on-surface">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 h-10 px-3 rounded-lg border border-border bg-background text-sm"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-lg bg-primary text-white font-bold text-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Creando..." : "Crear Admin"}
            </button>
          </form>

          {message && (
            <div
              className={`mt-4 p-4 rounded-lg text-sm ${
                message.type === "error" ? "bg-error-container text-on-error-container" : "bg-primary-container text-on-primary-container"
              }`}
            >
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}