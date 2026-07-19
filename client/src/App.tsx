import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/auth-context'
import HomePage from './Pages/HomePage'
import AuthPage from './Pages/AuthPage'
import MyTask from './Pages/MyTask'
import NewTask from './Pages/NewTask'
import EditTask from './Pages/EditTask'

function UnknownRoute() {
  const { user } = useAuth()
  return <Navigate to={user ? '/tasks' : '/'} replace />
}

export default function App() {
  return <BrowserRouter><AuthProvider><Navbar /><Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/login" element={<AuthPage mode="login" />} />
    <Route path="/register" element={<AuthPage mode="register" />} />
    <Route element={<ProtectedRoute />}>
      <Route path="/tasks" element={<MyTask />} />
      <Route path="/tasks/new" element={<NewTask />} />
      <Route path="/tasks/:id/edit" element={<EditTask />} />
    </Route>
    <Route path="*" element={<UnknownRoute />} />
  </Routes></AuthProvider></BrowserRouter>
}
