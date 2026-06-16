"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useIsMobile";

/* ─────────────────────────────────────────────
	 Context
───────────────────────────────────────────── */
interface ResponsiveModalContextValue {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	isMobile: boolean;
}

const ResponsiveModalContext =
	React.createContext<ResponsiveModalContextValue | null>(null);

function useResponsiveModal() {
	const ctx = React.useContext(ResponsiveModalContext);
	if (!ctx)
		throw new Error(
			"useResponsiveModal must be used within <ResponsiveModal />"
		);
	return ctx;
}

/* ─────────────────────────────────────────────
	 Root
───────────────────────────────────────────── */
interface ResponsiveModalProps {
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	children: React.ReactNode;
}

function ResponsiveModal({
	open: controlledOpen,
	defaultOpen = false,
	onOpenChange,
	children,
}: ResponsiveModalProps) {
	const [uncontrolledOpen, setUncontrolledOpen] =
		React.useState(defaultOpen);
	const isMobile = useIsMobile();

	const isOpen = controlledOpen ?? uncontrolledOpen;
	const handleOpenChange = React.useCallback(
		(next: boolean) => {
			setUncontrolledOpen(next);
			onOpenChange?.(next);
		},
		[onOpenChange]
	);

	return (
		<ResponsiveModalContext.Provider
			value={{ open: isOpen, onOpenChange: handleOpenChange, isMobile }}
		>
			<DialogPrimitive.Root open={isOpen} onOpenChange={handleOpenChange}>
				{children}
			</DialogPrimitive.Root>
		</ResponsiveModalContext.Provider>
	);
}

/* ─────────────────────────────────────────────
	 Trigger (re-export)
───────────────────────────────────────────── */
const ResponsiveModalTrigger = DialogPrimitive.Trigger;

/* ─────────────────────────────────────────────
	 Close (re-export)
───────────────────────────────────────────── */
const ResponsiveModalClose = DialogPrimitive.Close;

/* ─────────────────────────────────────────────
	 Content  — swaps between Dialog and Sheet
───────────────────────────────────────────── */
interface ResponsiveModalContentProps {
	/** Icon shown at the left of the header */
	icon?: React.ReactNode;
	/** Modal/sheet title */
	title: React.ReactNode;
	/** Optional subtitle / step indicator below the title */
	subtitle?: React.ReactNode;
	/** Body content */
	children: React.ReactNode;
	className?: string;
	/** Max width for desktop modal (Tailwind class, e.g. "max-w-md") */
	desktopMaxWidth?: string;
}

function ResponsiveModalContent({
	icon,
	title,
	subtitle,
	children,
	className,
	desktopMaxWidth = "max-w-md",
}: ResponsiveModalContentProps) {
	const { isMobile, onOpenChange } = useResponsiveModal();

/* ── drag-to-close state (mobile only) ── */
	const sheetRef = React.useRef<HTMLDivElement>(null)
	const dragStartY = React.useRef<number | null>(null)
	const [dragDelta, setDragDelta] = React.useState(0)
	const [isDragging, setIsDragging] = React.useState(false)

	const CLOSE_THRESHOLD = 120 // px

	function onPointerDown(e: React.PointerEvent) {
		if (!isMobile) return
		dragStartY.current = e.clientY
		setIsDragging(true)
		;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
	}

	function onPointerMove(e: React.PointerEvent) {
		if (!isDragging || dragStartY.current === null) return
		const delta = Math.max(0, e.clientY - dragStartY.current)
		setDragDelta(delta)
	}

	function onPointerUp() {
		if (!isDragging) return
		setIsDragging(false)
		if (dragDelta >= CLOSE_THRESHOLD) {
			onOpenChange(false)
		}
		setDragDelta(0)
		dragStartY.current = null
}

	/* ─────────────── MOBILE: Bottom Sheet ─────────────── */
	if (isMobile) {
		return (
			<DialogPrimitive.Portal>
				{/* Overlay */}
				<DialogPrimitive.Overlay
					className={cn(
						"fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px]",
						// Radix data-state animations
						"data-[state=open]:animate-in data-[state=closed]:animate-out",
						"data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
						"duration-300"
					)}
				/>

				{/* Sheet */}
				<DialogPrimitive.Content
					ref={sheetRef}
					style={{
						transform:
							dragDelta > 0 ? `translateY(${dragDelta}px)` : undefined,
						transition: isDragging ? "none" : undefined,
						opacity: dragDelta > 0 ? 1 - dragDelta / 300 : undefined,
					}}
					className={cn(
						// Layout
						"fixed bottom-0 left-0 right-0 z-50",
						"flex flex-col",
						"rounded-t-2xl bg-white",
						"shadow-[0_-8px_40px_rgba(0,0,0,0.18)]",
						// Max height
						"max-h-[90dvh]",
						// Radix data-state animations
						"data-[state=open]:animate-in data-[state=closed]:animate-out",
						"data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
						"duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
						className
					)}
				>
					{/* Drag handle */}
					<div
						className="flex-shrink-0 cursor-grab active:cursor-grabbing pt-3 pb-1 touch-none"
						onPointerDown={onPointerDown}
						onPointerMove={onPointerMove}
						onPointerUp={onPointerUp}
						onPointerCancel={onPointerUp}
					>
						<div className="mx-auto h-1 w-10 rounded-full bg-gray-300" />
					</div>

					{/* Header */}
					<SheetHeader icon={icon} title={title} subtitle={subtitle} />

					{/* Body — scrollable */}
					<div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-6">
						{children}
					</div>
				</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		);
	}

	/* ─────────────── DESKTOP: Centered Modal ─────────────── */
	return (
		<DialogPrimitive.Portal>
			{/* Overlay */}
			<DialogPrimitive.Overlay
				className={cn(
					"fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]",
					"data-[state=open]:animate-in data-[state=closed]:animate-out",
					"data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
					"duration-200"
				)}
			/>

			{/* Dialog */}
			<DialogPrimitive.Content
				className={cn(
					// Centering
					"fixed left-1/2 top-1/2 z-50",
					"-translate-x-1/2 -translate-y-1/2",
					// Size
					"w-full",
					desktopMaxWidth,
					// Visual
					"rounded-2xl bg-white shadow-2xl",
					"flex flex-col max-h-[90dvh]",
					// Animations
					"data-[state=open]:animate-in data-[state=closed]:animate-out",
					"data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
					"data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
					"data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
					"data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
					"duration-200",
					className
				)}
			>
				{/* Header */}
				<SheetHeader icon={icon} title={title} subtitle={subtitle} />

				{/* Body — scrollable */}
				<div className="flex-1 overflow-y-auto px-6 pb-6">{children}</div>
			</DialogPrimitive.Content>
		</DialogPrimitive.Portal>
	);
}

/* ─────────────────────────────────────────────
	 Shared Header
───────────────────────────────────────────── */
interface SheetHeaderProps {
	icon?: React.ReactNode;
	title: React.ReactNode;
	subtitle?: React.ReactNode;
}

function SheetHeader({ icon, title, subtitle }: SheetHeaderProps) {
	return (
		<div className="flex-shrink-0 px-5 md:px-6 pt-4 pb-3 border-b border-primary">
			{/* Title row: [icon + title] ... [X] */}
			<div className="flex items-center justify-between gap-3">
				<div className="flex items-center gap-2.5 min-w-0">
					{icon && (
						<span className="flex-shrink-0 text-gray-700">{icon}</span>
					)}
					<DialogPrimitive.Title className="text-base font-semibold text-gray-900 truncate leading-tight">
						{title}
					</DialogPrimitive.Title>
				</div>

				{/* Close button */}
				<DialogPrimitive.Close
					className={cn(
						"flex-shrink-0 rounded-full p-1.5",
						"text-gray-400 hover:text-gray-600 hover:bg-gray-100",
						"transition-colors duration-150",
						"focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
					)}
					aria-label="Cerrar"
				>
					<X className="size-4" strokeWidth={2.5} />
				</DialogPrimitive.Close>
			</div>

			{/* Optional subtitle / step indicator */}
			{subtitle && (
				<DialogPrimitive.Description asChild>
					<p className="mt-0.5 text-xs text-gray-500 leading-snug">
						{subtitle}
					</p>
				</DialogPrimitive.Description>
			)}
		</div>
	);
}

/* ─────────────────────────────────────────────
	 Exports
───────────────────────────────────────────── */
export {
	ResponsiveModal,
	ResponsiveModalTrigger,
	ResponsiveModalClose,
	ResponsiveModalContent,
};