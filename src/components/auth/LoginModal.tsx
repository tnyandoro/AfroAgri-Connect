import React, { useState } from 'react';
import { signIn, resetPassword } from '@/lib/auth';
import { MailIcon, XIcon, ArrowRightIcon } from '@/components/icons/Icons';

interface LoginModalProps {
  onSuccess: (user: any) => void;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

type View = 'login' | 'forgot-password' | 'reset-sent';

export const LoginModal: React.FC<LoginModalProps> = ({
  onSuccess,
  onClose,
  onSwitchToRegister,
}) => {
  const [view, setView] = useState<View>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const { user, error: signInError } = await signIn({ email, password });

    if (signInError) {
      setError(signInError);
      setIsLoading(false);
      return;
    }

    if (user) {
      onSuccess(user);
    }
    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const { error: resetError } = await resetPassword(email);

    if (resetError) {
      setError(resetError);
      setIsLoading(false);
      return;
    }

    setView('reset-sent');
    setIsLoading(false);
  };

  return (
    <div className="p-6">
      {view === 'login' && (
        <>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to your FarmConnect account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setView('forgot-password')}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Enter your password"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRightIcon size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={onSwitchToRegister}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Register now
              </button>
            </p>
          </div>
        </>
      )}

      {view === 'forgot-password' && (
        <>
          <button
            onClick={() => setView('login')}
            className="mb-4 text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm"
          >
            <ArrowRightIcon size={16} className="rotate-180" />
            Back to login
          </button>

          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MailIcon className="text-green-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
            <p className="text-gray-600">
              Enter your email and we'll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="you@example.com"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        </>
      )}

      {view === 'reset-sent' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MailIcon className="text-green-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
          <p className="text-gray-600 mb-6">
            We've sent a password reset link to <strong>{email}</strong>. Click the link in the email to reset your password.
          </p>
          <button
            onClick={() => {
              setView('login');
              setEmail('');
            }}
            className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Back to Login
          </button>
        </div>
      )}
    </div>
  );
};
