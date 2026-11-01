import React, { Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Loading from './components/Loading'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import './style.css'

const App = lazy(() => import('./App.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const Employees = lazy(() => import('./pages/Employees.jsx'))
const Departments = lazy(() => import('./pages/Departments.jsx'))
const Projects = lazy(() => import('./pages/Projects.jsx'))
const Attendance = lazy(() => import('./pages/Attendance.jsx'))
const Leave = lazy(() => import('./pages/Leave.jsx'))
const Shifts = lazy(() => import('./pages/Shifts.jsx'))
const Reports = lazy(() => import('./pages/Reports.jsx'))
const Salary = lazy(() => import('./pages/Salary.jsx'))
const Settings = lazy(() => import('./pages/Settings.jsx'))
const Permissions = lazy(() => import('./pages/Permissions.jsx'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 2 * 60 * 1000,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<App />}>
                <Route index element={<Dashboard />} />
                <Route path="employees" element={<Employees />} />
                <Route path="departments" element={<Departments />} />
                <Route path="projects" element={<Projects />} />
                <Route path="attendance" element={<Attendance />} />
                <Route path="leave" element={<Leave />} />
                <Route path="shifts" element={<Shifts />} />
                <Route path="reports" element={<Reports />} />
                <Route path="salary" element={<Salary />} />
                <Route path="settings" element={<Settings />} />
                <Route path="permissions" element={<Permissions />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
