import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2 } from 'lucide-react';
import { useAuth, authErrorMessage } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';
import { DesiLogo } from './DesiLogo';

type Mode = 'login' | 'register-details' | 'register-otp';

const inputClass =
  'w-full px-4 py-3 rounded-2xl bg-white border border-[#0B1420]/15 text-sm text-[#0B1420] focus:outline-none focus:border-[#B87D00] placeholder-[#0B1420]/30';

export const AuthModal: React.FC = () => {
  const { isOpen, initialMode, closeAuthModal, handleSuccess } = useAuthModal();
  const { login, sendRegisterOtp, verifyRegisterOtp, register } = useAuth();

  const [mode, setMode] = useState<Mode>('login');

  useEffect(() => {
    if (isOpen) setMode(initialMode);
  }, [isOpen, initialMode]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [otp, setOtp] = useState('');

  // Seconds until a new code can be requested. The API rate-limits resends and
  // tells us how long it wants; counting down is what makes the wait legible
  // instead of the button just refusing.
  //
  // Must stay above the `if (!isOpen) return null` below: hooks declared after
  // an early return only run on some renders, which is exactly what React
  // error #310 is.
  const [resendIn, setResendIn] = useState(0);
  const [resendNote, setResendNote] = useState('');

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  if (!isOpen) return null;

  const resetAndClose = () => {
    setMode('login');
    setError('');
    setLoginEmail('');
    setLoginPassword('');
    setFullName('');
    setRegEmail('');
    setMobileNumber('');
    setRegPassword('');
    setOtp('');
    closeAuthModal();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(loginEmail, loginPassword);
      handleSuccess();
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Kept in step with the API's own rules — auth.validation.ts. If these ever
  // drift, the symptom is a rejection on the code screen rather than here.
  const validateRegistration = (): string | null => {
    if (!fullName.trim()) return 'Please enter your name.';
    if (!/^[6-9]\d{9}$/.test(mobileNumber.trim())) {
      return 'Enter a valid 10-digit mobile number starting with 6, 7, 8 or 9.';
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{6,}$/.test(regPassword)) {
      return 'Password needs at least 6 characters, including a lowercase letter, an uppercase letter, a number and a special character (for example: Totes@2026).';
    }
    return null;
  };

  const handleResendOtp = async () => {
    setError('');
    setResendNote('');
    setIsSubmitting(true);
    try {
      const wait = await sendRegisterOtp(regEmail);
      setResendIn(wait);
      setResendNote('A new code is on its way.');
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Checked here, not left to the API. The API only sees these when the
    // account is actually created, which happens after the emailed code has
    // been verified and spent - so a weak password surfaced as an error on the
    // code screen, where there is no password field to correct and no code left
    // to reuse. Dead end for the shopper.
    const invalid = validateRegistration();
    if (invalid) {
      setError(invalid);
      return;
    }

    setIsSubmitting(true);
    try {
      const wait = await sendRegisterOtp(regEmail);
      setResendIn(wait);
      setResendNote('');
      setMode('register-otp');
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await verifyRegisterOtp(regEmail, otp);
      await register({ fullName, email: regEmail, mobileNumber, password: regPassword });
      await login(regEmail, regPassword);
      handleSuccess();
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-sm rounded-[32px] bg-[#F7F2E8] border border-[#0B1420]/10 p-7 shadow-2xl relative my-8"
        >
          <button
            onClick={resetAndClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-[#0B1420]/5 hover:bg-[#0B1420]/10 text-[#0B1420]/60 hover:text-[#0B1420] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex justify-center mb-5">
            <DesiLogo size="lg" variant="badge" />
          </div>

          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <h3 className="text-xl font-serif text-center text-[#0B1420] mb-1">Log in to continue</h3>
              <p className="text-xs text-center text-[#0B1420]/50 mb-3">
                An account is required to add items to your bag.
              </p>
              <input
                type="email"
                required
                placeholder="Email address"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className={inputClass}
              />
              <input
                type="password"
                required
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className={inputClass}
              />
              {error && <p className="text-xs text-rose-500">{error}</p>}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#0B1420] to-[#340E09] text-[#F7F2E8] font-semibold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Log In</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setMode('register-details');
                }}
                className="w-full text-center text-xs text-[#0B1420]/60 hover:text-[#0B1420] pt-1"
              >
                New here? <span className="text-[#B87D00] font-semibold">Create an account</span>
              </button>
            </form>
          )}

          {mode === 'register-details' && (
            <form onSubmit={handleSendOtp} className="space-y-3.5">
              <h3 className="text-xl font-serif text-center text-[#0B1420] mb-1">Create your account</h3>
              <input
                required
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClass}
              />
              <input
                type="email"
                required
                placeholder="Email address"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className={inputClass}
              />
              <input
                required
                placeholder="Mobile number (10 digits)"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className={inputClass}
              />
              <input
                type="password"
                required
                placeholder="Password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className={inputClass}
              />
              <p className="text-[10px] text-[#0B1420]/40 px-1">
                At least 6 characters, with a lowercase and an uppercase letter, a number,
                and a special character. For example: Totes@2026
              </p>
              {error && <p className="text-xs text-rose-500">{error}</p>}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#0B1420] to-[#340E09] text-[#F7F2E8] font-semibold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Send Verification Code</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setMode('login');
                }}
                className="w-full text-center text-xs text-[#0B1420]/60 hover:text-[#0B1420] pt-1"
              >
                Already have an account? <span className="text-[#B87D00] font-semibold">Log in</span>
              </button>
            </form>
          )}

          {mode === 'register-otp' && (
            <form onSubmit={handleVerifyAndRegister} className="space-y-3.5">
              <h3 className="text-xl font-serif text-center text-[#0B1420] mb-1">Check your email</h3>
              <p className="text-xs text-center text-[#0B1420]/50 mb-3">
                We sent a 6-digit code to <span className="font-semibold text-[#0B1420]">{regEmail}</span>
              </p>
              <input
                required
                maxLength={6}
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className={`${inputClass} text-center tracking-[0.5em] font-mono text-lg`}
              />
              {error && <p className="text-xs text-rose-500">{error}</p>}
              {resendNote && !error && <p className="text-xs text-emerald-600">{resendNote}</p>}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#0B1420] to-[#340E09] text-[#F7F2E8] font-semibold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Verify &amp; Create Account</span>
              </button>

              {/* Codes go astray - spam folders, slow mail, a mistyped address.
                  Without this the only way out was to abandon the signup. */}
              <div className="text-center text-xs text-[#0B1420]/60 pt-0.5">
                {resendIn > 0 ? (
                  <span>Didn&apos;t get the code? You can ask for a new one in {resendIn}s</span>
                ) : (
                  <>
                    Didn&apos;t get the code?{' '}
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isSubmitting}
                      className="font-semibold text-[#B87D00] hover:text-[#0B1420] underline underline-offset-2 disabled:opacity-50 cursor-pointer"
                    >
                      Send it again
                    </button>
                  </>
                )}
                <span className="block text-[#0B1420]/40 mt-1">Check your spam folder too.</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setMode('register-details');
                }}
                className="w-full text-center text-xs text-[#0B1420]/60 hover:text-[#0B1420] pt-1"
              >
                Back
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
