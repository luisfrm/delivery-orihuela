"use client"

import { useId, useRef, useState, type ChangeEvent, type DragEvent, type KeyboardEvent } from "react"
import Image from "next/image"
import { ImagePlus, X, AlertCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { useObjectURL } from "@/hooks/useObjectURL"
import {
  ACCEPTED_IMAGE_EXTENSIONS,
  formatFileSize,
  MAX_IMAGE_SIZE,
  validateImageFile,
} from "@/lib/file-validation"

export interface ImageUploadProps {
  label: string
  name: string
  value: File | null
  onChange: (file: File | null) => void
  error?: string
  disabled?: boolean
  aspectRatio?: "square" | "video" | "cover"
  helperText?: string
  maxSize?: number
  existingUrl?: string | null
}

const aspectClasses: Record<NonNullable<ImageUploadProps["aspectRatio"]>, string> = {
  square: "aspect-square",
  video: "aspect-video",
  cover: "aspect-[16/9]",
}

const sizeClasses = "max-h-32 sm:max-h-40"

export function ImageUpload({
  label,
  name,
  value,
  onChange,
  error,
  disabled = false,
  aspectRatio = "video",
  helperText,
  maxSize = MAX_IMAGE_SIZE,
  existingUrl = null,
}: ImageUploadProps) {
  const inputId = useId()
  const errorId = `${inputId}-error`
  const helperId = `${inputId}-helper`
  const inputRef = useRef<HTMLInputElement>(null)

  const [localError, setLocalError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const filePreviewUrl = useObjectURL(value)
  const displayUrl = filePreviewUrl ?? existingUrl ?? null
  const hasNewFile = value !== null
  const hasExistingImage = !hasNewFile && existingUrl != null

  const handleFile = (file: File | null) => {
    setLocalError(null)

    if (!file) {
      onChange(null)
      return
    }

    const validation = validateImageFile(file)
    if (!validation.valid) {
      setLocalError(validation.error ?? "Archivo no válido.")
      onChange(null)
      return
    }

    onChange(file)
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    handleFile(file)
    event.target.value = ""
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(false)
    if (disabled) return
    const file = event.dataTransfer.files?.[0] ?? null
    handleFile(file)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      inputRef.current?.click()
    }
  }

  const handleRemove = (event: React.MouseEvent) => {
    event.stopPropagation()
    if (disabled) return
    setLocalError(null)
    onChange(null)
  }

  const openFilePicker = () => {
    if (disabled) return
    inputRef.current?.click()
  }

  const displayedError = error ?? localError

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-on-surface"
        >
          {label}
        </label>
        <span className="text-label-md text-on-surface-variant">
          Máx {formatFileSize(maxSize)}
        </span>
      </div>

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={`Subir ${label.toLowerCase()}`}
        aria-describedby={
          displayedError ? errorId : helperText ? helperId : undefined
        }
        onClick={openFilePicker}
        onKeyDown={handleKeyDown}
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "group relative w-full cursor-pointer overflow-hidden rounded-lg border-2 border-dashed transition-colors",
          sizeClasses,
          aspectClasses[aspectRatio],
          isDragOver
            ? "border-primary bg-primary/5"
            : displayedError
              ? "border-destructive bg-destructive/5"
              : "border-outline-variant bg-surface-container-low hover:border-primary/60",
          disabled && "cursor-not-allowed opacity-60"
        )}
      >
        {displayUrl ? (
          <>
            <Image
              src={displayUrl}
              alt={label}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            {hasNewFile ? (
              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled}
                aria-label="Eliminar imagen"
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-on-surface shadow-sm transition-transform hover:scale-105 active:scale-95"
              >
                <X className="size-4" />
              </button>
            ) : null}
            {hasNewFile ? (
              <div className="absolute bottom-2 left-2 flex max-w-[calc(100%-3.5rem)] items-center gap-2 rounded-md bg-black/60 px-2 py-1 text-xs text-white">
                <span className="truncate font-medium">{value?.name}</span>
                <span className="shrink-0 opacity-80">
                  {value ? formatFileSize(value.size) : ""}
                </span>
              </div>
            ) : hasExistingImage ? (
              <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-md bg-black/60 px-2 py-1 text-xs text-white">
                <span className="font-medium">Imagen actual</span>
              </div>
            ) : null}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center text-on-surface-variant">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
              <ImagePlus className="size-5" />
            </div>
            <p className="text-body-md font-medium text-on-surface">
              Arrastra una imagen o haz click
            </p>
            <p className="text-label-md">
              JPG, PNG o WebP · hasta {formatFileSize(maxSize)}
            </p>
          </div>
        )}

        <input
          ref={inputRef}
          id={inputId}
          name={name}
          type="file"
          accept={ACCEPTED_IMAGE_EXTENSIONS}
          onChange={handleInputChange}
          disabled={disabled}
          aria-hidden="true"
          tabIndex={-1}
          className="sr-only"
        />
      </div>

      {helperText && !displayedError && (
        <p id={helperId} className="text-label-md text-on-surface-variant pl-1">
          {helperText}
        </p>
      )}

      {displayedError && (
        <p
          id={errorId}
          role="alert"
          className="flex items-center gap-1.5 text-label-md text-destructive pl-1"
        >
          <AlertCircle className="size-3.5 shrink-0" />
          {displayedError}
        </p>
      )}
    </div>
  )
}
