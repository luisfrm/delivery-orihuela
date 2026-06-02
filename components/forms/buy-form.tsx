import { MapPin, Star } from 'lucide-react';
import React from 'react'

const STORES = [
	{
		id: 1,
		name: "Burger Kingo",
		category: "Comida Rápida",
		distance: "1.2 km",
		recommended: true,
		icon: "🍔",
	},
	{
		id: 2,
		name: "Farmacias San Pedro",
		category: "Salud y Bienestar",
		distance: "2.5 km",
		recommended: false,
		icon: "💊",
	},
	{
		id: 3,
		name: "Supermercado El Sol",
		category: "Abarrotes",
		distance: "3.0 km",
		recommended: false,
		icon: "🛒",
	},
];

export const BuyForm = () => {
	const [selected, setSelected] = React.useState<number | null>(null);

	return (
		<div className="pt-4 space-y-4">
			<div>
				<h2 className="text-lg font-bold text-gray-900">
					Seleccionar Establecimiento
				</h2>
				<p className="text-sm text-gray-500 mt-0.5 leading-snug">
					¿Dónde realizarás la compra? Busca el local o elige uno cercano.
				</p>
			</div>

			{/* Search input */}
			<div className="relative">
				<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
					<svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
					</svg>
				</span>
				<input
					type="text"
					placeholder="Buscar restaurante, farmacia, tienda..."
					className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition"
				/>
			</div>

			{/* Store list */}
			<div>
				<p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
					Cerca de ti
				</p>
				<ul className="space-y-2">
					{STORES.map((store) => (
						<li key={store.id}>
							<button
								onClick={() => setSelected(store.id)}
								className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border text-left transition-all duration-150 ${selected === store.id
									? "border-red-500 bg-red-50 shadow-sm"
									: "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
									}`}
							>
								{/* Icon */}
								<span className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xl">
									{store.icon}
								</span>

								{/* Info */}
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 flex-wrap">
										<span className="text-sm font-semibold text-gray-900 truncate">
											{store.name}
										</span>
										{store.recommended && (
											<span className="flex-shrink-0 inline-flex items-center gap-1 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
												<Star className="size-2.5 fill-yellow-900" />
												Recomendado
											</span>
										)}
									</div>
									<div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500">
										<MapPin className="size-3 flex-shrink-0" />
										<span>{store.distance}</span>
										<span className="mx-1 text-gray-300">•</span>
										<span className="truncate">{store.category}</span>
									</div>
								</div>

								{/* Radio indicator */}
								<span
									className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selected === store.id
										? "border-red-600 bg-red-600"
										: "border-gray-300"
										}`}
								>
									{selected === store.id && (
										<span className="w-2 h-2 rounded-full bg-white block" />
									)}
								</span>
							</button>
						</li>
					))}
				</ul>
			</div>

			{/* CTA */}
			<button
				disabled={!selected}
				className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-150 active:scale-[0.98] text-sm"
			>
				Continuar
				<svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
					<path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 12h12" />
				</svg>
			</button>
		</div>
	)
}