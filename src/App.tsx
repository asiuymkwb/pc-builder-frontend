import { createBrowserRouter, RouterProvider, Navigate, Outlet } from "react-router"
import { AuthProvider, useAuth } from "@/context/AuthContext"
import Login from "@/pages/Login"
import Register from "@/pages/Register"
import Builder from "@/pages/Builder"
import Builds from "@/pages/Builds"
import Compare from "@/pages/Compare"
import BuildDetail from "@/pages/BuildDetail"
import AdminDashboard from "@/pages/admin/AdminDashboard"
import AdminLogin from "@/pages/admin/AdminLogin"
import NotFound from "@/pages/NotFound"

function PrivateRoute() {
  const { user } = useAuth()
  return user ? <Outlet /> : <Navigate to="/login" replace />
}

function AdminRoute() {
  const { user, isAdmin } = useAuth()
  if (!user) return <Navigate to="/admin/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return <Outlet />
}

const router = createBrowserRouter([
  // Pubbliche
  { path: "/login",       element: <Login /> },
  { path: "/register",    element: <Register /> },
  { path: "/admin/login", element: <AdminLogin /> },

  // Builder: accessibile a tutti, login prompt interno per aggiungere
  { path: "/",                 element: <Builder /> },
  { path: "/builder/:buildId", element: <Builder /> },

  // Solo per utenti loggati
  {
    element: <PrivateRoute />,
    children: [
      { path: "/builds",           element: <Builds /> },
      { path: "/builds/:buildId",  element: <BuildDetail /> },
      { path: "/compare",          element: <Compare /> },
    ],
  },

  // Solo admin
  {
    element: <AdminRoute />,
    children: [
      { path: "/admin", element: <AdminDashboard /> },
    ],
  },
  // Fallback 404
  { path: "*", element: <NotFound /> },
])

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}
