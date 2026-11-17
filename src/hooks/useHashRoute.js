import { useEffect, useState } from 'react'

/**
 * Hash asosidagi yengil router.
 * #/        -> do'kon
 * #/admin   -> boshqaruv paneli
 * /admin    -> boshqaruv paneli (to'g'ridan-to'g'ri havola)
 */
export function useHashRoute() {
  const read = () => {
    const hash = window.location.hash.replace(/^#/, '')
    if (hash.startsWith('/admin')) return 'admin'
    if (hash.startsWith('/store') || hash === '/' || hash === '') {
      if (hash === '' && window.location.pathname.replace(/\/+$/, '').endsWith('/admin')) return 'admin'
      return 'store'
    }
    return 'store'
  }

  const [route, setRoute] = useState(read)

  useEffect(() => {
    const onChange = () => setRoute(read())
    window.addEventListener('hashchange', onChange)
    window.addEventListener('popstate', onChange)
    return () => {
      window.removeEventListener('hashchange', onChange)
      window.removeEventListener('popstate', onChange)
    }
  }, [])

  return route
}

export function navigate(route) {
  window.location.hash = route === 'admin' ? '#/admin' : '#/'
  window.scrollTo({ top: 0 })
}
