import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Clock3, MapPin, Phone, Search, Settings2, ShoppingBag, Timer, X } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { useI18n } from '../../i18n/I18nContext'
import { localizeProduct } from '../../i18n/productI18n'
import { telHref } from '../../lib/utils'
import { localizeDeliveryTime } from '../../i18n/format'
import LanguageSwitcher from '../ui/LanguageSwitcher'
import Logo from './Logo'
import SmartImage from '../ui/SmartImage'

export default function Header({ query, onQueryChange, onOpenAdmin }) {
  const { cartCount, openCart, products, openQuickView, settings } = useStore()
  const { t, money, lang } = useI18n()
  const [focused, setFocused] = useState(false)
  const boxRef = useRef(null)

  const term = query.trim().toLowerCase()
  const localized = products.map((p) => localizeProduct(p, lang))
  const suggestions =
    term.length >= 2
      ? localized
          .filter(
            (p) =>
              p.name.toLowerCase().includes(term) ||
              p.category.toLowerCase().includes(term) ||
              p.description.toLowerCase().includes(term),
          )
          .slice(0, 5)
      : []

  useEffect(() => {
    const onClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setFocused(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const showSuggestions = focused && term.length >= 2

  return (
    <>
      {/* Yuqori informatsion chiziq */}
      <div className="hidden bg-ink text-white/90 md:block">
        <div className="container-page flex h-9 items-center justify-between text-[12px]">
          <div className="flex items-center gap-5">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={13} className="text-brand-400" />{' '}
              {t('header.cityDelivery', '{city} bo‘ylab yetkazib berish', { city: settings.city })}
            </span>
            <span className="inline-flex items-center gap-1.5 text-white/70">
              <Clock3 size={13} className="text-brand-400" /> {settings.workHours}
            </span>
          </div>
          <div className="flex items-center gap-5">
            <span className="text-white/70">
              {t('header.freeFrom', '{amount}dan bepul yetkazib berish', {
                amount: money(settings.freeDeliveryThreshold),
              })}
            </span>
            <a href={telHref(settings.phone)} className="inline-flex items-center gap-1.5 font-semibold hover:text-brand-300">
              <Phone size={13} /> {settings.phone}
            </a>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="container-page">
          <div className="flex h-16 items-center gap-3 md:h-[74px] md:gap-5">
            <a href="#/" className="shrink-0 no-tap-highlight" aria-label={`${settings.storeName} — ${t('nav.home', 'Bosh sahifa')}`}>
              <Logo />
            </a>

            {/* Qidiruv — desktop */}
            <div ref={boxRef} className="relative hidden flex-1 md:block">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                onFocus={() => setFocused(true)}
                onKeyDown={(e) => e.key === 'Escape' && setFocused(false)}
                placeholder={t('header.searchFull', 'Mahsulot yoki kategoriya qidirish...')}
                aria-label="Mahsulot qidirish"
                data-search-input
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-11 pr-24 text-sm font-medium text-ink outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => onQueryChange('')}
                  aria-label="Qidiruvni tozalash"
                  className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-slate-200/70 text-slate-500 transition hover:bg-slate-300"
                >
                  <X size={13} />
                </button>
              ) : (
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
                  ⌘ K
                </span>
              )}

              <AnimatePresence>
                {showSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-x-0 top-[52px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-lift"
                  >
                    {suggestions.length === 0 ? (
                      <p className="px-3 py-4 text-sm text-slate-500">
                        {t('header.noResults', '"{query}" bo‘yicha mahsulot topilmadi.', { query })}
                      </p>
                    ) : (
                      <>
                        <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {t('header.quickResults', 'Tezkor natijalar')}
                        </p>
                        {suggestions.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              openQuickView(p.id)
                              setFocused(false)
                            }}
                            className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-slate-50"
                          >
                            <SmartImage
                              src={p.image}
                              alt={p.name}
                              className="h-10 w-10 shrink-0 rounded-lg"
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-semibold text-ink">{p.name}</span>
                              <span className="block text-xs text-slate-400">{p.unit}</span>
                            </span>
                            <span className="text-sm font-bold text-brand-600">{money(p.price)}</span>
                          </button>
                        ))}
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="ml-auto flex items-center gap-2 md:ml-0 md:gap-3">
              {/* Yetkazib berish badge */}
              <div className="hidden items-center gap-2 rounded-xl border border-brand-100 bg-brand-50 px-3 py-2 lg:flex">
                <Timer size={16} className="text-brand-600" />
                <div className="leading-tight">
                  <p className="text-[11px] font-bold text-brand-700">{localizeDeliveryTime(settings.deliveryTime, lang)}</p>
                  <p className="text-[10px] text-brand-600/80">{t('header.deliveryBadge', 'yetkazib beramiz')}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenAdmin}
                className="hidden h-10 items-center gap-2 rounded-xl border border-slate-200 px-2.5 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-ink sm:inline-flex"
                title="Admin panel"
              >
                <Settings2 size={17} />
                <span className="hidden text-xs font-semibold lg:inline">{t('header.adminPanel', 'Admin Panel')}</span>
              </button>

              <LanguageSwitcher variant="compact" className="md:hidden" />

              <LanguageSwitcher variant="segmented" className="hidden md:inline-flex" />

              <button
                type="button"
                onClick={openCart}
                className="relative inline-flex h-10 items-center gap-2 rounded-xl bg-ink px-3 text-white transition hover:bg-slate-800 active:scale-[0.98]"
                aria-label={`${t('nav.cart', 'Savat')}, ${cartCount}`}
              >
                <ShoppingBag size={18} />
                <span className="hidden text-xs font-bold sm:inline">{t('header.cart', 'Savat')}</span>
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      className="absolute -right-1 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-amber-500 px-1 text-[10px] font-extrabold text-white ring-2 ring-white"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>

          {/* Qidiruv — mobil */}
          <div className="pb-3 md:hidden">
            <div className="relative">
              <Search
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder={t('header.searchShort', 'Mahsulot qidirish...')}
                aria-label="Mahsulot qidirish"
                data-search-input
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => onQueryChange('')}
                  aria-label="Qidiruvni tozalash"
                  className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-slate-200 text-slate-500"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
