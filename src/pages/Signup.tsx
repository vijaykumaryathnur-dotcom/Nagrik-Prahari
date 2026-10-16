import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FormField, Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ErrorState } from '../components/ui/Feedback';
import { UserPlus, ArrowRight } from 'lucide-react';

export const Signup: React.FC = () => {
  const { signUp, t } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const from = (location.state as any)?.from || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMsg('All fields are required.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const { error } = await signUp(email, password, fullName);
    setIsLoading(false);

    if (error) {
      setErrorMsg(error.message || 'Account registration could not be completed.');
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
            <UserPlus className="w-3 h-3" />
            CITIZEN ENROLLMENT
          </div>
          <h1 className="font-display text-2xl font-bold text-[#F2F0E8]">
            {t.signUp}
          </h1>
          <p className="text-xs text-[#9AA69C] mt-1.5 leading-relaxed">
            Register as a citizen to file hazard reports and monitor municipal resolution.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5">
            <ErrorState title="Registration failed" message={errorMsg} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label={t.fullName} required id="signup-name">
            <Input
              id="signup-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              required
              autoComplete="name"
            />
          </FormField>

          <FormField label={t.email} required id="signup-email">
            <Input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              autoComplete="email"
            />
          </FormField>

          <FormField
            label={t.password}
            required
            hint="Minimum 6 characters"
            id="signup-password"
          >
            <Input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete="new-password"
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
              <span>{t.signUp}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-5 border-t border-[#223128] text-center text-xs text-[#9AA69C]">
          <span>Already have an account? </span>
          <Link
            to="/login"
            state={{ from }}
            className="text-[#B8F36B] font-semibold hover:underline"
          >
            {t.signIn}
          </Link>
        </div>
      </div>
    </div>
  );
};
