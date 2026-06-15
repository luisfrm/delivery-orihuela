import { notFound } from "next/navigation"

import { getStoreMenuBySlug } from "@/lib/actions/stores"
import { MenuEditor } from "@/components/admin/restaurants/menu/MenuEditor"

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function RestaurantMenuPage({ params }: PageProps) {
  const { slug } = await params
  const data = await getStoreMenuBySlug(slug)

  if (!data) {
    notFound()
  }

  return (
    <MenuEditor
      initialStore={data.store}
      initialProducts={data.products}
      initialCategoryOrder={data.categoryOrder}
    />
  )
}
