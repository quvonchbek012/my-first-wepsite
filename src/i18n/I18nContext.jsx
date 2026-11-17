import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { formatNumber } from '../lib/utils'
import { RU, EN } from './dictionary'

const I18nContext = createContext(null)

const LANG_KEY = 'freshmarket.lang.v1'
export const LANGS = [
  { id: 'uz', label: "O'zbekcha", short: 'UZ' },
  { id: 'ru', label: 'Русский', short: 'RU' },
  { id: 'en', label: 'English', short: 'EN' },
]

const DICTS = { ru: RU, en: EN }
const CURRENCY = { uz: "so'm", ru: 'сум', en: 'UZS' }
const LOCALES = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-GB' }
const HTML_LANG = { uz: 'uz', ru: 'ru', en: 'en' }

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const stored = localStorage.getItem(LANG_KEY)
      return LANGS.some((l) => l.id === stored) ? stored : 'uz'
    } catch {
      return 'uz'
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(LANG_KEY, lang)
    } catch {
      /* ignore */
    }
    document.documentElement.lang = HTML_LANG[lang] || 'uz'
  }, [lang])

  const setLang = useCallback((next) => {
    if (LANGS.some((l) => l.id === next)) setLangState(next)
  }, [])

  /**
   * @param {string} key tarjima kaliti
   * @param {string} uz o'zbekcha matn (fallback)
   * @param {object} vars {name} kabi o'zgaruvchilar
   */
  const t = useCallback(
    (key, uz, vars) => {
      let text = lang === 'uz' ? uz : DICTS[lang]?.[key] || uz
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          text = text.split(`{${k}}`).join(String(v))
        })
      }
      return text
    },
    [lang],
  )

  const money = useCallback(
    (value) => `${formatNumber(value)} ${CURRENCY[lang] || CURRENCY.uz}`,
    [lang],
  )

  const formatDate = useCallback(
    (iso) => {
      try {
        return new Intl.DateTimeFormat(LOCALES[lang] || 'uz-UZ', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date(iso))
      } catch {
        return iso
      }
    },
    [lang],
  )

  const formatTime = useCallback(
    (iso) => {
      try {
        return new Intl.DateTimeFormat(LOCALES[lang] || 'uz-UZ', {
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date(iso))
      } catch {
        return ''
      }
    },
    [lang],
  )

  const value = useMemo(
    () => ({ lang, setLang, t, money, formatDate, formatTime, locale: LOCALES[lang] }),
    [lang, setLang, t, money, formatDate, formatTime],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n faqat I18nProvider ichida ishlaydi')
  return ctx
}
