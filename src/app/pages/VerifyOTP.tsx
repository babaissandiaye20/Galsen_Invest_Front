import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Phone, MessageSquare } from 'lucide-react';
import { useAuthStore } from '../store';
import { authService } from '../services';
import { useShallow } from 'zustand/react/shallow';
import logoGalsen from '../images/logogalsen_invest.png';

export function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string })?.email || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [selectedMethod, setSelectedMethod] = useState<'email' | 'sms' | 'whatsapp'>('email');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const { verifyOtp, loading, error, clearError } = useAuthStore(
    useShallow((s) => ({ verifyOtp: s.verifyOtp, loading: s.loading, error: s.error, clearError: s.clearError }))
  );

  // Redirect if no email was passed from registration
  useEffect(() => {
    if (!email) {
      navigate('/register', { replace: true });
    }
  }, [email, navigate]);

  // Auto-send OTP on mount
  useEffect(() => {
    if (email) {
      authService.sendOtp({ email, type: selectedMethod.toUpperCase() as 'EMAIL' | 'SMS' | 'WHATSAPP' }).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(t => t - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      return;
    }

    clearError();
    try {
      await verifyOtp({ email, code });
      navigate('/login');
    } catch {
      // Error already set in store
    }
  };

  const handleResend = async () => {
    setTimer(60);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    clearError();

    try {
      await authService.resendOtp({ email, type: selectedMethod.toUpperCase() as 'EMAIL' | 'SMS' | 'WHATSAPP' });
    } catch {
      // Silently fail resend
    }
  };

  return (
    <div className="min-h-screen bg-galsen-white flex">
      {/* Partie gauche - Background Image (masquée sur mobile) */}
      <div
        className="hidden md:block md:w-1/2 bg-gradient-to-br from-galsen-green to-galsen-blue relative"
        style={{
          backgroundImage: `url(${logoGalsen})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-galsen-green/80 to-galsen-blue/80"></div>

        {/* Contenu */}
        <div className="relative h-full flex items-end p-8 md:p-12">
          <div className="text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Vérification de sécurité
            </h2>
            <p className="text-lg md:text-xl text-white/90">
              Confirmez votre identité pour sécuriser votre compte GALSEN INVEST
            </p>
          </div>
        </div>
      </div>

      {/* Partie droite - Formulaire */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="md:hidden text-center mb-6">
            <img
              src={logoGalsen}
              alt="GALSEN INVEST"
              className="h-16 mx-auto mb-4"
            />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-galsen-green mb-2">
              Vérifiez votre compte
            </h1>
            <p className="text-galsen-blue/70 text-sm md:text-base">
              Un code à 6 chiffres a été envoyé à votre {selectedMethod === 'email' ? 'email' : 'téléphone'}
            </p>
          </div>

          {/* Formulaire */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-galsen-green/10">
            {/* Options d'envoi */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-galsen-blue mb-3">
                Méthode de vérification
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('email')}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${selectedMethod === 'email'
                      ? 'border-galsen-gold bg-galsen-gold/10 text-galsen-gold'
                      : 'border-galsen-green/20 hover:border-galsen-gold/50'
                    }`}
                >
                  <Mail className="w-5 h-5 md:w-6 md:h-6" />
                  <span className="text-xs font-medium">Email</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('sms')}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${selectedMethod === 'sms'
                      ? 'border-galsen-gold bg-galsen-gold/10 text-galsen-gold'
                      : 'border-galsen-green/20 hover:border-galsen-gold/50'
                    }`}
                >
                  <Phone className="w-5 h-5 md:w-6 md:h-6" />
                  <span className="text-xs font-medium">SMS</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('whatsapp')}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${selectedMethod === 'whatsapp'
                      ? 'border-galsen-gold bg-galsen-gold/10 text-galsen-gold'
                      : 'border-galsen-green/20 hover:border-galsen-gold/50'
                    }`}
                >
                  <MessageSquare className="w-5 h-5 md:w-6 md:h-6" />
                  <span className="text-xs font-medium">WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Champs OTP */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-galsen-blue mb-3">
                Code de vérification
              </label>
              <div className="flex gap-2 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-10 h-12 md:w-12 md:h-14 text-center text-xl md:text-2xl font-bold border-2 border-galsen-green/30 rounded-lg focus:ring-2 focus:ring-galsen-green focus:border-galsen-green transition-colors"
                    autoFocus={index === 0}
                    disabled={loading}
                  />
                ))}
              </div>
              {error && (
                <p className="text-galsen-red text-sm mt-2 text-center">{error}</p>
              )}
            </div>

            {/* Bouton de vérification */}
            <button
              onClick={handleVerify}
              disabled={loading || otp.some(d => !d)}
              className="w-full px-6 py-3 bg-galsen-green hover:bg-galsen-green/90 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4 shadow-lg shadow-galsen-green/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Vérification...
                </span>
              ) : (
                'Vérifier'
              )}
            </button>

            {/* Renvoyer le code */}
            <div className="text-center">
              {canResend ? (
                <button
                  onClick={handleResend}
                  className="text-galsen-gold hover:text-galsen-gold/80 font-medium transition-colors"
                >
                  Renvoyer le code
                </button>
              ) : (
                <p className="text-galsen-blue/70 text-sm">
                  Renvoyer le code dans <span className="font-medium text-galsen-blue">0:{timer.toString().padStart(2, '0')}</span>
                </p>
              )}
            </div>

            {/* Retour */}
            <div className="mt-4 text-center">
              <button
                onClick={() => navigate('/register')}
                className="text-sm text-galsen-blue/70 hover:text-galsen-green transition-colors"
              >
                ← Retour à l'inscription
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
