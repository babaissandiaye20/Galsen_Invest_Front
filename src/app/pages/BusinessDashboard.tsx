import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { StatusBadge } from '../components/StatusBadge';
import { ProgressBar } from '../components/ProgressBar';
import { Target, DollarSign, Users, TrendingUp, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProfileStore, useAuthStore, useCampaignStore } from '../store';
import { useShallow } from 'zustand/react/shallow';
import { campaignService } from '../services';

export function BusinessDashboard() {
  console.log('🎯 [BusinessDashboard] Début du rendu');
  
  const [activeFilter, setActiveFilter] = useState<'all' | 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'FUNDED' | 'CLOSED'>('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('DESC');
  
  console.log('🎯 [BusinessDashboard] États initialisés');
  
  console.log('🎯 [BusinessDashboard] Avant useProfileStore');
  const { businessProfile, fetchBusinessProfile, loading, error } = useProfileStore(
    useShallow((s) => ({
      businessProfile: s.businessProfile,
      fetchBusinessProfile: s.fetchBusinessProfile,
      loading: s.loading,
      error: s.error
    }))
  );
  console.log('🎯 [BusinessDashboard] Après useProfileStore', { businessProfile, loading, error });

  console.log('🎯 [BusinessDashboard] Avant useAuthStore');
  const { token, isAuthenticated } = useAuthStore(
    useShallow((s) => ({ token: s.token, isAuthenticated: s.isAuthenticated }))
  );

  // État pour les statistiques
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  console.log('🎯 [BusinessDashboard] Après useAuthStore', { hasToken: !!token, isAuthenticated });

  // Store des campagnes
  console.log('🎯 [BusinessDashboard] Avant useCampaignStore');
  const { campaigns, pagination, fetchMyCampaigns, loading: campaignsLoading } = useCampaignStore(
    useShallow((s) => ({
      campaigns: s.myCampaigns, // ✅ Utiliser myCampaigns au lieu de campaigns
      pagination: s.pagination,
      fetchMyCampaigns: s.fetchMyCampaigns,
      loading: s.loading
    }))
  );
  console.log('🎯 [BusinessDashboard] Après useCampaignStore', { campaigns, campaignsLoading });

  // Filtrer les campagnes depuis l'API
  const filteredCampaigns = activeFilter === 'all'
    ? campaigns
    : campaigns.filter(c => c.status === activeFilter);

  // Charger le profil business et les statistiques au montage
  useEffect(() => {
    if (isAuthenticated && token) {
      const timer = setTimeout(() => {
        fetchBusinessProfile();
        loadStats();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, token, fetchBusinessProfile]);

  // Charger les statistiques
  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const data = await campaignService.getBusinessStats();
      console.log('📊 Statistiques business:', data);
      setStats(data);
    } catch (error) {
      console.error('❌ Erreur chargement stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  // Charger les campagnes
  useEffect(() => {
    console.log('🎯 [BusinessDashboard] Chargement campagnes...', { isAuthenticated, hasToken: !!token });
    if (isAuthenticated && token) {
      fetchMyCampaigns({
        page: currentPage,
        size: 10,
        sort: [`createdAt,${sortDirection}`]
      });
    }
  }, [isAuthenticated, token, currentPage, sortDirection, fetchMyCampaigns]);

  // Debug des campagnes
  useEffect(() => {
    console.log('📊 [BusinessDashboard] État campagnes:');
    console.log('   - Campagnes:', campaigns);
    console.log('   - Nombre:', campaigns?.length);
    console.log('   - Loading:', campaignsLoading);
    console.log('   - Pagination:', pagination);
    console.log('   - Filtre actif:', activeFilter);
    console.log('   - Campagnes filtrées:', filteredCampaigns);
  }, [campaigns, campaignsLoading, pagination, activeFilter, filteredCampaigns]);

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

        {/* Graphiques et métriques supplémentaires */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-galsen-green/10">
          <h2 className="text-lg md:text-xl font-bold text-galsen-blue mb-6">Aperçu de l'activité</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Performance des campagnes */}
            <div className="p-4 bg-galsen-green/5 rounded-lg">
              <h3 className="font-semibold text-galsen-blue mb-4">Performance globale</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-galsen-blue/70">Taux de réussite moyen</span>
                  <span className="font-bold text-galsen-green">
                    {businessProfile.totalRaised && businessProfile.activeCampaigns 
                      ? '75%' 
                      : '0%'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-galsen-blue/70">Montant moyen levé</span>
                  <span className="font-bold text-galsen-blue">
                    {businessProfile.activeCampaigns 
                      ? new Intl.NumberFormat('fr-FR', { notation: 'compact' }).format((businessProfile.totalRaised || 0) / businessProfile.activeCampaigns)
                      : '0'} FCFA
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-galsen-blue/70">Investissement moyen</span>
                  <span className="font-bold text-galsen-blue">
                    {businessProfile.investorCount 
                      ? new Intl.NumberFormat('fr-FR', { notation: 'compact' }).format((businessProfile.totalRaised || 0) / businessProfile.investorCount)
                      : '0'} FCFA
                  </span>
                </div>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="p-4 bg-galsen-gold/5 rounded-lg">
              <h3 className="font-semibold text-galsen-blue mb-4">Actions rapides</h3>
              <div className="space-y-3">
                <Link
                  to="/business/campaigns/new"
                  className="block w-full px-4 py-3 bg-galsen-gold hover:bg-galsen-gold/90 text-galsen-blue font-medium rounded-lg transition-colors text-center"
                >
                  <Plus className="w-5 h-5 inline mr-2" />
                  Créer une campagne
                </Link>
                <Link
                  to="/business/campaigns"
                  className="block w-full px-4 py-3 border border-galsen-green hover:bg-galsen-green/5 text-galsen-green font-medium rounded-lg transition-colors text-center"
                >
                  Voir mes campagnes
                </Link>
                <Link
                  to="/business/profile"
                  className="block w-full px-4 py-3 border border-galsen-blue hover:bg-galsen-blue/5 text-galsen-blue font-medium rounded-lg transition-colors text-center"
                >
                  Modifier mon profil
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Métriques d'évolution */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-galsen-green/10">
          <h2 className="text-lg md:text-xl font-bold text-galsen-blue mb-6">Évolution de votre activité</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Croissance */}
            <div className="text-center p-6 bg-gradient-to-br from-galsen-green/10 to-galsen-green/5 rounded-lg">
              <TrendingUp className="w-8 h-8 text-galsen-green mx-auto mb-3" />
              <p className="text-sm text-galsen-blue/70 mb-2">Croissance ce mois</p>
              <p className="text-3xl font-bold text-galsen-green">+0%</p>
              <p className="text-xs text-galsen-blue/60 mt-2">par rapport au mois dernier</p>
            </div>

            {/* Objectif annuel */}
            <div className="text-center p-6 bg-gradient-to-br from-galsen-gold/10 to-galsen-gold/5 rounded-lg">
              <Target className="w-8 h-8 text-galsen-gold mx-auto mb-3" />
              <p className="text-sm text-galsen-blue/70 mb-2">Objectif annuel</p>
              <p className="text-3xl font-bold text-galsen-gold">
                {businessProfile.totalRaised ? '0%' : '0%'}
              </p>
              <p className="text-xs text-galsen-blue/60 mt-2">de l'objectif atteint</p>
            </div>

            {/* Engagement */}
            <div className="text-center p-6 bg-gradient-to-br from-galsen-blue/10 to-galsen-blue/5 rounded-lg">
              <Users className="w-8 h-8 text-galsen-blue mx-auto mb-3" />
              <p className="text-sm text-galsen-blue/70 mb-2">Taux d'engagement</p>
              <p className="text-3xl font-bold text-galsen-blue">0%</p>
              <p className="text-xs text-galsen-blue/60 mt-2">investisseurs actifs</p>
            </div>
          </div>

          {/* Message d'encouragement */}
          <div className="mt-6 p-4 bg-galsen-green/5 border border-galsen-green/20 rounded-lg">
            <p className="text-sm text-galsen-blue text-center">
              💡 <strong>Astuce :</strong> Créez votre première campagne pour commencer à collecter des fonds et développer votre entreprise !
            </p>
          </div>
        </div>

      </div>
    </Layout>
  );
}
