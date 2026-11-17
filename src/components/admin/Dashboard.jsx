import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowUpRight,
  Banknote,
  ChevronRight,
  Package,
  PackageX,
  ReceiptText,
  ShoppingBasket,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { useI18n } from '../../i18n/I18nContext'
import { categoryLabel } from '../../i18n/categoryKeys'
import { localizeProduct } from '../../i18n/productI18n'
import { CATEGORIES } from '../../data/products'
import { ORDER_STATUSES } from '../../lib/utils'
import { StatusBadge } from './StatusBadge'
import CategoryIcon from '../store/CategoryIcon'

const STATUS_BAR = {
  blue: 'bg-blue-500',
  amber: 'bg-amber-500',
  violet: 'bg-violet-500',
  emerald: 'bg-brand-500',
  rose: 'bg-rose-400',
}

const CARD_TONES = {
  emerald: 'bg-brand-50 text-brand-600',
  amber: 'bg-amber-50 text-amber-600',
  slate: 'bg-slate-100 text-slate-600',
  violet: 'bg-violet-50 text-violet-600',
}

function KpiCard({ title, value, hint, icon: Icon, tone = 'emerald', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card"
    >
      <div className="flex items-start justify-between">
        <div className={`grid h-10 w-10 place-items-center rounded-xl ${CARD_TONES[tone]}`}>
          <Icon size={18} />
        </div>
        <ArrowUpRight size={16} className="text-slate-300" />
      </div>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{title}</p>
      <p className="mt-0.5 text-[17px] font-extrabold leading-tight tracking-tight text-ink tabular-nums sm:text-[22px]">{value}</p>
      <p className="mt-1 text-[11px] text-slate-500">{hint}</p>
    </motion.div>
  )
}

export default function Dashboard({ onNavigate }) {
  const { orders, products } = useStore()
  const { t, money, formatTime, lang } = useI18n()

  const stats = useMemo(() => {
    const valid = orders.filter((o) => o.status !== 'cancelled')
    const revenue = valid.reduce((sum, o) => sum + o.total, 0)
    const newOrders = orders.filter((o) => o.status === 'new').length
    const avg = valid.length ? Math.round(revenue / valid.length) : 0
    const outOfStock = products.filter((p) => p.stock === 'out')
    return { revenue, newOrders, avg, valid, outOfStock }
  }, [orders, products])

  const categoryStats = useMemo(() => {
    return CATEGORIES.filter((c) => c.id !== 'all')
      .map((c) => ({
        ...c,
        count: products.filter((p) => p.category === c.id).length,
      }))
      .sort((a, b) => b.count - a.count)
  }, [products])

  const maxCategory = Math.max(1, ...categoryStats.map((c) => c.count))
  const recent = orders.slice(0, 5)

  return (
    <div className="space-y-4">
      {/* KPI */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard
          title={t('dashboard.revenue', 'Jami tushum')}
          value={money(stats.revenue)}
          hint={t('dashboard.revenueHint', 'Buyurtmalar: {n}', { n: stats.valid.length })}
          icon={Wallet}
          tone="emerald"
          delay={0}
        />
        <KpiCard
          title={t('dashboard.newOrders', 'Yangi buyurtmalar')}
          value={stats.newOrders}
          hint={t('dashboard.newOrdersHint', 'Hozir javob kutmoqda')}
          icon={ShoppingBasket}
          tone="amber"
          delay={0.05}
        />
        <KpiCard
          title={t('dashboard.products', 'Mahsulotlar soni')}
          value={products.length}
          hint={t('dashboard.productsHint', 'Tugagan: {n}', { n: stats.outOfStock.length })}
          icon={Package}
          tone="slate"
          delay={0.1}
        />
        <KpiCard
          title={t('dashboard.avg', 'O‘rtacha chek')}
          value={money(stats.avg)}
          hint={t('dashboard.avgHint', 'Buyurtma bo‘yicha o‘rtacha')}
          icon={TrendingUp}
          tone="violet"
          delay={0.15}
        />
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[1.55fr_1fr]">
        <div className="space-y-4">
        {/* So'nggi buyurtmalar */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
            <div>
              <h2 className="text-[14px] font-extrabold tracking-tight text-ink">{t('dashboard.recent', 'So‘nggi buyurtmalar')}</h2>
              <p className="text-[11px] text-slate-500">{t('dashboard.live', 'Real vaqtda yangilanadi')}</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('orders')}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-bold text-brand-600 transition hover:bg-brand-50"
            >
              {t('dashboard.viewAll', 'Barchasini ko‘rish')} <ChevronRight size={13} />
            </button>
          </div>

          {recent.length === 0 ? (
            <div className="grid place-items-center px-4 py-12 text-center">
              <ReceiptText size={26} className="text-slate-300" />
              <p className="mt-2 text-sm font-semibold text-slate-600">{t('dashboard.empty', 'Hozircha buyurtmalar yo‘q')}</p>
              <p className="text-[11px] text-slate-400">{t('dashboard.emptyText', 'Do‘kondan birinchi buyurtma kelishini kuting.')}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recent.map((order) => (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => onNavigate('orders')}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50/80"
                >
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-[11px] font-extrabold text-slate-600">
                    {order.customer.name
                      .split(' ')
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-[12px] font-bold text-ink">{order.customer.name}</p>
                      <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500">
                        #{order.id}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[10px] text-slate-400">
                      {t('dashboard.items', '{n} ta mahsulot', {
                        n: order.items.reduce((s, i) => s + i.qty, 0),
                      })}{' '}
                      · {formatTime(order.createdAt)}
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <StatusBadge status={order.status} size="sm" />
                  </div>
                  <p className="shrink-0 text-[12px] font-extrabold text-ink">{money(order.total)}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Buyurtmalar holati */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[14px] font-extrabold tracking-tight text-ink">{t('dashboard.statusTitle', 'Buyurtmalar holati')}</h2>
              <p className="text-[11px] text-slate-500">
                {t('dashboard.statusTotal', 'Jami {n} ta buyurtma', { n: orders.length })}
              </p>
            </div>
            <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">
              {t('dashboard.newCount', '{n} yangi', { n: stats.newOrders })}
            </span>
          </div>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {ORDER_STATUSES.map((s) => {
              const count = orders.filter((o) => o.status === s.id).length
              const pct = orders.length ? Math.round((count / orders.length) * 100) : 0
              return (
                <div key={s.id}>
                  <div className="mb-1 flex items-center justify-between text-[11px]">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-slate-600">
                      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_BAR[s.tone]}`} />{' '}
                      {t(`status.${s.id}`, s.label)}
                    </span>
                    <span className="font-bold text-slate-400">
                      {count} · {pct}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${STATUS_BAR[s.tone]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        </div>

        <div className="space-y-4">
          {/* Kategoriyalar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
            <h2 className="text-[14px] font-extrabold tracking-tight text-ink">{t('dashboard.catalog', 'Katalog tarkibi')}</h2>
            <p className="text-[11px] text-slate-500">{t('dashboard.catalogText', 'Kategoriyalar bo‘yicha mahsulotlar')}</p>
            <div className="mt-3 space-y-2.5">
              {categoryStats.map((c) => (
                <div key={c.id}>
                  <div className="mb-1 flex items-center justify-between text-[11px]">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-slate-600">
                      <CategoryIcon id={c.id} size={13} className="text-brand-500" />{' '}
                      {categoryLabel(t, c)}
                    </span>
                    <span className="font-bold text-slate-400">{c.count}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
                      style={{ width: `${(c.count / maxCategory) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ombor */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[14px] font-extrabold tracking-tight text-ink">{t('dashboard.stock', 'Ombor holati')}</h2>
                <p className="text-[11px] text-slate-500">{t('dashboard.stockText', 'Tugagan mahsulotlar')}</p>
              </div>
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-rose-50 text-rose-500">
                <PackageX size={16} />
              </div>
            </div>
            {stats.outOfStock.length === 0 ? (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2.5 text-[11px] font-semibold text-brand-700">
                <Banknote size={14} /> {t('dashboard.allInStock', 'Barcha mahsulotlar sotuvda')}
              </div>
            ) : (
              <ul className="mt-2 divide-y divide-slate-100">
                {stats.outOfStock.slice(0, 4).map((p) => localizeProduct(p, lang)).map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-2 py-2">
                    <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-slate-700">
                      {p.name}
                    </span>
                    <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600">
                      {t('dashboard.out', 'Tugagan')}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              onClick={() => onNavigate('products')}
              className="mt-3 w-full rounded-xl border border-slate-200 py-2 text-[11px] font-bold text-slate-600 transition hover:border-brand-300 hover:text-brand-700"
            >
              {t('dashboard.manageProducts', 'Mahsulotlarni boshqarish')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
