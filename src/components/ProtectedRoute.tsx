import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/database';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from './ui/Button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, role, loading, t } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#D9D4C7] border-t-[#0F2A47] rounded-full animate-spin" />
          <span className="text-xs text-[#51606F]">Verifying credentials...</span>
        </div>
      </div>
    );
  }

  // Not signed in -> redirect to /login and preserve destination
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Check role authorization
  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex p-3 bg-[#FEF3F2] border border-[#FECDCA] rounded-full text-[#B42318] mb-4">
          <ShieldAlert className="w-8 h-8 stroke-[1.8]" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#0F2A47] mb-2">
          {t.noAccessTitle}
        </h2>
        <p className="text-sm text-[#51606F] mb-6 leading-relaxed">
          {t.noAccessDesc} You are currently signed in as a <span className="font-semibold capitalize text-[#0F2A47]">{role}</span>.
        </p>
        <div className="flex justify-center gap-3">
          <Link to="/">
            <Button variant="secondary" size="md">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.backToHome}
            </Button>
          </Link>
          <Link to="/my-reports">
            <Button variant="primary" size="md">
              {t.myReports}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
