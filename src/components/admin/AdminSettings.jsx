import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock3,
  Database,
  Eye,
  EyeOff,
  KeyRound,
  MapPin,
  Megaphone,
  Phone,
  RotateCcw,
  Save,
  Send,
  ShieldCheck,
  Store,
  Timer,
  Truck,
} from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { useI18n } from '../../i18n/I18nContext'
import { isTelegramConfigured } from '../../lib/telegram'
import { changeAdminPassword, isDefaultPassword, verifyAdminPassword } from '../../lib/adminAuth'
import Modal from '../ui/Modal'

export default function AdminSettings() {
  const {
    settings,
    updateSettings,
    resetSettings,
    resetDemoData,
    products,
    orders,
    toast,
  } = useStore()
  const { t, money } = useI18n()

  const [draft, setDraft] = useState(settings)
  const [errors, setErrors] = useState({})
  const [confirm, setConfirm] = useState(null) // 'demo' | 'settings'
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [pwError, setPwError] = useState('')
  const [pwSaved, setPwSaved] = useState(false)

  useEffect(() => {
    setDraft(settings)
  }, [settings])

  const dirty = JSON.stringify(draft) !== JSON.stringify(settings)

  const set = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validate = () => {
    const next = {}
    if (String(draft.storeName).trim().length < 2) next.storeName = t('settings.errName', "Do'kon nomini kiriting")
    if (String(draft.phone).replace(/\D/g, '').length < 7)
      next.phone = t('settings.errPhone', "To'g'ri telefon raqam kiriting")
    if (String(draft.address).trim().length < 5) next.address = t('settings.errAddress', 'Manzilni kiriting')
    if (String(draft.workHours).trim().length < 3)
      next.workHours = t('settings.errHours', 'Ish vaqtini kiriting')
    if (String(draft.deliveryTime).trim().length < 2)
      next.deliveryTime = t('settings.errDeliveryTime', 'Yetkazish vaqtini kiriting')
    if (Number(draft.deliveryFee) < 0) next.deliveryFee = t('settings.errFee', "Narx manfiy bo'lishi mumkin emas")
    if (Number(draft.freeDeliveryThreshold) < 0)
      next.freeDeliveryThreshold = t('settings.errThreshold', "Chegara manfiy bo'lishi mumkin emas")
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const save = () => {
    if (!validate()) {
      toast(t('settings.toastError', "Sozlamalarda xatolik bor — tekshirib qayta urinib ko'ring"), 'error')
      return
    }
    updateSettings({
      ...draft,
      storeName: draft.storeName.trim(),
      tagline: draft.tagline.trim(),
      phone: draft.phone.trim(),
      city: draft.city.trim(),
      address: draft.address.trim(),
      workHours: draft.workHours.trim(),
      deliveryTime: draft.deliveryTime.trim(),
      telegram: draft.telegram.trim(),
      instagram: draft.instagram.trim(),
      announcement: draft.announcement.trim(),
      deliveryFee: Number(draft.deliveryFee) || 0,
      freeDeliveryThreshold: Number(draft.freeDeliveryThreshold) || 0,
    })
    toast(t('settings.toastSaved', "Sozlamalar saqlandi — do'kon sahifasida darhol ko'rinadi"))
  }

  const cancel = () => {
    setDraft(settings)
    setErrors({})
  }

  const submitPassword = (event) => {
    event.preventDefault()
    setPwSaved(false)
    if (!verifyAdminPassword(pw.current)) {
      setPwError(t('settings.pwErrCurrent', "Joriy parol noto'g'ri"))
      return
    }
    if (pw.next.length < 5) {
      setPwError(t('settings.pwErrShort', "Yangi parol kamida 5 belgidan iborat bo'lishi kerak"))
      return
    }
    if (pw.next !== pw.confirm) {
      setPwError(t('settings.pwErrMatch', 'Yangi parollar mos kelmadi'))
      return
    }
    const result = changeAdminPassword(pw.next)
    if (!result.ok) {
      setPwError(result.error)
      return
    }
    setPwError('')
    setPw({ current: '', next: '', confirm: '' })
    setPwSaved(true)
    toast('Admin paroli yangilandi')
  }

  return (
    <div className="space-y-4">
      {/* Saqlash paneli */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[15px] font-extrabold tracking-tight text-ink">{t('settings.title', 'Do‘kon sozlamalari')}</h2>
          <p className="text-[11px] text-slate-500">
            {dirty
              ? t('settings.dirty', "Saqlanmagan o'zgarishlar bor")
              : t('settings.clean', "Barcha o'zgarishlar do'kon sahifasiga ta'sir qiladi")}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={cancel}
            disabled={!dirty}
            className="btn-ghost h-10 flex-1 px-3 text-[12px] sm:flex-none"
          >
            {t('settings.cancel', 'Bekor qilish')}
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!dirty}
            className="btn-primary h-10 flex-1 px-4 text-[12px] sm:flex-none"
          >
            <Save size={15} /> {t('settings.save', 'Saqlash')}
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* Do'kon ma'lumotlari */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
          <SectionTitle icon={Building2} title={t('settings.storeTitle', 'Do‘kon ma’lumotlari')} subtitle={t('settings.storeSub', "Saytda ko'rinadigan brend ma'lumotlari")} />

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label={t('settings.name', 'Do‘kon nomi')} error={errors.storeName} className="sm:col-span-2">
              <input
                value={draft.storeName}
                  aria-label="Do'kon nomi"
                onChange={(e) => set('storeName', e.target.value)}
                placeholder="FreshMarket"
                className={`field ${errors.storeName ? 'border-rose-300' : ''}`}
              />
            </Field>

            <Field label={t('settings.tagline', 'Shior / tavsif')} className="sm:col-span-2">
              <input
                value={draft.tagline}
                  aria-label="Shior"
                onChange={(e) => set('tagline', e.target.value)}
                placeholder={t('settings.taglinePh', 'Yangi mahsulotlar — 30 daqiqada eshigingizgacha')}
                className="field"
              />
            </Field>

            <Field label={t('settings.phone', 'Telefon')} error={errors.phone}>
              <div className="relative">
                <Phone size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={draft.phone}
                  aria-label="Telefon"
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="+998 71 200 30 30"
                  className={`field pl-8 ${errors.phone ? 'border-rose-300' : ''}`}
                />
              </div>
            </Field>

            <Field label={t('settings.hours', 'Ish vaqti')} error={errors.workHours}>
              <div className="relative">
                <Clock3 size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={draft.workHours}
                  aria-label="Ish vaqti"
                  onChange={(e) => set('workHours', e.target.value)}
                  placeholder="Har kuni 08:00 – 23:00"
                  className={`field pl-8 ${errors.workHours ? 'border-rose-300' : ''}`}
                />
              </div>
            </Field>

            <Field label={t('settings.city', 'Shahar')}>
              <input
                value={draft.city}
                  aria-label="Shahar"
                onChange={(e) => set('city', e.target.value)}
                placeholder="Toshkent"
                className="field"
              />
            </Field>

            <Field label="Telegram">
              <input
                value={draft.telegram}
                  aria-label="Telegram"
                onChange={(e) => set('telegram', e.target.value)}
                placeholder="@freshmarket_uz"
                className="field"
              />
            </Field>

            <Field label="Instagram">
              <input
                value={draft.instagram}
                  aria-label="Instagram"
                onChange={(e) => set('instagram', e.target.value)}
                placeholder="@freshmarket.uz"
                className="field"
              />
            </Field>

            <Field label={t('settings.support', 'Qo‘llab-quvvatlash matni')} className="sm:col-span-2">
              <input
                value={draft.supportNote}
                  aria-label="Qo'llab-quvvatlash matni"
                onChange={(e) => set('supportNote', e.target.value)}
                placeholder="Savollar bo'lsa, qo'ng'iroq qiling"
                className="field"
              />
            </Field>

            <Field label={t('settings.address', 'Manzil')} error={errors.address} className="sm:col-span-2">
              <div className="relative">
                <MapPin size={14} className="pointer-events-none absolute left-3 top-3 text-slate-400" />
                <textarea
                  value={draft.address}
                  aria-label="Manzil"
                  onChange={(e) => set('address', e.target.value)}
                  rows={2}
                  placeholder="Toshkent sh., Chilonzor tumani, ..."
                  className={`field resize-none pl-8 ${errors.address ? 'border-rose-300' : ''}`}
                />
              </div>
            </Field>
          </div>

          {/* Ko'rinishi */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
              {t('settings.previewTitle', 'Do‘konda qanday ko‘rinadi')}
            </p>
            <p className="text-[14px] font-extrabold text-ink">{draft.storeName || t('settings.name', 'Do‘kon nomi')}</p>
            <p className="text-[11px] text-slate-500">{draft.tagline || t('settings.tagline', 'Shior')}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-500">
              <span className="inline-flex items-center gap-1">
                <Phone size={11} /> {draft.phone || '—'}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock3 size={11} /> {draft.workHours || '—'}
              </span>
            </div>
          </div>
        </section>

        <div className="space-y-4">
          {/* Yetkazib berish */}
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
            <SectionTitle icon={Truck} title={t('settings.deliveryTitle', 'Yetkazib berish')} subtitle={t('settings.deliverySub', 'Narx, chegara va vaqt')} />

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label={t('settings.deliveryFee', 'Yetkazish narxi (so‘m)')} error={errors.deliveryFee}>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={draft.deliveryFee}
                  aria-label="Yetkazish narxi"
                  onChange={(e) => set('deliveryFee', e.target.value)}
                  className={`field ${errors.deliveryFee ? 'border-rose-300' : ''}`}
                />
              </Field>

              <Field label={t('settings.freeThreshold', 'Bepul yetkazish chegarasi')} error={errors.freeDeliveryThreshold}>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={draft.freeDeliveryThreshold}
                  aria-label="Bepul yetkazish chegarasi"
                  onChange={(e) => set('freeDeliveryThreshold', e.target.value)}
                  className={`field ${errors.freeDeliveryThreshold ? 'border-rose-300' : ''}`}
                />
              </Field>

              <Field label={t('settings.deliveryTime', 'Yetkazish vaqti matni')} error={errors.deliveryTime} className="sm:col-span-2">
                <div className="relative">
                  <Timer size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={draft.deliveryTime}
                  aria-label="Yetkazish vaqti"
                    onChange={(e) => set('deliveryTime', e.target.value)}
                    placeholder="30 daqiqada"
                    className={`field pl-8 ${errors.deliveryTime ? 'border-rose-300' : ''}`}
                  />
                </div>
              </Field>
            </div>

            <p className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-[11px] leading-relaxed text-brand-800">
              {t('settings.calc', 'Hozirgi hisob: {fee} yetkazish · {threshold}dan bepul', {
                fee: money(Number(draft.deliveryFee) || 0),
                threshold: money(Number(draft.freeDeliveryThreshold) || 0),
              })}
            </p>
          </section>

          {/* Do'kon holati */}
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
            <SectionTitle icon={Store} title={t('settings.statusTitle', 'Do‘kon holati')} subtitle={t('settings.statusSub', "Qabul rejimi va e'lon")} />

            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <div>
                <p className="text-[12px] font-bold text-ink">
                  {draft.storeOpen ? t('settings.open', 'Do‘kon ochiq') : t('settings.closed', 'Do‘kon yopiq')}
                </p>
                <p className="text-[10px] text-slate-500">
                  {draft.storeOpen
                    ? t('settings.openNote', 'Mijozlar buyurtma bera oladi')
                    : t('settings.closedNote', 'Buyurtma tugmasi vaqtincha o‘chiriladi')}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={draft.storeOpen}
                onClick={() => set('storeOpen', !draft.storeOpen)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                  draft.storeOpen ? 'bg-brand-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                    draft.storeOpen ? 'left-[22px]' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            <Field label={t('settings.announcement', 'E’lon (do‘kon tepasida ko‘rinadi)')} className="mt-3">
              <div className="relative">
                <Megaphone size={14} className="pointer-events-none absolute left-3 top-3 text-slate-400" />
                <textarea
                  value={draft.announcement}
                  aria-label="E'lon"
                  onChange={(e) => set('announcement', e.target.value)}
                  rows={2}
                  placeholder={t('settings.announcementPh', 'Masalan: Bugun barcha mevalarga 10% chegirma!')}
                  className="field resize-none pl-8"
                />
              </div>
            </Field>
            <p className="mt-2 text-[10px] leading-relaxed text-slate-400">
              {t('settings.announcementNote', 'E’lon bo‘sh bo‘lsa, do‘kon sahifasida qo‘shimcha lenta ko‘rinmaydi. Do‘kon yopiq bo‘lsa, mijozlar buyurtma bera olmaydi.')}
            </p>
          </section>
        </div>

        {/* Xavfsizlik */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
          <SectionTitle icon={ShieldCheck} title={t('settings.securityTitle', 'Xavfsizlik')} subtitle={t('settings.securitySub', 'Admin panelga kirish paroli')} />

          <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
            <div>
              <p className="text-[12px] font-semibold text-slate-600">{t('settings.currentPassword', 'Joriy parol')}</p>
              <p className="text-[10px] text-slate-400">
                {isDefaultPassword()
                  ? t('settings.demoPassword', 'Demo parol ishlatilmoqda')
                  : t('settings.changedPassword', 'Parol o‘zgartirilgan')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setPasswordOpen((v) => !v)
                setPwError('')
                setPwSaved(false)
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-600 transition hover:border-brand-300 hover:text-brand-700"
            >
              <KeyRound size={13} /> {passwordOpen ? t('settings.close', 'Yopish') : t('settings.change', 'O‘zgartirish')}
            </button>
          </div>

          {passwordOpen && (
            <form onSubmit={submitPassword} className="mt-3 space-y-2.5">
              <PasswordField
                label={t('settings.pwCurrent', 'Joriy parol')}
                value={pw.current}
                onChange={(v) => {
                  setPw((p) => ({ ...p, current: v }))
                  setPwError('')
                }}
                autoComplete="current-password"
              />
              <PasswordField
                label={t('settings.pwNew', 'Yangi parol')}
                value={pw.next}
                onChange={(v) => {
                  setPw((p) => ({ ...p, next: v }))
                  setPwError('')
                }}
                autoComplete="new-password"
              />
              <PasswordField
                label={t('settings.pwConfirm', 'Yangi parolni tasdiqlang')}
                value={pw.confirm}
                onChange={(v) => {
                  setPw((p) => ({ ...p, confirm: v }))
                  setPwError('')
                }}
                autoComplete="new-password"
              />
              {pwError && <p className="text-[11px] font-medium text-rose-600">{pwError}</p>}
              {pwSaved && (
                <p className="inline-flex items-center gap-1.5 text-[11px] font-medium text-brand-600">
                  <CheckCircle2 size={12} /> {t('settings.pwSaved', 'Parol yangilandi')}
                </p>
              )}
              <button type="submit" className="btn-primary h-9 w-full text-[12px]">
                {t('settings.pwSave', 'Parolni saqlash')}
              </button>
            </form>
          )}
        </section>

        {/* Telegram */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
          <SectionTitle icon={Send} title={t('settings.tgTitle', 'Telegram integratsiyasi')} subtitle={t('settings.tgSub', 'Yangi buyurtmalar bot orqali yuboriladi')} />

          <div
            className={`mt-4 flex items-start gap-2.5 rounded-xl border px-3 py-2.5 ${
              isTelegramConfigured
                ? 'border-brand-200 bg-brand-50 text-brand-800'
                : 'border-amber-200 bg-amber-50 text-amber-800'
            }`}
          >
            {isTelegramConfigured ? (
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-brand-600" />
            ) : (
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" />
            )}
            <div className="text-[11px] leading-relaxed">
              <p className="font-bold">
                {isTelegramConfigured ? t('settings.tgActive', 'Ulanish faol') : t('settings.tgDemo', 'Demo rejim — token sozlanmagan')}
              </p>
              <p className="mt-0.5 opacity-80">
                {isTelegramConfigured
                  ? t('settings.tgActiveText', 'Buyurtma tasdiqlanganda xabar Telegram guruhiga yuboriladi.')
                  : t('settings.tgDemoText', 'Buyurtmalar admin panelda saqlanadi, ammo Telegramga yuborilmaydi.')}}
              </p>
            </div>
          </div>

          <div className="mt-3 space-y-1.5 text-[11px] text-slate-500">
            <p className="font-bold text-slate-600">{t('settings.tgSetup', 'Sozlash')}</p>
            <p>
              {t('settings.tgSetupText', 'Hosting panelida VITE_TELEGRAM_BOT_TOKEN va VITE_TELEGRAM_CHAT_ID ni kiriting, so‘ng qayta deploy qiling.')}
            </p>
          </div>
        </section>

        {/* Ma'lumotlar */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
          <SectionTitle icon={Database} title={t('settings.dataTitle', 'Ma’lumotlar')} subtitle={t('settings.dataSub', 'Brauzer xotirasidagi demo baza')} />

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{t('settings.products', 'Mahsulotlar')}</p>
              <p className="text-lg font-extrabold text-ink">{products.length}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{t('settings.orders', 'Buyurtmalar')}</p>
              <p className="text-lg font-extrabold text-ink">{orders.length}</p>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <button
              type="button"
              onClick={() => setConfirm('demo')}
              className="btn w-full border border-rose-200 bg-rose-50 px-4 py-2.5 text-[12px] text-rose-600 hover:bg-rose-100"
            >
              {t('settings.resetDemo', 'Demo ma’lumotlarni tiklash')}
            </button>
            <button
              type="button"
              onClick={() => setConfirm('settings')}
              className="btn w-full border border-slate-200 bg-white px-4 py-2.5 text-[12px] text-slate-600 hover:bg-slate-50"
            >
              <RotateCcw size={14} /> {t('settings.resetSettings', 'Sozlamalarni boshlang‘ich holatga qaytarish')}
            </button>
          </div>

          <p className="mt-3 text-[10px] leading-relaxed text-slate-400">
            {t('settings.dataNote', 'Ishlab chiqarish muhitida ma’lumotlarni serverda saqlash tavsiya etiladi — hozircha o‘zgarishlar brauzer xotirasida (localStorage) saqlanadi.')}
          </p>
        </section>
      </div>

      {/* Pastki saqlash */}
      {dirty && (
        <div className="sticky bottom-3 z-20 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 px-3 py-2.5 shadow-lift backdrop-blur">
          <p className="hidden flex-1 text-[11px] font-medium text-slate-500 sm:block">
            {t('settings.dirty', 'Saqlanmagan o‘zgarishlar bor')}
          </p>
          <button type="button" onClick={cancel} className="btn-ghost h-9 flex-1 px-3 text-[12px] sm:flex-none">
            {t('settings.cancel', 'Bekor qilish')}
          </button>
          <button type="button" onClick={save} className="btn-primary h-9 flex-1 px-4 text-[12px] sm:flex-none">
            <Save size={14} /> {t('settings.save', 'Saqlash')}
          </button>
        </div>
      )}

      {/* Tasdiqlash */}
      <Modal
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        panelClassName="max-w-sm"
        ariaLabel="Tasdiqlash"
      >
        <div className="p-5 pt-6">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-rose-50 text-rose-500">
            <AlertTriangle size={22} />
          </div>
          <h3 className="mt-3 text-center text-base font-extrabold text-ink">
            {confirm === 'demo'
              ? t('settings.confirmDemoTitle', 'Demo ma’lumotlarni tiklaysizmi?')
              : t('settings.confirmSettingsTitle', 'Sozlamalarni tiklaysizmi?')}
          </h3>
          <p className="mt-1 text-center text-[12px] leading-relaxed text-slate-500">
            {confirm === 'demo'
              ? t('settings.confirmDemoText', "Barcha buyurtmalar o'chiriladi, mahsulotlar boshlang'ich holatga qaytadi va savat tozalanadi.")
              : t('settings.confirmSettingsText', "Do'kon nomi, telefon, manzil va yetkazib berish sozlamalari boshlang'ich qiymatga qaytadi.")}
          </p>
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={() => setConfirm(null)} className="btn-ghost flex-1">
              {t('settings.cancel', 'Bekor qilish')}
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm === 'demo') resetDemoData()
                else {
                  resetSettings()
                  toast(t('settings.toastResetSettings', 'Sozlamalar tiklandi'))
                }
                setConfirm(null)
              }}
              className="btn flex-1 bg-rose-600 px-4 py-2.5 text-white hover:bg-rose-700"
            >
              {t('settings.confirmReset', 'Tiklash')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function SectionTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
        <Icon size={17} />
      </div>
      <div>
        <h2 className="text-[14px] font-extrabold text-ink">{title}</h2>
        <p className="text-[11px] text-slate-500">{subtitle}</p>
      </div>
    </div>
  )
}

function Field({ label, error, className = '', children }) {
  return (
    <div className={className}>
      <label className="field-label">{label}</label>
      {children}
      {error && <p className="mt-1 text-[11px] font-medium text-rose-600">{error}</p>}
    </div>
  )
}

function PasswordField({ label, value, onChange, autoComplete }) {
  const { t } = useI18n()
  const [show, setShow] = useState(false)
  return (
    <div>
      <label className="field-label">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          aria-label={label}
          placeholder="••••••••"
          className="field pr-10"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={t('settings.pwToggle', 'Parolni ko‘rsatish')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-600"
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  )
}
