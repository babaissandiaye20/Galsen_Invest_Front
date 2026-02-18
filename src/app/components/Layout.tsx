import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  User,
  Wallet,
  LogOut,
  Building2,
  FileText,
  CheckSquare,
  Users,
  Menu,
  X,
  ChevronDown,
  Shield,
  Receipt,
  ArrowDownCircle,
} from 'lucide-react';
import logoGalsen from '../images/logogalsen_invest.png';
import { useAuthStore } from '../store/authStore';
import { getUserInfoFromToken, getUserRole, type UserRole } from '../config/jwt';

interface LayoutProps {
  children: React.ReactNode;
  userType?: 'investor' | 'business' | 'admin';
}

// ─── Config par rôle ─────────────────────────────────────────────────────────

const roleConfig: Record<UserRole, { label: string; color: string; profilePath: string }> = {
  investor: { label: 'Investisseur', color: 'bg-galsen-green', profilePath: '/investor/profile' },
  business: { label: 'Entreprise', color: 'bg-galsen-gold', profilePath: '/business/profile' },
  admin: { label: 'Admin', color: 'bg-galsen-red', profilePath: '/admin/profile' },
};

// ─── Composant Avatar Dropdown ───────────────────────────────────────────────

function AvatarDropdown({
  initials,
  name,
  email,
  role,
  onLogout,
  onNavigate,
}: {
  initials: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  onLogout: () => void;
  onNavigate: (path: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fermer au click extérieur
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Fermer sur Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  const cfg = roleConfig[role];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-galsen-green/5 transition-colors focus:outline-none focus:ring-2 focus:ring-galsen-green/30"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {/* Avatar cercle */}
        <div className={`w-9 h-9 rounded-full ${cfg.color} text-white flex items-center justify-center text-sm font-bold`}>
          {initials}
        </div>
        {/* Nom — visible seulement sur lg+ */}
        <span className="hidden lg:block text-sm font-medium text-galsen-blue max-w-[120px] truncate">
          {name ?? email ?? 'Utilisateur'}
        </span>
        <ChevronDown className={`hidden lg:block w-4 h-4 text-galsen-blue/50 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-galsen-green/10 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Info utilisateur */}
          <div className="px-4 py-3 border-b border-galsen-green/10">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${cfg.color} text-white flex items-center justify-center text-sm font-bold shrink-0`}>
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-galsen-blue truncate">{name ?? 'Utilisateur'}</p>
                {email && <p className="text-xs text-galsen-blue/60 truncate">{email}</p>}
                <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white ${cfg.color}`}>
                  {role === 'admin' && <Shield className="w-3 h-3" />}
                  {cfg.label}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="py-1">
            <button
              onClick={() => { setOpen(false); onNavigate(cfg.profilePath); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-galsen-blue hover:bg-galsen-green/5 transition-colors"
            >
              <User className="w-4 h-4 text-galsen-green" />
              Mon profil
            </button>
            <button
              onClick={() => { setOpen(false); onLogout(); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-galsen-red hover:bg-galsen-red/5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Layout principal ────────────────────────────────────────────────────────

export function Layout({ children, userType = 'investor' }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const token = useAuthStore((state) => state.token);

  // Infos utilisateur depuis le JWT
  const userInfo = getUserInfoFromToken(token);
  const role = getUserRole(token) ?? userType;

  const investorNav = [
    { path: '/investor/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: '/campaigns', label: 'Campagnes', icon: <TrendingUp className="w-5 h-5" /> },
    { path: '/investor/wallet', label: 'Portefeuille', icon: <Wallet className="w-5 h-5" /> },
    { path: '/investor/profile', label: 'Mon profil', icon: <User className="w-5 h-5" /> },
  ];

  const businessNav = [
    { path: '/business/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: '/business/campaigns', label: 'Mes campagnes', icon: <TrendingUp className="w-5 h-5" /> },
    { path: '/business/wallet', label: 'Portefeuille', icon: <Wallet className="w-5 h-5" /> },
    { path: '/business/profile', label: 'Mon profil', icon: <Building2 className="w-5 h-5" /> },
  ];

  const adminNav = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: '/admin/campaigns', label: 'Campagnes', icon: <FileText className="w-5 h-5" /> },
    { path: '/admin/kyc', label: 'Documents KYC', icon: <CheckSquare className="w-5 h-5" /> },
    { path: '/admin/transactions', label: 'Transactions', icon: <Receipt className="w-5 h-5" /> },
    { path: '/admin/withdrawals', label: 'Retraits', icon: <ArrowDownCircle className="w-5 h-5" /> },
    { path: '/admin/users', label: 'Utilisateurs', icon: <Users className="w-5 h-5" /> },
    { path: '/admin/profile', label: 'Mon profil', icon: <User className="w-5 h-5" /> },
  ];

  const navItems = userType === 'business' ? businessNav : userType === 'admin' ? adminNav : investorNav;

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-galsen-white">
      {/* ── Header mobile ─────────────────────────────────────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-galsen-green/10 px-4 py-2.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-galsen-green hover:bg-galsen-green/10 rounded-lg transition-colors"
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <img src={logoGalsen} alt="GALSEN INVEST" className="h-8" />
        </div>

        {/* Avatar à droite sur mobile */}
        <AvatarDropdown
          initials={userInfo.initials}
          name={userInfo.name}
          email={userInfo.email}
          role={role}
          onLogout={handleLogout}
          onNavigate={(path) => navigate(path)}
        />
      </div>

      {/* ── Overlay mobile ────────────────────────────────────────────────── */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 mt-14"
          onClick={closeMobileMenu}
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside
        className={`fixed left-0 h-full w-64 bg-white border-r border-galsen-green/10 flex flex-col shadow-lg z-40 transition-transform duration-300 lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 top-14' : '-translate-x-full top-14 lg:top-0'
          }`}
      >
        {/* Logo desktop */}
        <div className="hidden lg:block p-6 border-b border-galsen-green/10">
          <img src={logoGalsen} alt="GALSEN INVEST" className="h-12 mb-2" />
          <p className="text-sm text-galsen-blue/70 font-medium">
            {userType === 'business' ? 'Espace Entreprise' : userType === 'admin' ? 'Administration' : 'Espace Investisseur'}
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${location.pathname === item.path
                    ? 'bg-galsen-green text-white shadow-md'
                    : 'text-galsen-blue hover:bg-galsen-green/10'
                    }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar logout (desktop) */}
        <div className="hidden lg:block p-4 border-t border-galsen-green/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-galsen-red hover:bg-galsen-red/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="lg:ml-64">
        {/* Top bar desktop — avatar à droite */}
        <header className="hidden lg:flex items-center justify-end px-8 py-4 border-b border-galsen-green/5 bg-white/80 backdrop-blur-sm sticky top-0 z-30">
          <AvatarDropdown
            initials={userInfo.initials}
            name={userInfo.name}
            email={userInfo.email}
            role={role}
            onLogout={handleLogout}
            onNavigate={(path) => navigate(path)}
          />
        </header>

        <main className="p-4 md:p-6 lg:p-8 pt-18 lg:pt-6">
          {children}
        </main>
      </div>
    </div>
  );
}
