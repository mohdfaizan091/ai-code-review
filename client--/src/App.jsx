import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import HistoryPage from './pages/HistoryPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/history" element={
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  )
}

export default App