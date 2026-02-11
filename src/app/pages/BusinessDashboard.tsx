import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { StatusBadge } from '../components/StatusBadge';
import { ProgressBar } from '../components/ProgressBar';
import { mockCampaigns } from '../data/mockData';
import { Target, DollarSign, Users, TrendingUp, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProfileStore, useAuthStore } from '../store';
import { useShallow } from 'zustand/react/shallow';

export function BusinessDashboard() {
  const [activeFilter, setActiveFilter] = useState('all');
  
  const { businessProfile, fetchBusinessProfile, loading, error } = useProfileStore(
    useShallow((s) => ({
      businessProfile: s.businessProfile,
      fetchBusinessProfile: s.fetchBusinessProfile,
      loading: s.loading,
      error: s.error
    }))
  );

  const { token, isAuthenticated } = useAuthStore(
    useShallow((s) => ({ token: s.token, isAuthenticated: s.isAuthenticated }))
  );

  // Charger le profil business au montage
  useEffect(() => {
    if (isAuthenticated && token) {
      const timer = setTimeout(() => {
        fetchBusinessProfile();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, token, fetchBusinessProfile]);

  // Simuler les campagnes de l'entreprise
  const myCampaigns = mockCampaigns.slice(0, 4).map((c, i) => ({
    ...c,
    status: i === 0 ? 'ACTIVE' : i === 1 ? 'REVIEW' : i === 2 ? 'DRAFT' : 'CLOSED'
  }));

  const filteredCampaigns = activeFilter === 'all'
    ? myCampaigns
    : myCampaigns.filter(c => c.status === activeFilter);

  // Afficher un loader pendant le chargement
  if (loading && !businessProfile) {
    return (
      <Layout userType="business">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Chargement de votre profil...</p>
        </div>
      </Layout>
    );
  }

  // Afficher une erreur si le profil n'a pas pu être chargé
  if (error && !businessProfile) {
    return (
      <Layout userType="business">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-2">Erreur de chargement du profil</p>
            <p className="text-gray-600 text-sm">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Si pas de profil, ne rien afficher
  if (!businessProfile) {
    return (
      <Layout userType="business">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Aucun profil trouvé</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout userType="business">
      <div className="space-y-6 md:space-y-8">
        {/* Header avec profil entreprise */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-galsen-green/10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3 md:gap-4">
              {businessProfile.logoUrl && (
                <img
                  src={businessProfile.logoUrl}
                  alt={businessProfile.companyName}
                  className="w-12 h-12 md:w-16 md:h-16 rounded-lg border-2 border-galsen-gold object-cover"
                />
              )}
              {!businessProfile.logoUrl && (
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg border-2 border-galsen-gold bg-galsen-gold/10 flex items-center justify-center">
                  <span className="text-xl md:text-2xl font-bold text-galsen-gold">
                    {businessProfile.companyName?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-galsen-blue">{businessProfile.companyName}</h1>
                <p className="text-sm md:text-base text-galsen-blue/70">
                  {businessProfile.tradeName && `${businessProfile.tradeName} • `}{businessProfile.legalForm}
                </p>
              </div>
            </div>
            <Link
              to="/business/profile"
              className="px-4 py-2 text-galsen-green hover:bg-galsen-green/10 rounded-lg transition-colors font-medium text-sm md:text-base"
            >
              Mon profil
            </Link>
          </div>
        </div>

        {/* Cards de statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Campagnes actives */}
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-galsen-green/10 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="p-2 md:p-3 bg-galsen-gold/10 rounded-lg">
                <Target className="w-5 h-5 md:w-6 md:h-6 text-galsen-gold" />
              </div>
            </div>
            <p className="text-galsen-blue/70 text-xs md:text-sm mb-1">Campagnes actives</p>
            <p className="text-xl md:text-2xl font-bold text-galsen-blue">{businessProfile.activeCampaigns || 0}</p>
          </div>

          {/* Total collecté */}
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-galsen-green/10 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="p-2 md:p-3 bg-galsen-green/10 rounded-lg">
                <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-galsen-green" />
              </div>
            </div>
            <p className="text-galsen-blue/70 text-xs md:text-sm mb-1">Total collecté</p>
            <p className="text-xl md:text-2xl font-bold text-galsen-blue">
              {new Intl.NumberFormat('fr-FR').format(businessProfile.totalRaised || 0)} FCFA
            </p>
          </div>

          {/* Investisseurs */}
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-galsen-green/10 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="p-2 md:p-3 bg-galsen-gold/10 rounded-lg">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-galsen-gold" />
              </div>
            </div>
            <p className="text-galsen-blue/70 text-xs md:text-sm mb-1">Investisseurs</p>
            <p className="text-xl md:text-2xl font-bold text-galsen-blue">{businessProfile.investorCount || 0}</p>
            <p className="text-xs text-galsen-blue/60 mt-1">sur toutes les campagnes</p>
          </div>

          {/* Nombre d'employés */}
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-galsen-green/10 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="p-2 md:p-3 bg-galsen-green/10 rounded-lg">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-galsen-green" />
              </div>
            </div>
            <p className="text-galsen-blue/70 text-xs md:text-sm mb-1">Employés</p>
            <p className="text-xl md:text-2xl font-bold text-galsen-blue">{businessProfile.employeeCount || 'N/A'}</p>
            <p className="text-xs text-galsen-blue/60 mt-1">dans l'entreprise</p>
          </div>
        </div>

        {/* Section Mes campagnes */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-galsen-green/10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-lg md:text-xl font-bold text-galsen-blue">Mes campagnes</h2>
            <Link
              to="/business/campaigns/new"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-galsen-gold hover:bg-galsen-gold/90 text-galsen-blue font-medium rounded-lg transition-colors shadow-md"
            >
              <Plus className="w-5 h-5" />
              <span className="text-sm md:text-base">Nouvelle campagne</span>
            </Link>
          </div>

          {/* Onglets de filtrage - Scrollable sur mobile */}
          <div className="flex gap-2 mb-6 border-b border-galsen-green/20 overflow-x-auto pb-2">
            {[
              { id: 'all', label: 'Toutes' },
              { id: 'DRAFT', label: 'Brouillon' },
              { id: 'REVIEW', label: 'En révision' },
              { id: 'ACTIVE', label: 'Actif' },
              { id: 'CLOSED', label: 'Terminé' }
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 font-medium transition-colors whitespace-nowrap text-sm md:text-base ${
                  activeFilter === filter.id
                    ? 'border-b-2 border-galsen-gold text-galsen-gold'
                    : 'text-galsen-blue/70 hover:text-galsen-blue'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Version mobile - Cards */}
          <div className="md:hidden space-y-4">
            {filteredCampaigns.map(campaign => {
              const percentage = (campaign.raisedAmount / campaign.goalAmount) * 100;

              return (
                <div key={campaign.id} className="p-4 border border-galsen-green/20 rounded-lg bg-galsen-white">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-galsen-blue mb-1">{campaign.title}</h3>
                      <p className="text-xs text-galsen-blue/70">{campaign.category}</p>
                    </div>
                    <StatusBadge status={campaign.status as any} />
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-galsen-green">
                        {percentage.toFixed(0)}%
                      </span>
                      <span className="text-xs text-galsen-blue/70">
                        {new Intl.NumberFormat('fr-FR').format(campaign.goalAmount)} FCFA
                      </span>
                    </div>
                    <div className="w-full bg-galsen-green/10 rounded-full h-2">
                      <div
                        className="bg-galsen-gold h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-galsen-blue/70">
                    <span>Fin: {new Date(campaign.endDate).toLocaleDateString('fr-FR')}</span>
                    <Link
                      to={`/business/campaigns/${campaign.id}`}
                      className="text-galsen-gold hover:text-galsen-gold/80 font-medium"
                    >
                      Voir →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Version desktop - Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-galsen-green/20">
                  <th className="text-left py-3 px-4 text-sm font-medium text-galsen-blue">Titre</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-galsen-blue">Statut</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-galsen-blue">Progression</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-galsen-blue">Objectif</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-galsen-blue">Date de fin</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-galsen-blue">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.map(campaign => {
                  const percentage = (campaign.raisedAmount / campaign.goalAmount) * 100;

                  return (
                    <tr key={campaign.id} className="border-b border-galsen-green/10 hover:bg-galsen-white transition-colors">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-galsen-blue">{campaign.title}</p>
                          <p className="text-sm text-galsen-blue/70">{campaign.category}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={campaign.status as any} />
                      </td>
                      <td className="py-4 px-4">
                        <div className="w-32">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-galsen-green">
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full bg-galsen-green/10 rounded-full h-2">
                            <div
                              className="bg-galsen-gold h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <p className="font-medium text-galsen-green">
                            {new Intl.NumberFormat('fr-FR').format(campaign.raisedAmount)} FCFA
                          </p>
                          <p className="text-galsen-blue/70">
                            / {new Intl.NumberFormat('fr-FR').format(campaign.goalAmount)} FCFA
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-galsen-blue/70">
                        {new Date(campaign.endDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/business/campaigns/${campaign.id}`}
                            className="text-galsen-gold hover:text-galsen-gold/80 text-sm font-medium"
                          >
                            Voir
                          </Link>
                          {campaign.status === 'DRAFT' && (
                            <>
                              <span className="text-galsen-green/20">|</span>
                              <button className="text-galsen-gold hover:text-galsen-gold/80 text-sm font-medium">
                                Modifier
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredCampaigns.length === 0 && (
            <div className="text-center py-12">
              <p className="text-galsen-blue mb-2">Aucune campagne trouvée</p>
              <p className="text-sm text-galsen-blue/60">
                {activeFilter === 'all'
                  ? 'Créez votre première campagne pour commencer'
                  : 'Aucune campagne avec ce statut'}
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
