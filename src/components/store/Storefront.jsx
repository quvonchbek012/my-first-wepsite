import { useEffect, useState } from 'react'
import { useI18n } from '../../i18n/I18nContext'
import { useStore } from '../../store/StoreContext'
import Header from './Header'
import Hero from './Hero'
import StoreNotice from './StoreNotice'
import Catalog from './Catalog'
import Footer from './Footer'
import CartDrawer from './CartDrawer'
import CheckoutModal from './CheckoutModal'
import QuickViewModal from './QuickViewModal'
import { MobileCartBar, MobileNav } from './MobileNav'

export default function Storefront() {
  const { t } = useI18n()
  const { settings } = useStore()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')

  const openAdmin = () => {
    window.location.hash = '#/admin'
  }

  const goToCatalog = (nextCategory) => {
    if (nextCategory) setCategory(nextCategory)
    setQuery('')
    requestAnimationFrame(() => {
      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  useEffect(() => {
    document.title = `${settings.storeName} — ${t('hero.deliveryPill', '{time} yetkazib beramiz', {
      time: settings.deliveryTime,
    })}`
  }, [settings.storeName, settings.deliveryTime, t])

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        const input = document.querySelector('[data-search-input]')
        input?.focus()
        input?.select?.()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <Header query={query} onQueryChange={setQuery} onOpenAdmin={openAdmin} />

      <main className="flex-1 pb-24 md:pb-0">
        <StoreNotice />
        <Hero onCta={goToCatalog} />
        <Catalog
          active={category}
          onCategoryChange={(next) => {
            setCategory(next)
            setQuery('')
          }}
          query={query}
          onClearQuery={() => setQuery('')}
        />
      </main>

      <Footer onOpenAdmin={openAdmin} onCategoryChange={goToCatalog} />

      <MobileNav onOpenAdmin={openAdmin} />
      <MobileCartBar />
      <CartDrawer />
      <CheckoutModal />
      <QuickViewModal />
    </div>
  )
}
