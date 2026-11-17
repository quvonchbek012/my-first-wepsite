import { Globe } from 'lucide-react'
import { LANGS, useI18n } from '../../i18n/I18nContext'
import { cn } from '../../lib/utils'

/**
 * Desktop: segmentlangan UZ/RU/EN.
 * Mobil: globe tugmasi — bosganda keyingi tilga o'tadi.
 */
export default function LanguageSwitcher({ variant = 'segmented', light = false, className }) {
  const { lang, setLang } = useI18n()

  if (variant === 'compact') {
    const next = () => {
      const index = LANGS.findIndex((l) => l.id === lang)
      setLang(LANGS[(index + 1) % LANGS.length].id)
    }
    return (
      <button
        type="button"
        onClick={next}
        aria-label="Tilni almashtirish"
        className={cn(
          'inline-flex h-10 items-center gap-1.5 rounded-xl border px-2.5 text-[11px] font-extrabold uppercase transition',
          light
            ? 'border-white/20 text-white hover:bg-white/10'
            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-ink',
          className,
        )}
      >
        <Globe size={15} />
        {lang}
      </button>
    )
  }

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-xl border p-0.5',
        light ? 'border-white/20 bg-white/10' : 'border-slate-200 bg-white',
        className,
      )}
      role="group"
      aria-label="Til"
    >
      {LANGS.map((l) => (
        <button
          key={l.id}
          type="button"
          onClick={() => setLang(l.id)}
          aria-pressed={lang === l.id}
          className={cn(
            'rounded-lg px-2 py-1 text-[10px] font-extrabold uppercase transition',
            lang === l.id
              ? 'bg-brand-500 text-white shadow-sm'
              : light
                ? 'text-white/60 hover:text-white'
                : 'text-slate-400 hover:text-ink',
          )}
        >
          {l.short}
        </button>
      ))}
    </div>
  )
}
