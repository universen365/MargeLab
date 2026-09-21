import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './features/auth/AuthProvider'
import { AppShell } from './components/AppShell'
import { LoginPage } from './pages/LoginPage'
import { RequireAuth } from './pages/RequireAuth'
import { MaterialsPage } from './pages/MaterialsPage'
import { NewMaterialPage } from './pages/NewMaterialPage'
import { MaterialDetailPage } from './pages/MaterialDetailPage'
import { ProductionsPage } from './pages/ProductionsPage'
import { NewProductionPage } from './pages/NewProductionPage'
import { ProductionDetailPage } from './pages/ProductionDetailPage'
import { ResalesPage } from './pages/ResalesPage'
import { NewResalePage } from './pages/NewResalePage'
import { ResaleDetailPage } from './pages/ResaleDetailPage'
import { MissingConfigPage } from './pages/MissingConfigPage'
import { isSupabaseConfigured } from './lib/supabase'

export default function App() {
  if (!isSupabaseConfigured) {
    return <MissingConfigPage />
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<RequireAuth />}>
            <Route element={<AppShell />}>
              <Route index element={<Navigate to="/matieres" replace />} />
              <Route path="matieres" element={<MaterialsPage />} />
              <Route path="matieres/nouvelle" element={<NewMaterialPage />} />
              <Route path="matieres/:id" element={<MaterialDetailPage />} />
              <Route path="productions" element={<ProductionsPage />} />
              <Route
                path="productions/nouvelle"
                element={<NewProductionPage />}
              />
              <Route
                path="productions/:id"
                element={<ProductionDetailPage />}
              />
              <Route path="reventes" element={<ResalesPage />} />
              <Route path="reventes/nouvelle" element={<NewResalePage />} />
              <Route path="reventes/:id" element={<ResaleDetailPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/matieres" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
