import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
const Login = React.lazy(() => import('./pages/Login'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const CalendarPage = React.lazy(() => import('./pages/CalendarPage'));
const UserManagement = React.lazy(() => import('./pages/admin/UserManagement'));
const ProjectCenter = React.lazy(() => import('./pages/admin/ProjectCenter'));
const TaskAudit = React.lazy(() => import('./pages/admin/TaskAudit'));
const Analytics = React.lazy(() => import('./pages/Analytics'));

import Layout from './components/Layout';
import { Loader2 } from 'lucide-react';

import { ThemeProvider } from './context/ThemeContext';

const ProtectedRoute = ({ children, role, useLayout = true }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    if (role && user.role !== role) return <Navigate to="/dashboard" />;

    return useLayout ? <Layout>{children}</Layout> : children;
};

function App() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <ToastProvider>
                    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                        <React.Suspense fallback={
                            <div className="flex h-screen w-screen items-center justify-center bg-[var(--bg-main)]">
                                <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
                            </div>
                        }>
                            <Routes>
                                <Route path="/login" element={<Login />} />
                                <Route
                                    path="/dashboard"
                                    element={
                                        <ProtectedRoute>
                                            <Dashboard />
                                        </ProtectedRoute>
                                    }
                                />
                                {/* Admin Routes */}
                                <Route
                                    path="/admin/users"
                                    element={
                                        <ProtectedRoute role="Admin">
                                            <UserManagement />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/admin/projects"
                                    element={
                                        <ProtectedRoute role="Admin">
                                            <ProjectCenter />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/admin/tasks"
                                    element={
                                        <ProtectedRoute role="Admin">
                                            <TaskAudit />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route path="/admin" element={<Navigate to="/admin/users" replace />} />

                                <Route
                                    path="/calendar"
                                    element={
                                        <ProtectedRoute>
                                            <CalendarPage />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/analytics"
                                    element={
                                        <ProtectedRoute>
                                            <Analytics />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route path="/" element={<Navigate to="/dashboard" />} />
                            </Routes>
                        </React.Suspense>
                    </Router>
                </ToastProvider>
            </ThemeProvider>
        </AuthProvider>
    );
}

export default App;
