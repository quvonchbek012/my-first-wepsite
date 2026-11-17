import { Apple, Candy, Croissant, CupSoda, Drumstick, LayoutGrid, Milk } from 'lucide-react'

const ICONS = {
  all: LayoutGrid,
  ichimliklar: CupSoda,
  meva: Apple,
  sut: Milk,
  non: Croissant,
  gosht: Drumstick,
  shirinliklar: Candy,
}

/** Brauzer/fontga bog'liq bo'lmagan kategoriya ikonkalari. */
export default function CategoryIcon({ id, size = 16, className }) {
  const Icon = ICONS[id] || LayoutGrid
  return <Icon size={size} className={className} strokeWidth={2.2} />
}
