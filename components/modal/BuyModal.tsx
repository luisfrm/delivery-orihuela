"use client";

import { ShoppingBag, ShoppingCart } from "lucide-react";
import {
	ResponsiveModal,
	ResponsiveModalTrigger,
	ResponsiveModalContent,
} from "@/components/ui/responsive-modal";
import { BuyForm } from "../forms/buy-form";
import { Button } from "../ui/button";

export default function BuyModal({ onTriggerClick }: { onTriggerClick?: () => void }) {
	return (
		<ResponsiveModal>
			<ResponsiveModalTrigger asChild>
				<Button
					variant="secondary"
					size="xl"
					className="w-full lg:w-auto"
					onClick={onTriggerClick}
				>
					<ShoppingBag className="w-5 h-5" />
					Comprar
				</Button>
			</ResponsiveModalTrigger>

			<ResponsiveModalContent
				icon={<ShoppingCart className="size-[18px]" />}
				title="Comprar"
				subtitle="Paso 1 de 4 · Selección"
				desktopMaxWidth="max-w-sm"
			>
				<BuyForm />
			</ResponsiveModalContent>
		</ResponsiveModal>
	);
}