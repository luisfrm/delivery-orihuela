"use client"

import { useState } from "react"
import { LogIn, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LoginModal } from "@/components/modal/LoginModal"
import { RegistrationModal } from "@/components/modal/RegistrationModal"

export function GuestNav() {
  const [loginOpen, setLoginOpen] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)

  return (
    <div className="flex flex-col gap-[10px] w-full px-[20px] py-[14px]">
      <LoginModal
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onRegisterClick={() => {
          setLoginOpen(false)
          setRegisterOpen(true)
        }}
        trigger={
          <Button variant="primary" size="xl" className="w-full">
            <LogIn className="w-4 h-4" />
            Iniciar sesión
          </Button>
        }
      />
      <RegistrationModal
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        onLoginClick={() => {
          setRegisterOpen(false)
          setLoginOpen(true)
        }}
        trigger={
          <Button variant="secondary" size="xl" className="w-full">
            <UserPlus className="w-4 h-4" />
            Registrarse
          </Button>
        }
      />
    </div>
  )
}
