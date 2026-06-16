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

  // The admin layout's <main> has no explicit height, so the MenuEditor's
  // `h-full` would resolve to `auto` and the flex-1 on the scrollable area
  // would have no space to distribute. We give the wrapper a fixed height
  // that compensates for the layout's padding (pt-20 + pb-8 on mobile,
  // p-8 on desktop) so the inner flex chain works correctly.
  return (
    <div className="h-[calc(100dvh-112px)] lg:h-[calc(100dvh-64px)]">
      <MenuEditor
        initialStore={data.store}
        initialProducts={data.products}
        initialCategoryOrder={data.categoryOrder}
      />
    </div>
  )
}
