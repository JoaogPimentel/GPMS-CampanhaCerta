import { Navigate, Route, Routes } from 'react-router-dom'
import AdminRoute from './components/AdminRoute'
import AppLayout from './components/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import CalendarPage from './pages/CalendarPage'
import CampaignDetailPage from './pages/CampaignDetailPage'
import CampaignFormPage from './pages/CampaignFormPage'
import CampaignsListPage from './pages/CampaignsListPage'
import CreateUserPage from './pages/CreateUserPage'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import PublicationFormPage from './pages/PublicationFormPage'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/campanhas" element={<CampaignsListPage />} />
        <Route path="/campanhas/nova" element={<CampaignFormPage />} />
        <Route path="/campanhas/:id" element={<CampaignDetailPage />} />
        <Route path="/campanhas/:id/editar" element={<CampaignFormPage />} />
        <Route path="/calendario" element={<CalendarPage />} />
        <Route path="/calendario/nova" element={<PublicationFormPage />} />
        <Route path="/calendario/:id/editar" element={<PublicationFormPage />} />
        <Route
          path="/usuarios/novo"
          element={
            <AdminRoute>
              <CreateUserPage />
            </AdminRoute>
          }
        />
      </Route>
    </Routes>
  )
}

export default App
