import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  X,
} from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { useI18n } from '../../i18n/I18nContext'
import LanguageSwitcher from '../ui/LanguageSwitcher'
import { endAdminSession, hasAdminSession, startAdminSession } from '../../lib/adminAuth'
import { navigate } from '../../hooks/useHashRoute'
import Logo from '../store/Logo'
import AdminLogin from './AdminLogin'
import Dashboard from './Dashboard'
import OrdersManager from './OrdersManager'
import ProductsManager from './ProductsManager'
import AdminSettings from './AdminSettings'

const NAV = [
  { id: 'dashboard', key: 'admin.nav.dashboard', label: 'Boshqaruv', icon: LayoutDashboard, hintKey: 'admin.nav.hintDashboard', hint: 'Umumiy ko‘rsatkichlar' },
  { id: 'orders', key: 'admin.nav.orders', label: 'Buyurtmalar', icon: ShoppingBag, hintKey: 'admin.nav.hintOrders', hint: 'Buyurtmalarni boshqarish' },
  { id: 'products', key: 'admin.nav.products', label: 'Mahsulotlar', icon: Package, hintKey: 'admin.nav.hintProducts', hint: 'Katalog va narxlar' },
  { id: 'settings', key: 'admin.nav.settings', label: 'Sozlamalar', icon: Settings, hintKey: 'admin.nav.hintSettings', hint: 'Brend va integratsiya' },
]

const TITLES = {
  dashboard: { titleKey: 'admin.titles.dashboard', title: 'Boshqaruv paneli', subKey: 'admin.titles.dashboardSub', subtitle: 'Do‘kon holati va so‘nggi buyurtmalar' },
  orders: { titleKey: 'admin.titles.orders', title: 'Buyurtmalar', subKey: 'admin.titles.ordersSub', subtitle: 'Mijoz buyurtmalarini qabul qiling va kuzatib boring' },
  products: { titleKey: 'admin.titles.products', title: 'Mahsulotlar', subKey: 'admin.titles.productsSub', subtitle: 'Katalog, narxlar va ombor holati' },
  settings: { titleKey: 'admin.titles.settings', title: 'Sozlamalar', subKey: 'admin.titles.settingsSub', subtitle: 'Brend, Telegram va demo ma’lumotlar' },
}

export default function AdminApp() {
  const { orders, settings } = useStore()
  const { t } = useI18n()
  const [authed, setAuthed] = useState(() => hasAdminSession())
  const [section, setSection] = useState('dashboard')
  const [navOpen, setNavOpen] = useState(false)

  const newOrders = orders.filter((o) => o.status === 'new').length

  useEffect(() => {
    document.title = `${t(TITLES[section].titleKey, TITLES[section].title)} · ${settings.storeName} Admin`
    return () => {
      document.title = `${settings.storeName} — ${settings.deliveryTime} yetkazib beramiz`
    }
  }, [section, settings.storeName, settings.deliveryTime, t])

  useEffect(() => {
    if (!navOpen) return
    document.body.classList.add('overflow-hidden')
    return () => document.body.classList.remove('overflow-hidden')
  }, [navOpen])

  const login = () => {
    startAdminSession()
    setSection('dashboard')
    setAuthed(true)
  }

  const logout = () => {
    endAdminSession()
    setSection('dashboard')
    setAuthed(false)
  }

  if (!authed) {
    return <AdminLogin onSuccess={login} onBack={() => navigate('store')} />
  }

  const go = (id) => {
    setSection(id)
    setNavOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 pb-4 pt-5">
        <Logo />
        <span className="rounded-md bg-ink px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white">
          Admin
        </span>
      </div>

      <nav className="mt-2 flex-1 space-y-1 px-3">
        <p className="px-3 pb-1 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
          {t('admin.nav.dashboard', 'Boshqaruv')}
        </p>
        {NAV.map((item) => {
          const active = section === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => go(item.id)}
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                active
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-ink'
              }`}
            >
              <span
                className={`grid h-8 w-8 place-items-center rounded-lg transition ${
                  active ? 'bg-brand-500 text-white shadow-brand' : 'bg-slate-100 text-slate-500'
                }`}
              >
                <item.icon size={16} />
              </span>
              <span className="flex-1">
                <span className="block text-[13px] font-bold">{t(item.key, item.label)}</span>
                <span className="block text-[10px] text-slate-400">{t(item.hintKey, item.hint)}</span>
              </span>
              {item.id === 'orders' && newOrders > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-amber-500 px-1 text-[10px] font-extrabold text-white">
                  {newOrders}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      <div className="space-y-1 border-t border-slate-100 p-3">
        <button
          type="button"
          onClick={() => navigate('store')}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12px] font-semibold text-slate-600 transition hover:bg-brand-50 hover:text-brand-700"
        >
          <ExternalLink size={15} /> {t('admin.nav.store', 'Do‘konga o‘tish')}
        </button>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12px] font-semibold text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
        >
          <LogOut size={15} /> {t('admin.nav.logout', 'Chiqish')}
        </button>
        <div className="mt-2 rounded-xl bg-slate-50 px-3 py-2.5">
          <p className="text-[10px] font-bold text-ink">{t('admin.nav.demo', 'Demo versiya')}</p>
          <p className="text-[9px] leading-relaxed text-slate-400">
            {t('admin.nav.demoText', 'Ma’lumotlar brauzerda saqlanadi. Server keyin ulanadi.')}
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 bg-white lg:block">
        {SidebarContent}
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {navOpen && (
          <div className="fixed inset-0 z-[65] lg:hidden">
            <motion.div
              className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setNavOpen(false)}
            />
            <motion.aside
              className="absolute inset-y-0 left-0 w-[82%] max-w-xs border-r border-slate-200 bg-white"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            >
              <button
                type="button"
                onClick={() => setNavOpen(false)}
                aria-label={t('admin.nav.closeMenu', 'Menyuni yopish')}
                className="absolute right-2 top-4 grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X size={17} />
              </button>
              {SidebarContent}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
          <div className="flex h-14 items-center gap-2 px-3 sm:h-16 sm:gap-3 sm:px-5">
            <button
              type="button"
              onClick={() => setNavOpen(true)}
              aria-label={t('admin.nav.openMenu', 'Menyuni ochish')}
              className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-600 lg:hidden"
            >
              <Menu size={17} />
            </button>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-[14px] font-extrabold tracking-tight text-ink sm:text-base">
                {t(TITLES[section].titleKey, TITLES[section].title)}
              </h1>
              <p className="hidden truncate text-[11px] text-slate-500 sm:block">
                {t(TITLES[section].subKey, TITLES[section].subtitle)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('store')}
              className="hidden items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:border-brand-300 hover:text-brand-700 sm:inline-flex"
            >
              <ArrowLeft size={13} /> {t('admin.nav.store', 'Do‘kon')}
            </button>

            <LanguageSwitcher variant="compact" className="lg:hidden" />
            <LanguageSwitcher variant="segmented" className="hidden lg:inline-flex" />

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 py-1 pl-1 pr-2.5">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-ink text-[10px] font-extrabold text-white">
                AD
              </span>
              <div className="hidden leading-tight sm:block">
                <p className="text-[11px] font-bold text-ink">{t('admin.nav.admin', 'Administrator')}</p>
                <p className="text-[9px] text-slate-400">admin@freshmarket.uz</p>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              aria-label={t('admin.nav.logout', 'Chiqish')}
              className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
            >
              <LogOut size={15} />
            </button>
          </div>
        </header>

        <main className="p-3 pb-10 sm:p-5">
          {section === 'dashboard' && <Dashboard onNavigate={go} />}
          {section === 'orders' && <OrdersManager />}
          {section === 'products' && <ProductsManager />}
          {section === 'settings' && <AdminSettings />}
        </main>
      </div>
    </div>
  )
}
