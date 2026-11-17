import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { CATEGORIES } from '../../data/products'
import { useStore } from '../../store/StoreContext'
import { useI18n } from '../../i18n/I18nContext'
import { categoryLabel } from '../../i18n/categoryKeys'

import SmartImage from '../ui/SmartImage'
import Modal from '../ui/Modal'
import ProductFormModal from './ProductFormModal'

export default function ProductsManager() {
  const { products, updateProduct, deleteProduct, toast } = useStore()
  const { t, money } = useI18n()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [stock, setStock] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return products.filter((p) => {
      if (category !== 'all' && p.category !== category) return false
      if (stock !== 'all' && p.stock !== stock) return false
      if (!term) return true
      return p.name.toLowerCase().includes(term) || p.unit.toLowerCase().includes(term)
    })
  }, [products, query, category, stock])

  const openAdd = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (product) => {
    setEditing(product)
    setFormOpen(true)
  }

  const toggleStock = (product) => {
    const next = product.stock === 'out' ? 'in' : 'out'
    updateProduct(product.id, { stock: next })
    toast(
      t('products.toastStock', '{name}: {status}', {
        name: product.name,
        status: next === 'in' ? t('products.inStock', 'sotuvda bor') : t('products.out', 'tugagan'),
      }),
    )
  }

  const confirmDelete = () => {
    if (!deleting) return
    deleteProduct(deleting.id)
    toast(t('products.toastDeleted', '“{name}” o‘chirildi', { name: deleting.name }))
    setDeleting(null)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-[15px] font-extrabold tracking-tight text-ink">{t('products.title', 'Mahsulotlar')}</h2>
            <p className="text-[11px] text-slate-500">
              {t('products.count', 'Ko‘rsatilmoqda: {shown} / {total}', { shown: filtered.length, total: products.length })}
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 lg:w-auto lg:flex-row lg:items-center">
            <div className="relative w-full lg:w-56">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('products.search', 'Mahsulot qidirish...')}
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
            <div className="flex flex-wrap items-center gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Kategoriya filtri"
              className="h-9 min-w-[135px] flex-1 rounded-xl border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-600 outline-none focus:border-brand-400 lg:flex-none"
            >
              <option value="all">{t('products.allCategories', 'Barcha kategoriyalar')}</option>
              {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              aria-label="Holat filtri"
              className="h-9 min-w-[115px] flex-1 rounded-xl border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-600 outline-none focus:border-brand-400 lg:flex-none"
            >
              <option value="all">{t('products.allStock', 'Barcha holatlar')}</option>
              <option value="in">{t('products.inStock', 'Sotuvda bor')}</option>
              <option value="out">{t('products.out', 'Tugagan')}</option>
            </select>
            <button type="button" onClick={openAdd} className="btn-primary h-9 w-full px-3 text-[12px] sm:w-auto">
              <Plus size={15} /> {t('products.add', 'Yangi mahsulot')}
            </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop jadval */}
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card lg:block">
        <table className="w-full text-left">
          <thead className="border-b border-slate-100 bg-slate-50/70">
            <tr className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3">{t('products.colProduct', 'Mahsulot')}</th>
              <th className="px-4 py-3">{t('products.colCategory', 'Kategoriya')}</th>
              <th className="px-4 py-3">{t('products.colPrice', 'Narx')}</th>
              <th className="px-4 py-3">{t('products.colStatus', 'Holat')}</th>
              <th className="px-4 py-3 text-right">{t('products.colActions', 'Amallar')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <AnimatePresence initial={false}>
              {filtered.map((product) => (
                <motion.tr
                  key={product.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[12px] transition hover:bg-slate-50/70"
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <SmartImage
                        src={product.image}
                        alt={product.name}
                        className="h-11 w-11 shrink-0 rounded-xl"
                      />
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 truncate font-bold text-ink">
                          {product.name}
                          {product.isNew && (
                            <span className="rounded bg-brand-50 px-1 py-0.5 text-[8px] font-extrabold uppercase text-brand-600">
                              {t('products.newTag', 'Yangi')}
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {product.unit} · ID: {product.id.slice(0, 10)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">
                    {categoryLabel(t, CATEGORIES.find((c) => c.id === product.category))}
                  </td>
                  <td className="px-4 py-2.5">
                    <p className="font-extrabold text-ink">{money(product.price)}</p>
                    {product.oldPrice ? (
                      <p className="text-[10px] text-slate-400 line-through">{money(product.oldPrice)}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-2.5">
                    <button
                      type="button"
                      onClick={() => toggleStock(product)}
                      className={`inline-flex items-center gap-2 rounded-full border px-2 py-0.5 text-[10px] font-bold transition ${
                        product.stock === 'in'
                          ? 'border-brand-200 bg-brand-50 text-brand-700 hover:border-brand-300'
                          : 'border-slate-200 bg-slate-100 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          product.stock === 'in' ? 'bg-brand-500' : 'bg-slate-400'
                        }`}
                      />
                      {product.stock === 'in' ? t('products.inStock', 'Sotuvda bor') : t('products.out', 'Tugagan')}
                    </button>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEdit(product)}
                        aria-label={`${product.name}ni tahrirlash`}
                        className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(product)}
                        aria-label={`${product.name}ni o'chirish`}
                        className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="px-4 py-12 text-center">
            <p className="text-sm font-semibold text-slate-500">{t('products.empty', 'Mahsulot topilmadi')}</p>
            <button type="button" onClick={openAdd} className="btn-primary mt-3 h-9 text-[12px]">
              <Plus size={14} /> {t('products.add', 'Yangi mahsulot qo‘shish')}
            </button>
          </div>
        )}
      </div>

      {/* Mobil kartalar */}
      <div className="space-y-2.5 lg:hidden">
        {filtered.map((product) => (
          <div key={product.id} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-card">
            <div className="flex items-center gap-3">
              <SmartImage src={product.image} alt={product.name} className="h-14 w-14 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-bold text-ink">{product.name}</p>
                <p className="text-[10px] text-slate-400">
                  {product.unit} · {categoryLabel(t, CATEGORIES.find((c) => c.id === product.category))}
                </p>
                <p className="mt-1 text-[13px] font-extrabold text-ink">{money(product.price)}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleStock(product)}
                className={`shrink-0 rounded-full border px-2 py-1 text-[9px] font-bold ${
                  product.stock === 'in'
                    ? 'border-brand-200 bg-brand-50 text-brand-700'
                    : 'border-slate-200 bg-slate-100 text-slate-500'
                }`}
              >
                {product.stock === 'in' ? t('products.inStock', 'Sotuvda') : t('products.out', 'Tugagan')}
              </button>
            </div>
            <div className="mt-2.5 flex gap-2">
              <button
                type="button"
                onClick={() => openEdit(product)}
                aria-label={`${product.name}ni tahrirlash`}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-1.5 text-[11px] font-bold text-slate-600"
              >
                <Pencil size={12} /> {t('products.edit', 'Tahrirlash')}
              </button>
              <button
                type="button"
                onClick={() => setDeleting(product)}
                aria-label={`${product.name}ni o'chirish`}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-[11px] font-bold text-rose-600"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-10 text-center">
            <p className="text-sm font-semibold text-slate-500">{t('products.empty', 'Mahsulot topilmadi')}</p>
          </div>
        )}
      </div>

      <ProductFormModal open={formOpen} product={editing} onClose={() => setFormOpen(false)} />

      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        panelClassName="max-w-sm"
        ariaLabel="Mahsulotni o'chirish"
      >
        <div className="p-5 pt-6">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-rose-50 text-rose-500">
            <AlertTriangle size={22} />
          </div>
          <h3 className="mt-3 text-center text-base font-extrabold text-ink">
            {t('products.deleteTitle', 'Mahsulotni o‘chirasizmi?')}
          </h3>
          <p className="mt-1 text-center text-[12px] leading-relaxed text-slate-500">
            {t(
              'products.deleteText',
              '“{name}” katalogdan butunlay olib tashlanadi. Bu amalni bekor qilib bo‘lmaydi.',
              { name: deleting?.name || '' },
            )}
          </p>
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={() => setDeleting(null)} className="btn-ghost flex-1">
              {t('common.cancel', 'Bekor qilish')}
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="btn flex-1 bg-rose-600 px-4 py-2.5 text-white hover:bg-rose-700"
            >
              {t('products.deleteConfirm', 'O‘chirish')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
