import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Leaf,
  Sparkles,
  Timer,
  Truck,
} from 'lucide-react'
import SmartImage from '../ui/SmartImage'
import { useStore } from '../../store/StoreContext'
import { useI18n } from '../../i18n/I18nContext'
import { cn } from '../../lib/utils'
import { localizeDeliveryTime } from '../../i18n/format'

const SLIDES = [
  {
    id: 'fruits',
    eyebrow: { k: 'hero.newSeason', u: 'Yangi mavsum' },
    title: { k: 'hero.fruitsTitle', u: 'Meva va sabzavotlar' },
    highlight: { k: 'hero.fruitsHighlight', u: '30% gacha chegirma' },
    text: {
      k: 'hero.fruitsText',
      u: 'Har kuni tongda terilgan mahsulotlar. Saralangan, yuvilgan va sovuq zanjirda yetkaziladi.',
    },
    cta: { k: 'hero.fruitsCta', u: 'Xaridni boshlash' },
    caption: { k: 'hero.fruitsCaption', u: 'Qulupnay · 34 000 so‘m' },
    category: 'meva',
    image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=900&h=900&q=80',
    gradient: 'from-brand-700 via-brand-600 to-emerald-400',
  },
  {
    id: 'bakery',
    eyebrow: { k: 'hero.bakeryTime', u: 'Nonushta vaqti' },
    title: { k: 'hero.bakeryTitle', u: 'Issiq non va pishiriqlar' },
    highlight: { k: 'hero.bakeryHighlight', u: '15% chegirma' },
    text: {
      k: 'hero.bakeryText',
      u: "Tandirdan chiqqan patir, sariyog'li kruassan va yangi baguette — ertalab 8:00 dan.",
    },
    cta: { k: 'hero.bakeryCta', u: 'Nonushtani tanlash' },
    caption: { k: 'hero.bakeryCaption', u: 'Kruassan · 9 500 so‘m' },
    category: 'non',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&h=900&q=80',
    gradient: 'from-amber-600 via-amber-500 to-orange-400',
  },
  {
    id: 'drinks',
    eyebrow: { k: 'hero.drinksParty', u: 'Salqin ichimliklar' },
    title: { k: 'hero.drinksTitle', u: 'Ichimliklar bayrami!' },
    highlight: { k: 'hero.drinksHighlight', u: '2 + 1 sovg‘a' },
    text: {
      k: 'hero.drinksText',
      u: "Muzdek gazli ichimliklar, tabiiy sharbatlar va ko'k choy. Savatga 2 ta qo'shing — 3-chisi bizdan.",
    },
    cta: { k: 'hero.drinksCta', u: 'Ichimliklarni ko‘rish' },
    caption: { k: 'hero.drinksCaption', u: 'Coca-Cola · 9 500 so‘m' },
    category: 'ichimliklar',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=900&h=900&q=80',
    gradient: 'from-slate-900 via-slate-800 to-brand-700',
  },
]

export default function Hero({ onCta }) {
  const { settings } = useStore()
  const { t, money, lang } = useI18n()
  const [index, setIndex] = useState(0)
  const paused = useRef(false)

  const perks = [
    {
      icon: Timer,
      title: localizeDeliveryTime(settings.deliveryTime, lang),
      text: t('hero.perkFast', '{city} bo‘ylab tez yetkazib berish', { city: settings.city }),
    },
    {
      icon: Leaf,
      title: t('hero.perkFresh', '100% yangi'),
      text: t('hero.perkFreshText', 'Har kuni yangi partiya, sifat nazorati'),
    },
    {
      icon: Truck,
      title: t('hero.perkFree', 'Bepul yetkazish'),
      text: t('hero.perkFreeText', '{amount}dan yuqori buyurtmaga', {
        amount: money(settings.freeDeliveryThreshold),
      }),
    },
    {
      icon: CreditCard,
      title: t('hero.perkPayment', "Qulay to'lov"),
      text: t('hero.perkPaymentText', 'Naqd pul, Click yoki Payme'),
    },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      if (!paused.current) setIndex((i) => (i + 1) % SLIDES.length)
    }, 6500)
    return () => clearInterval(timer)
  }, [])

  const slide = SLIDES[index]
  const go = (dir) => setIndex((i) => (i + dir + SLIDES.length) % SLIDES.length)

  return (
    <section className="container-page pt-4 sm:pt-6">
      <div
        className="relative overflow-hidden rounded-[26px] shadow-lift sm:rounded-[32px]"
        onMouseEnter={() => (paused.current = true)}
        onMouseLeave={() => (paused.current = false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className={cn('relative bg-gradient-to-br', slide.gradient)}
          >
            {/* dekorativ doiralar */}
            <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

            <div className="relative grid gap-5 p-5 sm:gap-6 sm:p-9 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:p-12">
              <div className="text-white">
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider ring-1 ring-white/20 backdrop-blur"
                >
                  <Sparkles size={13} /> {t(slide.eyebrow.k, slide.eyebrow.u)}
                </motion.span>

                <motion.h1
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mt-3.5 text-balance text-[27px] font-extrabold leading-[1.1] tracking-tight sm:mt-4 sm:text-[40px] lg:text-[46px]"
                >
                  {t(slide.title.k, slide.title.u)}
                  <span className="mt-1 block text-white/85">{t(slide.highlight.k, slide.highlight.u)}</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.16 }}
                  className="mt-2.5 max-w-md text-[13px] leading-relaxed text-white/80 sm:mt-3 sm:text-[15px]"
                >
                  {t(slide.text.k, slide.text.u)}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22 }}
                  className="mt-5 flex flex-wrap items-center gap-2.5 sm:mt-6 sm:gap-3"
                >
                  <button
                    type="button"
                    onClick={() => onCta(slide.category)}
                    className="group inline-flex h-12 items-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-ink shadow-lg transition hover:bg-brand-50 active:scale-[0.98]"
                  >
                    {t(slide.cta.k, slide.cta.u)}
                    <ArrowRight size={17} className="transition group-hover:translate-x-0.5" />
                  </button>
                  <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2.5 text-xs font-semibold text-white ring-1 ring-white/20 backdrop-blur">
                    <Timer size={15} className="text-brand-200" />
                    {t('hero.deliveryPill', '{time} yetkazib beramiz', { time: localizeDeliveryTime(settings.deliveryTime, lang) })}
                  </div>
                </motion.div>

                <div className="mt-6 hidden items-center gap-4 text-[11px] font-medium text-white/60 sm:flex">
                  <span className="inline-flex items-center gap-1.5">
                    <Truck size={13} />{' '}
                    {t('hero.freeDelivery', '{amount}dan bepul yetkazish', {
                      amount: money(settings.freeDeliveryThreshold),
                    })}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CreditCard size={13} /> {t('hero.payMethods', 'Click · Payme · Naqd')}
                  </span>
                </div>
              </div>

              {/* Rasm kollaji */}
              <div className="relative mx-auto w-full max-w-[420px] pb-8 sm:pb-0">
                <motion.div
                  initial={{ opacity: 0, scale: 0.94, rotate: -2 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="relative aspect-[16/10] overflow-hidden rounded-2xl ring-1 ring-white/25 sm:aspect-[5/4] sm:rounded-3xl"
                >
                  <SmartImage
                    src={slide.image}
                    alt={t(slide.title.k, slide.title.u)}
                    className="h-full w-full"
                    imgClassName="scale-105"
                    loading="eager"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 rounded-xl bg-white/90 px-3 py-1.5 text-[11px] font-bold text-ink shadow-sm backdrop-blur">
                    {t(slide.caption.k, slide.caption.u)}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="absolute -bottom-4 -left-2 hidden items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-lift sm:-left-6 sm:flex"
                >
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-50 text-brand-600">
                    <Leaf size={15} />
                  </div>
                  <div className="leading-tight">
                    <p className="text-[11px] font-extrabold text-ink">{t('hero.freshDaily', 'Har kuni yangi')}</p>
                    <p className="text-[10px] text-slate-500">{t('hero.qualityChecked', 'Sifat nazoratidan o‘tgan')}</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="absolute -right-1 top-4 hidden rounded-2xl bg-amber-500 px-3 py-2 text-white shadow-lift sm:-right-3 sm:block"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-white/80">{t('hero.today', 'Bugungi')}</p>
                  <p className="text-sm font-extrabold leading-tight">{t('hero.discounts', 'Chegirmalar')}</p>
                </motion.div>
              </div>
            </div>

            {/* Slayder boshqaruvi */}
            <div className="absolute inset-x-5 bottom-4 flex items-center justify-between sm:inset-x-6 sm:bottom-6">
              <div className="flex items-center gap-1.5">
                {SLIDES.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`${i + 1}`}
                    className={cn(
                      'h-1.5 rounded-full transition-all',
                      i === index ? 'w-7 bg-white' : 'w-2.5 bg-white/40 hover:bg-white/70',
                    )}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label={t('hero.slidePrev', 'Oldingi slayd')}
                  className="grid h-8 w-8 place-items-center rounded-full bg-white/15 text-white ring-1 ring-white/20 backdrop-blur transition hover:bg-white/25"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label={t('hero.slideNext', 'Keyingi slayd')}
                  className="grid h-8 w-8 place-items-center rounded-full bg-white/15 text-white ring-1 ring-white/20 backdrop-blur transition hover:bg-white/25"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Afzalliklar */}
      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-5 sm:grid-cols-4 sm:gap-3">
        {perks.map((perk) => (
          <div
            key={perk.title}
            className="flex items-center gap-2.5 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-card"
          >
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <perk.icon size={17} />
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-[12px] font-extrabold text-ink sm:text-[13px]">{perk.title}</p>
              <p className="line-clamp-2 text-[10px] text-slate-500 sm:text-[11px]">{perk.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
