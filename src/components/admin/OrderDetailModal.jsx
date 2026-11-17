import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  CreditCard,
  MapPin,
  MessageSquare,
  Minus,
  Pencil,
  Phone,
  Plus,
  Save,
  Trash2,
  User,
  X,
} from 'lucide-react'
import Modal from '../ui/Modal'
import SmartImage from '../ui/SmartImage'
import { StatusSelect } from './StatusBadge'
import { useStore } from '../../store/StoreContext'
import { useI18n } from '../../i18n/I18nContext'
import { deliveryFeeFor, formatPhone, phoneDigits } from '../../lib/utils'

export default function OrderDetailModal({ order, onClose, onChangeStatus, onUpdate, onDelete }) {
  const { settings } = useStore()
  const { t, money, formatDate } = useI18n()
  const [editing, setEditing] = useState(false)
  const [itemsEdit, setItemsEdit] = useState(false)
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ name: '', phone: '', address: '', comment: '', payment: 'cash' })
  const [errors, setErrors] = useState({})
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!order) return
    setForm({
      name: order.customer.name,
      phone: order.customer.phone,
      address: order.customer.address,
      comment: order.customer.comment || '',
      payment: order.payment,
    })
    setEditing(false)
    setItemsEdit(false)
    setItems(order.items.map((item) => ({ ...item })))
    setErrors({})
    setConfirmDelete(false)
  }, [order?.id])

  if (!order) return null

  const viewItems = itemsEdit ? items : order.items
  const qty = viewItems.reduce((s, i) => s + i.qty, 0)
  const viewSubtotal = itemsEdit
    ? viewItems.reduce((sum, i) => sum + i.price * i.qty, 0)
    : order.subtotal
  const viewDelivery = itemsEdit
    ? deliveryFeeFor(viewSubtotal, settings.deliveryFee, settings.freeDeliveryThreshold)
    : order.delivery
  const viewTotal = itemsEdit ? viewSubtotal + viewDelivery : order.total

  const setItemQty = (id, delta) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Math.min(99, Math.max(1, item.qty + delta)) } : item,
      ),
    )
  }

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const saveItems = () => {
    if (!items.length) return
    onUpdate?.({ items, subtotal: viewSubtotal, delivery: viewDelivery, total: viewTotal })
    setItemsEdit(false)
  }

  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const save = () => {
    const next = {}
    if (form.name.trim().length < 2) next.name = t('order.errName', 'Ismni kiriting')
    if (phoneDigits(form.phone).length !== 9)
      next.phone = t('order.errPhone', 'Telefon raqam +998 90 123 45 67 ko‘rinishida')
    if (form.address.trim().length < 6) next.address = t('order.errAddress', 'Manzilni kiriting')
    setErrors(next)
    if (Object.keys(next).length) return

    onUpdate?.({
      customer: {
        name: form.name.trim(),
        phone: formatPhone(form.phone),
        address: form.address.trim(),
        comment: form.comment.trim(),
      },
      payment: form.payment,
    })
    setEditing(false)
  }

  return (
    <Modal open={Boolean(order)} onClose={onClose} panelClassName="max-w-2xl" ariaLabel={`Buyurtma ${order.id}`}>
      <div className="max-h-[90vh] overflow-y-auto">
        <div className="border-b border-slate-100 px-5 py-4 pr-14">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-extrabold tracking-tight text-ink">#{order.id}</h2>
            <StatusSelect value={order.status} onChange={onChangeStatus} />
          </div>
          <p className="mt-0.5 text-[11px] text-slate-500">{formatDate(order.createdAt)}</p>
        </div>

        <div className="space-y-4 p-5">
          <div className="rounded-2xl bg-slate-50 p-3.5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                {t('order.customerTitle', 'Mijoz ma’lumotlari')}
              </p>
              {!editing ? (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-600 transition hover:border-brand-300 hover:text-brand-700"
                >
                  <Pencil size={11} /> {t('order.edit', 'Tahrirlash')}
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false)
                      setErrors({})
                      setForm({
                        name: order.customer.name,
                        phone: order.customer.phone,
                        address: order.customer.address,
                        comment: order.customer.comment || '',
                        payment: order.payment,
                      })
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-500"
                  >
                    <X size={11} /> {t('order.cancel', 'Bekor')}
                  </button>
                  <button
                    type="button"
                    onClick={save}
                    className="inline-flex items-center gap-1 rounded-lg bg-brand-500 px-2 py-1 text-[10px] font-bold text-white"
                  >
                    <Save size={11} /> {t('order.save', 'Saqlash')}
                  </button>
                </div>
              )}
            </div>

            {!editing ? (
              <div className="grid gap-2 text-[12px] sm:grid-cols-2">
                <p className="flex items-center gap-2 text-slate-600">
                  <User size={14} className="text-slate-400" />
                  <span className="font-semibold text-ink">{order.customer.name}</span>
                </p>
                <p className="flex items-center gap-2 text-slate-600">
                  <Phone size={14} className="text-slate-400" />
                  <a href={`tel:${order.customer.phone.replace(/\s/g, '')}`} className="hover:text-brand-600">
                    {order.customer.phone}
                  </a>
                </p>
                <p className="flex items-start gap-2 text-slate-600 sm:col-span-2">
                  <MapPin size={14} className="mt-0.5 shrink-0 text-slate-400" />
                  {order.customer.address}
                </p>
                {order.customer.comment ? (
                  <p className="flex items-start gap-2 text-slate-600 sm:col-span-2">
                    <MessageSquare size={14} className="mt-0.5 shrink-0 text-slate-400" />
                    <span className="italic">“{order.customer.comment}”</span>
                  </p>
                ) : null}
                <p className="flex items-center gap-2 text-slate-600">
                  <CreditCard size={14} className="text-slate-400" />
                  {order.payment === 'cash'
                    ? t('checkout.cash', 'Naqd pul')
                    : order.payment === 'click'
                      ? 'Click'
                      : 'Payme'}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <div>
                    <label className="field-label">{t('order.name', 'Ism va familiya')}</label>
                    <input
                      value={form.name}
                      aria-label="Mijoz ismi"
                      onChange={(e) => set('name', e.target.value)}
                      className={`field h-9 text-[12px] ${errors.name ? 'border-rose-300' : ''}`}
                    />
                    {errors.name && <p className="mt-1 text-[10px] text-rose-600">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="field-label">{t('order.phone', 'Telefon')}</label>
                    <input
                      value={form.phone}
                      aria-label="Mijoz telefoni"
                      onChange={(e) => set('phone', formatPhone(e.target.value))}
                      className={`field h-9 text-[12px] ${errors.phone ? 'border-rose-300' : ''}`}
                    />
                    {errors.phone && <p className="mt-1 text-[10px] text-rose-600">{errors.phone}</p>}
                  </div>
                </div>
                <div>
                  <label className="field-label">{t('order.address', 'Manzil')}</label>
                  <textarea
                    rows={2}
                    value={form.address}
                    aria-label="Mijoz manzili"
                    onChange={(e) => set('address', e.target.value)}
                    className={`field resize-none text-[12px] ${errors.address ? 'border-rose-300' : ''}`}
                  />
                  {errors.address && <p className="mt-1 text-[10px] text-rose-600">{errors.address}</p>}
                </div>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <div>
                    <label className="field-label">{t('order.comment', 'Izoh')}</label>
                    <input
                      value={form.comment}
                      aria-label="Buyurtma izohi"
                      onChange={(e) => set('comment', e.target.value)}
                      className="field h-9 text-[12px]"
                    />
                  </div>
                  <div>
                    <label className="field-label">{t('order.payment', 'To‘lov usuli')}</label>
                    <select
                      value={form.payment}
                      aria-label="To'lov usuli"
                      onChange={(e) => set('payment', e.target.value)}
                      className="field h-9 text-[12px]"
                    >
                      {[
                        ['cash', t('checkout.cash', 'Naqd pul')],
                        ['click', 'Click'],
                        ['payme', 'Payme'],
                      ].map(([id, label]) => (
                        <option key={id} value={id}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/70 px-3.5 py-2">
              <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                {t('order.itemsQty', 'Mahsulotlar · {n} dona', { n: qty })}
              </span>
              {!itemsEdit ? (
                <button
                  type="button"
                  onClick={() => setItemsEdit(true)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-600 transition hover:border-brand-300 hover:text-brand-700"
                >
                  <Pencil size={11} /> {t('order.edit', 'Tahrirlash')}
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setItems(order.items.map((item) => ({ ...item })))
                      setItemsEdit(false)
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-500"
                  >
                    Bekor
                  </button>
                  <button
                    type="button"
                    onClick={saveItems}
                    disabled={!items.length}
                    className="inline-flex items-center gap-1 rounded-lg bg-brand-500 px-2 py-1 text-[10px] font-bold text-white disabled:opacity-50"
                  >
                    <Save size={11} /> {t('order.save', 'Saqlash')}
                  </button>
                </div>
              )}
            </div>
            <ul className="divide-y divide-slate-100">
              {viewItems.map((item) => (
                <li key={item.id} className="flex items-center gap-3 px-3.5 py-2.5">
                  <SmartImage src={item.image} alt={item.name} className="h-10 w-10 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-semibold text-ink">{item.name}</p>
                    <p className="text-[10px] text-slate-400">
                      {money(item.price)} · {item.unit}
                    </p>
                  </div>
                  {itemsEdit ? (
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center rounded-lg border border-slate-200 bg-white">
                        <button
                          type="button"
                          onClick={() => setItemQty(item.id, -1)}
                          aria-label={t('order.qtyMinus', 'Kamaytirish: {name}', { name: item.name })}
                          className="grid h-7 w-7 place-items-center text-slate-500 hover:bg-slate-100"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center text-[11px] font-bold text-ink">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => setItemQty(item.id, 1)}
                          aria-label={t('order.qtyPlus', 'Ko‘paytirish: {name}', { name: item.name })}
                          className="grid h-7 w-7 place-items-center text-brand-600 hover:bg-brand-50"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        aria-label={t('order.removeItem', 'O‘chirish: {name}', { name: item.name })}
                        className="grid h-7 w-7 place-items-center rounded-lg text-slate-300 hover:bg-rose-50 hover:text-rose-500"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ) : (
                    <p className="text-[12px] font-bold text-ink">{money(item.price * item.qty)}</p>
                  )}
                </li>
              ))}
              {viewItems.length === 0 && (
                <li className="px-3.5 py-4 text-center text-[11px] text-slate-400">
                  {t('order.itemsEmpty', 'Barcha mahsulotlar olib tashlandi — saqlash uchun kamida bitta qoldiring.')}
                </li>
              )}
            </ul>
            <div className="space-y-1.5 border-t border-dashed border-slate-200 bg-slate-50/50 px-3.5 py-3 text-[12px]">
              <div className="flex justify-between text-slate-500">
                <span>{t('order.subtotal', 'Mahsulotlar')}</span>
                <span className="font-semibold text-ink">{money(viewSubtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>{t('order.delivery', 'Yetkazib berish')}</span>
                <span className={viewDelivery === 0 ? 'font-bold text-brand-600' : 'font-semibold text-ink'}>
                  {viewDelivery === 0 ? t('common.free', 'Bepul') : money(viewDelivery)}
                </span>
              </div>
              <div className="flex justify-between pt-1 text-[13px]">
                <span className="font-semibold text-slate-600">{t('order.total', 'Jami')}</span>
                <span className="text-base font-extrabold text-ink">{money(viewTotal)}</span>
              </div>
            </div>
          </div>

          {confirmDelete ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
              <p className="flex items-center gap-2 text-[12px] font-semibold text-rose-700">
                <AlertTriangle size={14} /> {t('order.deleteConfirm', '#{id} buyurtmasi butunlay o‘chiriladi. Davom etasizmi?', { id: order.id })}
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="btn-ghost h-8 flex-1 text-[11px]"
                >
                  {t('order.cancel', 'Bekor qilish')}
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  className="btn h-8 flex-1 bg-rose-600 text-[11px] text-white hover:bg-rose-700"
                >
                  {t('order.deleteYes', 'Ha, o‘chirish')}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button type="button" onClick={onClose} className="btn-ghost flex-1">
                {t('order.close', 'Yopish')}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="btn border border-rose-200 bg-white px-3 py-2.5 text-rose-600 hover:bg-rose-50"
              >
                <Trash2 size={14} /> {t('order.delete', 'O‘chirish')}
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
