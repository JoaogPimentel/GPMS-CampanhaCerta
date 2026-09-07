import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import CalendarPage from './pages/CalendarPage'
import CampaignDetailPage from './pages/CampaignDetailPage'
import CampaignFormPage from './pages/CampaignFormPage'
import CampaignsListPage from './pages/CampaignsListPage'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import PublicationFormPage from './pages/PublicationFormPage'
import RegisterPage from './pages/RegisterPage'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
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
      </Route>
    </Routes>
  )
}

export default App
