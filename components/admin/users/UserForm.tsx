"use client"

import { useId, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User as UserIcon,
  UserPlus,
  Users as UsersIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { PhoneInput } from "@/components/ui/phone-input"
import { Select } from "@/components/ui/select"
import { UserRoleBadge } from "./UserRoleBadge"
import {
  validateEmail,
  validateMaxLength,
  validateMinLength,
  validatePassword,
  validatePhone,
  validateRequired,
  validateConfirmPassword,
} from "@/lib/validation"
import { capitalize } from "@/lib/utils"
import { createStaffUser, updateUser } from "@/lib/actions/users"
import type { StaffRole, UserRole, UserWithProfile } from "@/lib/types"
import { getFullName } from "@/lib/users/format"

type Step = "info" | "access" | "preview" | "success"

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  role: UserRole
  password: string
  confirmPassword: string
}

type ErrorMap = Partial<Record<keyof FormData, string>>

const STEP_TITLES: Record<Step, { title: string; subtitle: string }> = {
  info: { title: "Información", subtitle: "Datos personales" },
  access: { title: "Acceso", subtitle: "Rol y credenciales" },
  preview: { title: "Vista previa", subtitle: "Confirma los datos" },
  success: { title: "Listo", subtitle: "Usuario creado" },
}

const STEP_ORDER: Step[] = ["info", "access", "preview", "success"]

const MAX_NAME = 60
const MAX_EMAIL = 100

const ROLE_OPTIONS = [
  { value: "admin", label: "Administrador" },
  { value: "rider", label: "Repartidor" },
  { value: "user", label: "Cliente" },
]

const STAFF_ROLE_OPTIONS = ROLE_OPTIONS.filter((o) => o.value !== "user")

interface UserFormProps {
  mode: "create" | "edit"
  user?: UserWithProfile
  onClose: () => void
  onSaved?: (user: UserWithProfile) => void
}

export function UserForm({ mode, user, onClose, onSaved }: UserFormProps) {
  const router = useRouter()
  const formId = useId()
  const isEditing = mode === "edit"
  const editingUser = isEditing ? user : undefined

  const [step, setStep] = useState<Step>("info")
  const [formData, setFormData] = useState<FormData>(() => {
    if (isEditing && editingUser) {
      return {
        firstName: editingUser.first_name,
        lastName: editingUser.last_name,
        email: editingUser.email,
        phone: editingUser.phone,
        role: editingUser.role,
        password: "",
        confirmPassword: "",
      }
    }
    return {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "rider",
      password: "",
      confirmPassword: "",
    }
  })
  const [errors, setErrors] = useState<ErrorMap>({})
  const [generalError, setGeneralError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalSteps = 3 // info, access, preview

  const updateField = <K extends keyof FormData>(name: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const validateInfoStep = (): boolean => {
    const newErrors: ErrorMap = {
      firstName:
        validateRequired(formData.firstName, "El nombre") ||
        validateMinLength(formData.firstName, 2, "El nombre") ||
        validateMaxLength(formData.firstName, MAX_NAME, "El nombre"),
      lastName:
        validateRequired(formData.lastName, "El apellido") ||
        validateMinLength(formData.lastName, 2, "El apellido") ||
        validateMaxLength(formData.lastName, MAX_NAME, "El apellido"),
      email:
        validateRequired(formData.email, "El correo") ||
        validateMaxLength(formData.email, MAX_EMAIL, "El correo") ||
        validateEmail(formData.email),
      phone: validatePhone(formData.phone),
    }
    setErrors(newErrors)
    return !Object.values(newErrors).some((e) => e)
  }

  const validateAccessStep = (): boolean => {
    const newErrors: ErrorMap = {}
    if (!formData.role) {
      newErrors.role = "Selecciona un rol."
    }
    if (!isEditing) {
      newErrors.password =
        validateRequired(formData.password, "La contraseña") ||
        validatePassword(formData.password, 8, true)
      newErrors.confirmPassword =
        validateRequired(formData.confirmPassword, "Confirma la contraseña") ||
        validateConfirmPassword(formData.confirmPassword, formData.password)
    }
    setErrors(newErrors)
    return !Object.values(newErrors).some((e) => e)
  }

  const handleNext = () => {
    setGeneralError("")
    if (step === "info") {
      if (!validateInfoStep()) return
      setStep("access")
    } else if (step === "access") {
      if (!validateAccessStep()) return
      setStep("preview")
    }
  }

  const handleBack = () => {
    setGeneralError("")
    if (step === "access") setStep("info")
    else if (step === "preview") setStep("access")
  }

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "rider",
      password: "",
      confirmPassword: "",
    })
    setErrors({})
    setGeneralError("")
    setStep("info")
  }

  const handleSubmit = async () => {
    setGeneralError("")
    setIsSubmitting(true)

    const toastId = toast.loading(
      isEditing ? "Guardando cambios..." : "Creando usuario..."
    )

    try {
      const firstName = capitalize(formData.firstName)
      const lastName = capitalize(formData.lastName)
      const phone = formData.phone.trim()

      if (isEditing && editingUser) {
        const result = await updateUser(editingUser.id, {
          firstName,
          lastName,
          phone,
          role: formData.role,
        })
        if (result.error) {
          toast.error(result.error, { id: toastId })
          setGeneralError(result.error)
          setIsSubmitting(false)
          return
        }
        toast.success("Cambios guardados", { id: toastId })
        onSaved?.(result.user!)
        router.refresh()
        onClose()
      } else {
        const result = await createStaffUser({
          firstName,
          lastName,
          email: formData.email.trim().toLowerCase(),
          phone,
          password: formData.password,
          role: formData.role as StaffRole,
        })
        if (result.error) {
          toast.error(result.error, { id: toastId })
          setGeneralError(result.error)
          setIsSubmitting(false)
          return
        }
        toast.success("Usuario creado exitosamente", { id: toastId })
        onSaved?.(result.user!)
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("user-created", { detail: result.user }))
        }
        router.refresh()
        setStep("success")
      }
    } catch {
      toast.error("Ocurrió un error inesperado", { id: toastId })
      setGeneralError("Ocurrió un error inesperado. Intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // ─── SUCCESS (only in create mode) ───────────────────────────────────
  if (step === "success" && mode === "create") {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
          <CheckCircle2 className="size-8 text-green-700 dark:text-green-300" />
        </div>
        <div className="space-y-1">
          <h2 className="text-headline-md font-bold text-on-surface">
            ¡Usuario creado!
          </h2>
          <p className="text-body-md text-on-surface-variant">
            {getFullName(formData.firstName, formData.lastName)} ya puede
            iniciar sesión con su correo y contraseña.
          </p>
        </div>
        <div className="mt-2 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            type="button"
            variant="primary"
            size="default"
            onClick={resetForm}
            className="w-full sm:w-auto"
          >
            <UserPlus className="size-4" />
            Crear otro
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="default"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cerrar
          </Button>
        </div>
      </div>
    )
  }

  // ─── PREVIEW ──────────────────────────────────────────────────────────
  if (step === "preview") {
    return (
      <div className="space-y-6 py-2">
        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
          <h3 className="text-label-lg font-semibold text-on-surface-variant">
            Datos personales
          </h3>
          <dl className="mt-3 space-y-3 text-body-md">
            <PreviewItem
              icon={<UserIcon className="size-4" />}
              label="Nombre completo"
              value={getFullName(formData.firstName, formData.lastName)}
            />
            {!isEditing && (
              <PreviewItem
                icon={<Mail className="size-4" />}
                label="Correo"
                value={formData.email}
              />
            )}
            <PreviewItem
              icon={<Phone className="size-4" />}
              label="Teléfono"
              value={formData.phone}
            />
          </dl>
        </div>

        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
          <h3 className="text-label-lg font-semibold text-on-surface-variant">
            Acceso
          </h3>
          <div className="mt-3 flex flex-col gap-3 text-body-md">
            <div className="flex items-center gap-3">
              {formData.role === "admin" ? (
                <ShieldCheck className="size-4 text-primary" />
              ) : formData.role === "rider" ? (
                <UsersIcon className="size-4 text-amber-700" />
              ) : (
                <UserIcon className="size-4 text-on-surface-variant" />
              )}
              <span className="text-on-surface-variant">Rol:</span>
              <UserRoleBadge role={formData.role} />
            </div>
            {!isEditing && (
              <PreviewItem
                icon={<Lock className="size-4" />}
                label="Contraseña"
                value="••••••••"
                mono
              />
            )}
          </div>
        </div>

        {isEditing && formData.role !== user!.role && (
          <div className="rounded-lg border border-warning/30 bg-warning/5 p-3 text-body-md text-on-surface-variant">
            <strong className="text-warning">Atención:</strong> el usuario
            deberá cerrar y volver a iniciar sesión para que el cambio de rol
            surta efecto.
          </div>
        )}

        {generalError && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {generalError}
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            size="default"
            onClick={handleBack}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="size-4" />
            Atrás
          </Button>
          <Button
            type="button"
            variant="primary"
            size="default"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting
              ? "Guardando..."
              : isEditing
                ? "Guardar cambios"
                : "Crear usuario"}
          </Button>
        </div>
      </div>
    )
  }

  // ─── FORM STEPS (info / access) ───────────────────────────────────────
  const stepIndex = step === "success" ? STEP_ORDER.indexOf("preview") : STEP_ORDER.indexOf(step)

  return (
    <div className="space-y-6 py-2">
      <div
        className="flex items-center gap-2"
        role="status"
        aria-live="polite"
      >
        <span className="text-label-md font-semibold text-primary">
          Paso {stepIndex + 1} de {totalSteps}
        </span>
        <span className="text-label-md text-on-surface-variant">
          · {STEP_TITLES[step].title}
        </span>
      </div>

      {generalError && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {generalError}
        </div>
      )}

      {step === "info" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <FormField
              label="Nombre"
              name={`${formId}-firstName`}
              placeholder="Ej. Luis"
              value={formData.firstName}
              onChange={(v) => updateField("firstName", v)}
              error={errors.firstName}
              maxLength={MAX_NAME}
              icon={<UserIcon className="size-4" />}
            />
            <FormField
              label="Apellido"
              name={`${formId}-lastName`}
              placeholder="Ej. García"
              value={formData.lastName}
              onChange={(v) => updateField("lastName", v)}
              error={errors.lastName}
              maxLength={MAX_NAME}
              icon={<UserIcon className="size-4" />}
            />
          </div>

          <FormField
            label="Correo electrónico"
            name={`${formId}-email`}
            type="email"
            placeholder="usuario@ejemplo.com"
            value={formData.email}
            onChange={(v) => updateField("email", v)}
            error={errors.email}
            maxLength={MAX_EMAIL}
            disabled={isEditing}
            icon={<Mail className="size-4" />}
          />
          {isEditing && (
            <p className="text-label-md text-on-surface-variant pl-1">
              El correo no se puede modificar.
            </p>
          )}

          <PhoneInput
            value={formData.phone}
            onChange={(v) => updateField("phone", v)}
            error={errors.phone}
            required
          />
        </div>
      )}

      {step === "access" && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor={`${formId}-role`}
              className="text-label-lg text-on-surface pl-1 font-medium"
            >
              Rol
            </label>
            <Select
              options={isEditing ? ROLE_OPTIONS : STAFF_ROLE_OPTIONS}
              value={formData.role}
              onChange={(v) => updateField("role", v as UserRole)}
              className="w-full"
            />
            {errors.role && (
              <p className="text-label-md text-destructive pl-1">
                {errors.role}
              </p>
            )}
            <p className="text-label-md text-on-surface-variant pl-1">
              Los administradores tienen acceso completo al panel. Los
              repartidores gestionan pedidos asignados. Los clientes son
              usuarios finales que usan la app para hacer pedidos.
            </p>
          </div>

          {!isEditing && (
            <>
              <FormField
                label="Contraseña"
                name={`${formId}-password`}
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={formData.password}
                onChange={(v) => updateField("password", v)}
                error={errors.password}
                icon={<Lock className="size-4" />}
              />
              <FormField
                label="Confirmar contraseña"
                name={`${formId}-confirmPassword`}
                type="password"
                placeholder="Repite la contraseña"
                value={formData.confirmPassword}
                onChange={(v) => updateField("confirmPassword", v)}
                error={errors.confirmPassword}
                icon={<Lock className="size-4" />}
              />
              <PasswordHints password={formData.password} />
            </>
          )}

          {isEditing && (
            <div className="rounded-lg border border-outline-variant bg-surface-container p-3 text-body-md text-on-surface-variant">
              <p className="font-semibold text-on-surface flex items-center gap-2">
                <Lock className="size-4" />
                Contraseña
              </p>
              <p className="mt-1">
                La contraseña no se puede cambiar desde esta pantalla. El
                usuario puede actualizarla desde su perfil.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-between">
        {step === "info" ? (
          <div />
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="default"
            onClick={handleBack}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="size-4" />
            Atrás
          </Button>
        )}
        <Button
          type="button"
          variant="primary"
          size="default"
          onClick={handleNext}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          Siguiente
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}

interface PreviewItemProps {
  icon: React.ReactNode
  label: string
  value: string
  mono?: boolean
}

function PreviewItem({ icon, label, value, mono }: PreviewItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <dt className="text-label-md text-on-surface-variant">{label}</dt>
        <dd
          className={
            mono
              ? "text-on-surface font-mono"
              : "text-on-surface break-words"
          }
        >
          {value}
        </dd>
      </div>
    </div>
  )
}

function PasswordHints({ password }: { password: string }) {
  if (!password) return null
  const hasMin = password.length >= 8
  const hasUpper = /[A-Z]/.test(password)
  const hasSymbol = /[0-9!@#$%^&*]/.test(password)
  return (
    <div className="space-y-1 pl-1">
      <Hint met={hasMin} label="Mínimo 8 caracteres" />
      <Hint met={hasUpper} label="1 letra mayúscula" />
      <Hint met={hasSymbol} label="1 número o símbolo" />
    </div>
  )
}

function Hint({ met, label }: { met: boolean; label: string }) {
  return (
    <p
      className={
        met
          ? "text-label-md text-green-600 dark:text-green-400"
          : "text-label-md text-on-surface-variant"
      }
    >
      {met ? "✓" : "○"} {label}
    </p>
  )
}
