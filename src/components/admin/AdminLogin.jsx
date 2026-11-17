import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Eye, EyeOff, KeyRound, Lock, ShieldCheck, Sparkles } from 'lucide-react'
import { isDefaultPassword, verifyAdminPassword } from '../../lib/adminAuth'
import { useStore } from '../../store/StoreContext'
import { useI18n } from '../../i18n/I18nContext'
import LanguageSwitcher from '../ui/LanguageSwitcher'
import Logo from '../store/Logo'

export default function AdminLogin({ onSuccess, onBack }) {
  const { settings } = useStore()
  const { t } = useI18n()
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [shake, setShake] = useState(0)

  const submit = (e) => {
    e.preventDefault()
    if (verifyAdminPassword(password)) {
      setError('')
      onSuccess()
    } else {
      setError(t('admin.login.wrong', "Parol noto'g'ri. Demo uchun: admin123"))
      setShake((n) => n + 1)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="relative grid w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lift md:grid-cols-2">
        {/* Chap panel */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-emerald-500 p-8 text-white md:flex">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <Logo light />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider ring-1 ring-white/20">
              <Sparkles size={12} /> {t('admin.login.title', 'Boshqaruv paneli')}
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight">
              {t('admin.login.heroTitle', 'Do‘koningizni bir joydan boshqaring')}
            </h1>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/75">
              {t('admin.login.heroText', 'Buyurtmalar, mahsulotlar va real vaqtdagi statistikalar — barchasi admin panelida.')}
            </p>
          </div>
          <div className="relative grid grid-cols-2 gap-3 text-[11px]">
            <div className="rounded-xl bg-white/10 p-3 ring-1 ring-white/15">
              <p className="text-lg font-extrabold">24/7</p>
              <p className="text-white/60">{t('admin.login.stat1', 'Buyurtmalarni kuzatish')}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3 ring-1 ring-white/15">
              <p className="text-lg font-extrabold">{t('admin.login.stat2Value', '1 daqiqa')}</p>
              <p className="text-white/60">{t('admin.login.stat2', 'Mahsulot qo‘shish')}</p>
            </div>
          </div>
        </div>

        {/* Forma */}
        <motion.div
          key={shake}
          initial={shake ? { x: -6 } : false}
          animate={shake ? { x: [6, -6, 4, -4, 0] } : {}}
          transition={{ duration: 0.35 }}
          className="p-7 sm:p-9"
        >
          <div className="flex items-center justify-between md:hidden">
            <Logo />
            <LanguageSwitcher variant="compact" />
          </div>
          <div className="absolute right-5 top-5 hidden md:block">
            <LanguageSwitcher variant="segmented" />
          </div>
          <div className="mt-6 md:mt-0">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-600">
              <Lock size={20} />
            </div>
            <h2 className="mt-3 text-xl font-extrabold tracking-tight text-ink">{t('admin.login.heading', 'Admin panelga kirish')}</h2>
            <p className="mt-1 text-[12px] text-slate-500">
              {t('admin.login.subtitle', 'Davom etish uchun boshqaruv parolini kiriting.')}
            </p>
          </div>

          <form onSubmit={submit} className="mt-5 space-y-3">
            <div>
              <label htmlFor="admin-password" className="field-label">
                {t('admin.login.password', 'Parol')}
              </label>
              <div className="relative">
                <KeyRound
                  size={15}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="admin-password"
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError('')
                  }}
                  placeholder="••••••••"
                  autoFocus
                  className={`field pl-9 pr-10 ${error ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-500/10' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? 'Parolni yashirish' : "Parolni ko'rsatish"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-600"
                >
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {error && <p className="mt-1 text-[11px] font-medium text-rose-600">{error}</p>}
            </div>

            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
              <ShieldCheck size={15} className="mt-0.5 shrink-0 text-amber-600" />
              <p className="text-[11px] leading-relaxed text-amber-800">
                {isDefaultPassword() ? (
                  <>
                    <span className="font-bold">{t('admin.login.demo', 'Demo rejim. Kirish paroli:')}</span>{' '}
                    <code className="rounded bg-white px-1 py-0.5 font-bold text-amber-900">admin123</code>
                  </>
                ) : (
                  <>{t('admin.login.changed', 'Parol o‘zgartirilgan. Uni Sozlamalar bo‘limida yangilashingiz mumkin.')}</>
                )}
              </p>
            </div>

            <button type="submit" className="btn-primary h-11 w-full">
              {t('admin.login.submit', 'Kirish')}
            </button>
          </form>

          <button
            type="button"
            onClick={onBack}
            className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 transition hover:text-ink"
          >
            <ArrowLeft size={14} /> {t('admin.login.back', 'Do‘konga qaytish')}
          </button>

          <p className="mt-6 text-[10px] leading-relaxed text-slate-400">
            {t('admin.login.footer', '{name} admin paneli · Faqat vakolatli xodimlar uchun.', { name: settings.storeName })}
          </p>
        </motion.div>
      </div>
    </div>
  )
}
