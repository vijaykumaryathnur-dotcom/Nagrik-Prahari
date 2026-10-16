import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FormField, Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ErrorState } from '../components/ui/Feedback';
import { ShieldCheck, Lock, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const { signIn, t } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const from = (location.state as any)?.from || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);

    const { error } = await signIn(email, password);
    setIsLoading(false);

    if (error) {
      setErrorMsg(error.message || 'Invalid email or password.');
    } else {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
      <div className="bg-[#121916] border border-[#223128] rounded-xs p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#B8F36B]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="mb-6 border-b border-[#223128] pb-5">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#19221D] border border-[#223128] rounded-xs text-[11px] font-mono text-[#B8F36B] uppercase tracking-wider mb-3">
            <Lock className="w-3 h-3" />
            SECURE ACCESS PORTAL
          </div>
          <h1 className="font-display text-2xl font-bold text-[#F2F0E8]">
            {t.signIn}
          </h1>
          <p className="text-xs text-[#9AA69C] mt-1.5 leading-relaxed">
            Access your civic reporting account or municipal staff ledger.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5">
            <ErrorState title="Sign in failed" message={errorMsg} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label={t.email} required id="login-email">
            <Input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              autoComplete="email"
            />
          </FormField>

          <FormField label={t.password} required id="login-password">
            <Input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </FormField>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full flex items-center justify-center gap-2"
              isLoading={isLoading}
            >
              <span>{t.signIn}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-5 border-t border-[#223128] text-center text-xs text-[#9AA69C]">
          <span>Do not have an account? </span>
          <Link
            to="/signup"
            state={{ from }}
            className="text-[#B8F36B] font-semibold hover:underline"
          >
            {t.signUp}
          </Link>
        </div>
      </div>
    </div>
  );
};
