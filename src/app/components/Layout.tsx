import React, { useState } from 'react';
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
  X
} from 'lucide-react';
import logoGalsen from '../images/logogalsen_invest.png';

interface LayoutProps {
  children: React.ReactNode;
  userType?: 'investor' | 'business' | 'admin';
}

export function Layout({ children, userType = 'investor' }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const investorNav = [
    { path: '/investor/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: '/campaigns', label: 'Campagnes', icon: <TrendingUp className="w-5 h-5" /> },
    { path: '/investor/wallet', label: 'Portefeuille', icon: <Wallet className="w-5 h-5" /> },
    { path: '/investor/profile', label: 'Mon profil', icon: <User className="w-5 h-5" /> }
  ];

  const businessNav = [
    { path: '/business/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: '/business/campaigns', label: 'Mes campagnes', icon: <TrendingUp className="w-5 h-5" /> },
    { path: '/business/profile', label: 'Mon profil', icon: <Building2 className="w-5 h-5" /> }
  ];

  const adminNav = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: '/admin/campaigns', label: 'Campagnes', icon: <FileText className="w-5 h-5" /> },
    { path: '/admin/kyc', label: 'Documents KYC', icon: <CheckSquare className="w-5 h-5" /> },
    { path: '/admin/users', label: 'Utilisateurs', icon: <Users className="w-5 h-5" /> }
  ];

  const navItems = userType === 'business' ? businessNav : userType === 'admin' ? adminNav : investorNav;

  const handleLogout = () => {
    navigate('/login');
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-galsen-white">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-galsen-green/10 px-4 py-3 flex items-center justify-between shadow-sm">
        <img src={logoGalsen} alt="GALSEN INVEST" className="h-10" />
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-galsen-green hover:bg-galsen-green/10 rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Overlay pour mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 mt-16"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar - Desktop & Mobile */}
      <aside
        className={`fixed left-0 h-full w-64 bg-white border-r border-galsen-green/10 flex flex-col shadow-lg z-40 transition-transform duration-300 lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0 top-16' : '-translate-x-full top-16 lg:top-0'
        }`}
      >
        {/* Logo - Visible seulement sur desktop */}
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    location.pathname === item.path
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

        {/* Logout button */}
        <div className="p-4 border-t border-galsen-green/10">
          <button
            onClick={() => {
              handleLogout();
              closeMobileMenu();
            }}
            className="flex items-center gap-3 px-4 py-3 w-full text-galsen-red hover:bg-galsen-red/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 p-4 md:p-6 lg:p-8 pt-20 lg:pt-8">
        {children}
      </main>
    </div>
  );
}
