import { AnimatePresence, motion } from 'framer-motion'
import { Home, LayoutGrid, ShieldCheck, ShoppingBag } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { useI18n } from '../../i18n/I18nContext'

export function MobileNav({ onOpenAdmin }) {
  const { openCart, cartCount } = useStore()
  const { t, money } = useI18n()

  const items = [
    {
      label: t('nav.home', 'Asosiy'),
      icon: Home,
      onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
      active: true,
    },
    {
      label: t('nav.catalog', 'Katalog'),
      icon: LayoutGrid,
      onClick: () => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }),
    },
    { label: t('nav.cart', 'Savat'), icon: ShoppingBag, onClick: openCart, badge: cartCount },
    { label: t('nav.admin', 'Admin'), icon: ShieldCheck, onClick: onOpenAdmin },
  ]

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/80 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4">
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={item.onClick}
            className={`relative flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition ${
              item.active ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <span className="relative">
              <item.icon size={20} strokeWidth={item.active ? 2.4 : 2} />
              {item.badge > 0 && (
                <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-amber-500 px-1 text-[9px] font-extrabold text-white ring-2 ring-white">
                  {item.badge}
                </span>
              )}
            </span>
            {item.label}
            {item.active && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-brand-500" />}
          </button>
        ))}
      </div>
    </nav>
  )
}

export function MobileCartBar() {
  const { cartCount, total, openCart, isCartOpen, isCheckoutOpen } = useStore()
  const { t, money } = useI18n()
  const visible = cartCount > 0 && !isCartOpen && !isCheckoutOpen

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={openCart}
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          className="fixed inset-x-3 bottom-[76px] z-40 flex items-center justify-between rounded-2xl bg-ink px-4 py-3 text-white shadow-lift md:hidden"
        >
          <span className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/10">
              <ShoppingBag size={16} />
            </span>
            <span className="text-left leading-tight">
              <span className="block text-[11px] text-white/60">
                {t('cart.itemsCount', '{n} ta mahsulot', { n: cartCount })}
              </span>
              <span className="block text-[13px] font-bold">{money(total)}</span>
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-3 py-2 text-[12px] font-bold">
            {t('nav.viewCart', 'Savatni ko‘rish')}
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
