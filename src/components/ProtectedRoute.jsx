import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Loading from './Loading'

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()
  if (loading) return <Loading label="Checking admin session..." />
  if (!session) return <Navigate to="/login" replace />
  return children
}
