import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Eye, Inbox, Phone, Search, X } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { useI18n } from '../../i18n/I18nContext'
import { ORDER_STATUSES } from '../../lib/utils'
import { StatusBadge, StatusSelect } from './StatusBadge'
import OrderDetailModal from './OrderDetailModal'

export default function OrdersManager() {
  const { orders, updateOrderStatus, updateOrder, deleteOrder, toast } = useStore()
  const { t, money, formatDate, formatTime } = useI18n()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [selectedId, setSelectedId] = useState(null)

  const counts = useMemo(() => {
    const base = { all: orders.length }
    ORDER_STATUSES.forEach((s) => {
      base[s.id] = orders.filter((o) => o.status === s.id).length
    })
    return base
  }, [orders])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return orders.filter((o) => {
      const statusOk = status === 'all' || o.status === status
      if (!statusOk) return false
      if (!term) return true
      return (
        o.id.toLowerCase().includes(term) ||
        o.customer.name.toLowerCase().includes(term) ||
        o.customer.phone.replace(/\s/g, '').includes(term.replace(/\s/g, '')) ||
        o.customer.address.toLowerCase().includes(term)
      )
    })
  }, [orders, query, status])

  const selected = orders.find((o) => o.id === selectedId) || null

  const changeStatus = (id, next) => {
    updateOrderStatus(id, next)
    const label = ORDER_STATUSES.find((s) => s.id === next)?.label || next
    toast(t('orders.toastStatus', 'Holat #{id}: {label}', { id, label: t(`status.${next}`, label) }))
  }

  return (
    <div className="space-y-4">
      {/* Boshqaruv paneli */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[15px] font-extrabold tracking-tight text-ink">{t('orders.title', 'Buyurtmalar')}</h2>
            <p className="text-[11px] text-slate-500">
              {t('orders.count', 'Buyurtmalar: {n} · yangi: {m}', { n: filtered.length, m: counts.new })}
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('orders.search', 'ID, ism, telefon yoki manzil...')}
              className="field h-9 pl-9 pr-8 text-[12px]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Tozalash"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        <div className="no-scrollbar mt-3 flex gap-1.5 overflow-x-auto">
          <FilterChip active={status === 'all'} onClick={() => setStatus('all')} label={t('orders.all', 'Barchasi')} count={counts.all} />
          {ORDER_STATUSES.map((s) => (
            <FilterChip
              key={s.id}
              active={status === s.id}
              onClick={() => setStatus(s.id)}
              label={t(`status.${s.id}`, s.label)}
              count={counts[s.id]}
            />
          ))}
        </div>
      </div>

      {/* Ro'yxat */}
      {filtered.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <Inbox size={28} className="text-slate-300" />
          <p className="mt-2 text-sm font-bold text-slate-600">{t('orders.empty', 'Buyurtma topilmadi')}</p>
          <p className="text-[11px] text-slate-400">{t('orders.emptyText', 'Filtrni o‘zgartirib qayta urinib ko‘ring.')}</p>
        </div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card lg:block">
            <table className="w-full text-left">
              <thead className="border-b border-slate-100 bg-slate-50/70">
                <tr className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3">{t('orders.colOrder', 'Buyurtma')}</th>
                  <th className="px-4 py-3">{t('orders.colCustomer', 'Mijoz')}</th>
                  <th className="px-4 py-3">{t('orders.colItems', 'Mahsulotlar')}</th>
                  <th className="px-4 py-3">{t('orders.colTotal', 'Summa')}</th>
                  <th className="px-4 py-3">{t('orders.colPayment', 'To‘lov')}</th>
                  <th className="px-4 py-3">{t('orders.colStatus', 'Holat')}</th>
                  <th className="px-4 py-3 text-right">{t('orders.colAction', 'Amal')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence initial={false}>
                  {filtered.map((order) => {
                    const qty = order.items.reduce((s, i) => s + i.qty, 0)
                    return (
                      <motion.tr
                        key={order.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-[12px] transition hover:bg-slate-50/70"
                      >
                        <td className="px-4 py-3">
                          <p className="font-extrabold text-ink">#{order.id}</p>
                          <p className="text-[10px] text-slate-400">{formatDate(order.createdAt)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-ink">{order.customer.name}</p>
                          <p className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-slate-400">
                            <Phone size={10} /> {order.customer.phone}
                          </p>
                        </td>
                        <td className="max-w-[220px] px-4 py-3">
                          <p className="truncate text-slate-600">
                            {order.items
                              .slice(0, 2)
                              .map((i) => i.name)
                              .join(', ')}
                            {order.items.length > 2 ? ` +${order.items.length - 2}` : ''}
                          </p>
                          <p className="text-[10px] text-slate-400">{t('orders.qty', '{n} dona', { n: qty })}</p>
                        </td>
                        <td className="px-4 py-3 font-extrabold text-ink">{money(order.total)}</td>
                        <td className="px-4 py-3 text-slate-500">
                          {order.payment === 'cash'
                            ? t('checkout.cash', 'Naqd pul')
                            : order.payment === 'click'
                              ? 'Click'
                              : 'Payme'}
                        </td>
                        <td className="px-4 py-3">
                          <StatusSelect value={order.status} onChange={(next) => changeStatus(order.id, next)} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedId(order.id)}
                            className="inline-grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600"
                            aria-label={`#${order.id} tafsilotlari`}
                          >
                            <Eye size={14} />
                          </button>
                        </td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Mobil */}
          <div className="space-y-2.5 lg:hidden">
            {filtered.map((order) => {
              const qty = order.items.reduce((s, i) => s + i.qty, 0)
              return (
                <div key={order.id} className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-card">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[13px] font-extrabold text-ink">#{order.id}</p>
                      <p className="text-[10px] text-slate-400">{formatTime(order.createdAt)} · {t('orders.qty', '{n} dona', { n: qty })}</p>
                    </div>
                    <StatusBadge status={order.status} size="sm" />
                  </div>
                  <div className="mt-2.5 rounded-xl bg-slate-50 px-3 py-2">
                    <p className="text-[12px] font-semibold text-ink">{order.customer.name}</p>
                    <p className="text-[10px] text-slate-500">{order.customer.phone}</p>
                    <p className="mt-1 line-clamp-1 text-[10px] text-slate-400">{order.customer.address}</p>
                  </div>
                  <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                    <StatusSelect value={order.status} onChange={(next) => changeStatus(order.id, next)} />
                    <p className="text-[14px] font-extrabold text-ink">{money(order.total)}</p>
                    <button
                      type="button"
                      onClick={() => setSelectedId(order.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-600"
                    >
                      <Eye size={13} /> {t('orders.detail', 'Batafsil')}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      <OrderDetailModal
        order={selected}
        onClose={() => setSelectedId(null)}
        onChangeStatus={(next) => selected && changeStatus(selected.id, next)}
        onUpdate={(patch) => {
          if (!selected) return
          updateOrder(selected.id, patch)
          toast(t('orders.toastUpdated', 'Ma’lumot #{id} yangilandi', { id: selected.id }))
        }}
        onDelete={() => {
          if (!selected) return
          const id = selected.id
          deleteOrder(id)
          setSelectedId(null)
          toast(t('orders.toastDeleted', 'Buyurtma #{id} o‘chirildi', { id }))
        }}
      />
    </div>
  )
}

function FilterChip({ active, onClick, label, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition ${
        active
          ? 'border-ink bg-ink text-white'
          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-ink'
      }`}
    >
      {label}
      <span
        className={`rounded px-1 py-0.5 text-[9px] ${
          active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
        }`}
      >
        {count}
      </span>
    </button>
  )
}
