import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store';
import { useShallow } from 'zustand/react/shallow';
import { getUserRole, getDashboardRoute } from '../config/jwt';
import logoGalsen from '../images/logogalsen_invest.png';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // URL d'origine si redirigé par ProtectedRoute
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  const { login, loading, error, clearError } = useAuthStore(
    useShallow((s) => ({ login: s.login, token: s.token, loading: s.loading, error: s.error, clearError: s.clearError }))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login({ username: email, password });
      const token = useAuthStore.getState().token;
      const role = getUserRole(token);
      // Si l'utilisateur venait d'une page protégée, on le renvoie là-bas
      const redirectTo = from || getDashboardRoute(role);
      navigate(redirectTo, { replace: true });
    } catch (err: unknown) {
      // Si le compte n'est pas activé → rediriger vers la vérification OTP
      const fetchErr = err as { data?: { errorCode?: string; detail?: string; message?: string }; status?: number };
      const errorCode = fetchErr?.data?.errorCode?.toLowerCase() || '';
      const detail = fetchErr?.data?.detail?.toLowerCase() || '';
      const message = fetchErr?.data?.message?.toLowerCase() || '';

      const isNotActivated =
        detail.includes('compte non activé') ||
        detail.includes('non activé') ||
        detail.includes('not activated') ||
        message.includes('compte non activé') ||
        message.includes('non activé') ||
        message.includes('not activated') ||
        errorCode.includes('not_activated') ||
        errorCode.includes('pending_activation');

      if (isNotActivated) {
        navigate('/verify-otp', { state: { email }, replace: true });
      }
      // Sinon l'erreur est déjà dans le store
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
        {/* Overlay pour améliorer la lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-br from-galsen-green/80 to-galsen-blue/80"></div>

        {/* Contenu optionnel sur l'image */}
        <div className="relative h-full flex items-end p-8 md:p-12">
          <div className="text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Investissez dans l'avenir du Sénégal
            </h2>
            <p className="text-lg md:text-xl text-white/90">
              La plateforme de financement participatif qui unit les investisseurs et les entrepreneurs sénégalais
            </p>
          </div>
        </div>
      </div>

      {/* Partie droite - Formulaire */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          {/* Logo mobile (visible uniquement sur mobile) */}
          <div className="md:hidden text-center mb-8">
            <img
              src={logoGalsen}
              alt="GALSEN INVEST"
              className="h-20 mx-auto mb-4"
            />
          </div>

          {/* En-tête */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-galsen-green mb-2">
              Bienvenue
            </h1>
            <p className="text-galsen-blue/70">
              Connectez-vous à votre compte GALSEN INVEST
            </p>
          </div>

          {/* Formulaire de connexion */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-galsen-green/10">
            <h2 className="text-2xl font-bold text-galsen-blue mb-6">Connexion</h2>

            {/* Affichage erreur */}
            {error && (
              <div className="mb-4 p-3 bg-galsen-red/10 border border-galsen-red/30 text-galsen-red text-sm rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-galsen-blue mb-2">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-galsen-green/60" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-galsen-green/30 rounded-lg focus:ring-2 focus:ring-galsen-green focus:border-galsen-green transition-colors"
                    placeholder="votre.email@exemple.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-galsen-blue mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-galsen-green/60" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-galsen-green/30 rounded-lg focus:ring-2 focus:ring-galsen-green focus:border-galsen-green transition-colors"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-galsen-green/60 hover:text-galsen-green transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Mot de passe oublié */}
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-sm text-galsen-green hover:text-galsen-green/80 font-medium transition-colors">
                  Mot de passe oublié ?
                </Link>
              </div>

              {/* Bouton de connexion */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-galsen-green hover:bg-galsen-green/90 text-white font-medium py-3 rounded-lg transition-colors shadow-lg shadow-galsen-green/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Connexion en cours...
                  </span>
                ) : (
                  'Se connecter'
                )}
              </button>
            </form>

            {/* Séparateur */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-galsen-green/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-galsen-blue/60">Pas encore de compte ?</span>
              </div>
            </div>

            {/* Bouton d'inscription unique */}
            <Link
              to="/register"
              className="block w-full text-center px-4 py-3 bg-galsen-gold hover:bg-galsen-gold/90 text-white font-medium rounded-lg transition-colors shadow-md"
            >
              S'inscrire
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
