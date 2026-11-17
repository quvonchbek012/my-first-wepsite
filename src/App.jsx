import { StoreProvider } from './store/StoreContext'
import { I18nProvider } from './i18n/I18nContext'
import { useHashRoute } from './hooks/useHashRoute'
import Storefront from './components/store/Storefront'
import AdminApp from './components/admin/AdminApp'
import Toasts from './components/ui/Toasts'

export default function App() {
  const route = useHashRoute()

  return (
    <I18nProvider>
      <StoreProvider>
        {route === 'admin' ? <AdminApp /> : <Storefront />}
        <Toasts />
      </StoreProvider>
    </I18nProvider>
  )
}
