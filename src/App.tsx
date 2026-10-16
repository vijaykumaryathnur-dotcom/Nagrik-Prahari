import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ReportHazard } from './pages/ReportHazard';
import { MyReports } from './pages/MyReports';
import { ReportDetail } from './pages/ReportDetail';
import { StaffDashboard } from './pages/StaffDashboard';
import { PublicTransparency } from './pages/PublicTransparency';
import { AdminArea } from './pages/AdminArea';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/public" element={<PublicTransparency />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Citizen protected routes */}
            <Route
              path="/report"
              element={
                <ProtectedRoute>
                  <ReportHazard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-reports"
              element={
                <ProtectedRoute>
                  <MyReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/:id"
              element={
                <ProtectedRoute>
                  <ReportDetail />
                </ProtectedRoute>
              }
            />

            {/* Staff workspace protected route (reviewer, officer, admin) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['reviewer', 'officer', 'admin']}>
                  <StaffDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin workspace protected route (admin only) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminArea />
                </ProtectedRoute>
              }
            />

            {/* Fallback to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}
