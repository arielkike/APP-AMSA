import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';

// Public Pages
import { ShowroomPage } from '../pages/public/ShowroomPage';
import { ProjectDetailPage } from '../pages/public/ProjectDetailPage';
import { SimulatorPage } from '../pages/public/SimulatorPage';
import { PreReservationPage } from '../pages/public/PreReservationPage';

// Admin Page
import { AdminProjectListPage } from '../pages/admin/AdminProjectListPage';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';

// Client Area Pages
import { DashboardPage } from '../pages/client/DashboardPage';
import { AccountStatementPage } from '../pages/client/AccountStatementPage';
import { ReceiptsPage } from '../pages/client/ReceiptsPage';
import { ReportPaymentPage } from '../pages/client/ReportPaymentPage';
import { ProfilePage } from '../pages/client/ProfilePage';
import { ReferralsPage } from '../pages/client/ReferralsPage';

// Protected Route Guard
const ProtectedClientRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* MODO A: Showroom & Prospectos */}
        <Route path="/" element={<ShowroomPage />} />
        <Route path="/proyectos/:id" element={<ProjectDetailPage />} />
        <Route path="/simulador" element={<SimulatorPage />} />
        <Route path="/formalizar" element={<PreReservationPage />} />
        <Route path="/pre-reserva" element={<PreReservationPage />} />
        <Route path="/referidos" element={<ReferralsPage />} />
        <Route path="/admin" element={<AdminProjectListPage />} />

        {/* Auth */}
        <Route path="/auth/login" element={<LoginPage />} />

        {/* MODO B: Portal Clientes / Propietarios */}
        <Route
          path="/cliente/dashboard"
          element={
            <ProtectedClientRoute>
              <DashboardPage />
            </ProtectedClientRoute>
          }
        />
        <Route
          path="/cliente/referidos"
          element={
            <ProtectedClientRoute>
              <ReferralsPage />
            </ProtectedClientRoute>
          }
        />
        <Route
          path="/cliente/estado-cuenta"
          element={
            <ProtectedClientRoute>
              <AccountStatementPage />
            </ProtectedClientRoute>
          }
        />
        <Route
          path="/cliente/recibos"
          element={
            <ProtectedClientRoute>
              <ReceiptsPage />
            </ProtectedClientRoute>
          }
        />
        <Route
          path="/cliente/reportar-pago"
          element={
            <ProtectedClientRoute>
              <ReportPaymentPage />
            </ProtectedClientRoute>
          }
        />
        <Route
          path="/cliente/perfil"
          element={
            <ProtectedClientRoute>
              <ProfilePage />
            </ProtectedClientRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
