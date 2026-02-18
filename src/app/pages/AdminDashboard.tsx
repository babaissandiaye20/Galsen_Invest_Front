import React, { useEffect } from 'react';
import { Layout } from '../components/Layout';
import { StatusBadge } from '../components/StatusBadge';
import {
  Users,
  FileText,
  CheckSquare,
  DollarSign,
  ArrowRight,
  Loader2,
  TrendingUp,
  Target,
  BarChart3,
  PieChart,
  Wallet,
  UserCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useKycStore, useAdminStore } from '../store';
import { useShallow } from 'zustand/react/shallow';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

// Labels lisibles pour les types de documents
const docTypeLabels: Record<string, string> = {
  ID_CARD_FRONT: 'CNI — Recto',
  ID_CARD_BACK: 'CNI — Verso',
  PASSPORT: 'Passeport',
  SELFIE: 'Selfie',
  INCOME_PROOF: 'Revenus',
  ADDRESS_PROOF: 'Domicile',
};

// Labels lisibles pour les statuts de campagne
const campaignStatusLabels: Record<string, string> = {
  APPROVED: 'Approuvées',
  ACTIVE: 'Actives',
  REVIEW: 'En révision',
  DRAFT: 'Brouillons',
  REJECTED: 'Rejetées',
  CLOSED: 'Terminées',
  SUSPENDED: 'Suspendues',
  CANCELLED: 'Annulées',
};

const campaignStatusColors: Record<string, string> = {
  APPROVED: 'bg-green-100 text-green-700',
  ACTIVE: 'bg-blue-100 text-blue-700',
  REVIEW: 'bg-yellow-100 text-yellow-700',
  DRAFT: 'bg-gray-100 text-gray-600',
  REJECTED: 'bg-red-100 text-red-700',
  CLOSED: 'bg-gray-600 text-white',
  SUSPENDED: 'bg-orange-100 text-orange-700',
  CANCELLED: 'bg-gray-200 text-gray-500',
};

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000_000) {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(amount / 1_000_000_000) + ' Mrd';
  }
  if (amount >= 1_000_000) {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(amount / 1_000_000) + ' M';
  }
  return new Intl.NumberFormat('fr-FR').format(amount);
}

export function AdminDashboard() {
  const { pendingDocuments, pagination, loading: kycLoading, adminFetchPending } = useKycStore(
    useShallow((s) => ({
      pendingDocuments: s.pendingDocuments,
      pagination: s.pagination,
      loading: s.loading,
      adminFetchPending: s.adminFetchPending,
    }))
  );

  const {
    users,
    pagination: usersPagination,
    campaignStats,
    investmentStats,
    statsLoading,
    fetchUsers,
    fetchCampaignStats,
    fetchInvestmentStats,
  } = useAdminStore(
    useShallow((s) => ({
      users: s.users,
      pagination: s.pagination,
      campaignStats: s.campaignStats,
      investmentStats: s.investmentStats,
      statsLoading: s.statsLoading,
      fetchUsers: s.fetchUsers,
      fetchCampaignStats: s.fetchCampaignStats,
      fetchInvestmentStats: s.fetchInvestmentStats,
    }))
  );

  useEffect(() => {
    adminFetchPending({ page: 0, size: 5, sort: 'createdAt,ASC' });
    fetchUsers({ page: 0, size: 15 });
    fetchCampaignStats();
    fetchInvestmentStats();
  }, [adminFetchPending, fetchUsers, fetchCampaignStats, fetchInvestmentStats]);

  const totalUsers = usersPagination?.totalElements ?? users.length;
  const pendingDocumentsCount = pagination?.totalElements ?? pendingDocuments.length;

  // Stats campagnes
  const stats = campaignStats;
  const reviewCount = stats?.campaignsByStatus?.REVIEW ?? 0;

  return (
    <Layout userType="admin">
      <div className="space-y-6 md:space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-galsen-blue mb-2">Dashboard Administrateur</h1>
          <p className="text-galsen-blue/70 text-sm md:text-base">Vue d'ensemble de la plateforme</p>
        </div>

        {/* Cards de statistiques principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Utilisateurs */}
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-galsen-green/10 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="p-2 md:p-3 bg-galsen-gold/10 rounded-lg">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-galsen-gold" />
              </div>
            </div>
            <p className="text-galsen-blue/70 text-xs md:text-sm mb-1">Utilisateurs totaux</p>
            <p className="text-xl md:text-2xl font-bold text-galsen-blue">{totalUsers}</p>
            <Link
              to="/admin/users"
              className="text-xs text-galsen-gold hover:text-galsen-gold/80 mt-2 inline-block font-medium"
            >
              Gérer les utilisateurs →
            </Link>
          </div>

          {/* Total campagnes */}
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-galsen-green/10 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="p-2 md:p-3 bg-galsen-gold/10 rounded-lg">
                <FileText className="w-5 h-5 md:w-6 md:h-6 text-galsen-gold" />
              </div>
            </div>
            <p className="text-galsen-blue/70 text-xs md:text-sm mb-1">Campagnes totales</p>
            <p className="text-xl md:text-2xl font-bold text-galsen-blue">
              {statsLoading ? '…' : stats?.totalCampaigns ?? 0}
            </p>
            <Link
              to="/admin/campaigns"
              className="text-xs text-galsen-gold hover:text-galsen-gold/80 mt-2 inline-block font-medium"
            >
              Voir les campagnes →
            </Link>
          </div>

          {/* Documents KYC en attente */}
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-galsen-green/10 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="p-2 md:p-3 bg-galsen-gold/10 rounded-lg">
                <CheckSquare className="w-5 h-5 md:w-6 md:h-6 text-galsen-gold" />
              </div>
            </div>
            <p className="text-galsen-blue/70 text-xs md:text-sm mb-1">Documents KYC en attente</p>
            <p className="text-xl md:text-2xl font-bold text-galsen-blue">{pendingDocumentsCount}</p>
            <Link
              to="/admin/kyc"
              className="text-xs text-galsen-gold hover:text-galsen-gold/80 mt-2 inline-block font-medium"
            >
              Valider les documents →
            </Link>
          </div>

          {/* Total levé */}
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-galsen-green/10 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="p-2 md:p-3 bg-galsen-green/10 rounded-lg">
                <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-galsen-green" />
              </div>
            </div>
            <p className="text-galsen-blue/70 text-xs md:text-sm mb-1">Total levé</p>
            <p className="text-xl md:text-2xl font-bold text-galsen-blue">
              {statsLoading ? '…' : formatCurrency(stats?.totalRaisedAmount ?? 0)} FCFA
            </p>
            <p className="text-xs text-galsen-blue/60 mt-1">sur toute la plateforme</p>
          </div>
        </div>

        {/* Stats campagnes détaillées */}
        {statsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-galsen-green" />
          </div>
        ) : stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Indicateurs clés */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold text-galsen-blue flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-galsen-green" />
                  Indicateurs clés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-galsen-green/5 rounded-lg border border-galsen-green/20">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-galsen-green" />
                      <p className="text-xs text-galsen-blue/70">Campagnes actives</p>
                    </div>
                    <p className="text-2xl font-bold text-galsen-green">{stats.activeCampaigns}</p>
                  </div>
                  <div className="p-4 bg-galsen-gold/5 rounded-lg border border-galsen-gold/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-galsen-gold" />
                      <p className="text-xs text-galsen-blue/70">Taux de succès moyen</p>
                    </div>
                    <p className="text-2xl font-bold text-galsen-gold">{stats.averageSuccessRate.toFixed(1)}%</p>
                  </div>
                  <div className="p-4 bg-galsen-blue/5 rounded-lg border border-galsen-blue/20">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-galsen-blue" />
                      <p className="text-xs text-galsen-blue/70">Objectif total</p>
                    </div>
                    <p className="text-xl font-bold text-galsen-blue">{formatCurrency(stats.totalTargetAmount)} F</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckSquare className="w-4 h-4 text-purple-600" />
                      <p className="text-xs text-galsen-blue/70">100% financées</p>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">{stats.fullyFundedCampaigns}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Répartition par catégorie */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold text-galsen-blue flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-galsen-gold" />
                  Campagnes par catégorie
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(stats.campaignsByCategory).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(stats.campaignsByCategory)
                      .sort(([, a], [, b]) => b - a)
                      .map(([category, count]) => {
                        const percentage = stats.totalCampaigns > 0
                          ? Math.round((count / stats.totalCampaigns) * 100)
                          : 0;
                        return (
                          <div key={category}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-galsen-blue">{category}</span>
                              <span className="text-sm text-galsen-blue/70">
                                {count} ({percentage}%)
                              </span>
                            </div>
                            <div className="w-full bg-galsen-green/10 rounded-full h-2.5">
                              <div
                                className="bg-galsen-green rounded-full h-2.5 transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <p className="text-center text-galsen-blue/60 py-8">Aucune catégorie</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Répartition par statut */}
        {stats && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold text-galsen-blue">Campagnes par statut</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {Object.entries(stats.campaignsByStatus)
                  .filter(([, count]) => count > 0)
                  .sort(([, a], [, b]) => b - a)
                  .map(([status, count]) => (
                    <div
                      key={status}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg border bg-white"
                    >
                      <Badge className={campaignStatusColors[status] || 'bg-gray-100 text-gray-700'}>
                        {campaignStatusLabels[status] || status}
                      </Badge>
                      <span className="text-lg font-bold text-galsen-blue">{count}</span>
                    </div>
                  ))}
                {Object.values(stats.campaignsByStatus).every((c) => c === 0) && (
                  <p className="text-galsen-blue/60 text-sm">Aucune campagne</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistiques investissements */}
        {investmentStats && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold text-galsen-blue flex items-center gap-2">
                <Wallet className="w-5 h-5 text-galsen-green" />
                Statistiques investissements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="p-4 bg-galsen-green/5 rounded-lg border border-galsen-green/20 text-center">
                  <div className="flex items-center gap-2 justify-center mb-2">
                    <TrendingUp className="w-4 h-4 text-galsen-green" />
                    <p className="text-xs text-galsen-blue/70">Total investissements</p>
                  </div>
                  <p className="text-2xl font-bold text-galsen-green">{investmentStats.totalInvestments}</p>
                </div>
                <div className="p-4 bg-galsen-gold/5 rounded-lg border border-galsen-gold/20 text-center">
                  <div className="flex items-center gap-2 justify-center mb-2">
                    <DollarSign className="w-4 h-4 text-galsen-gold" />
                    <p className="text-xs text-galsen-blue/70">Montant total</p>
                  </div>
                  <p className="text-xl font-bold text-galsen-gold">{formatCurrency(investmentStats.totalAmountInvested)} F</p>
                </div>
                <div className="p-4 bg-galsen-blue/5 rounded-lg border border-galsen-blue/20 text-center">
                  <div className="flex items-center gap-2 justify-center mb-2">
                    <UserCheck className="w-4 h-4 text-galsen-blue" />
                    <p className="text-xs text-galsen-blue/70">Investisseurs uniques</p>
                  </div>
                  <p className="text-2xl font-bold text-galsen-blue">{investmentStats.uniqueInvestors}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 text-center">
                  <div className="flex items-center gap-2 justify-center mb-2">
                    <Target className="w-4 h-4 text-purple-600" />
                    <p className="text-xs text-galsen-blue/70">Montant moyen</p>
                  </div>
                  <p className="text-xl font-bold text-purple-600">{formatCurrency(investmentStats.averageInvestmentAmount)} F</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200 text-center">
                  <div className="flex items-center gap-2 justify-center mb-2">
                    <FileText className="w-4 h-4 text-orange-600" />
                    <p className="text-xs text-galsen-blue/70">Campagnes investies</p>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">{investmentStats.campaignsWithInvestments}</p>
                </div>
              </div>
              {/* Min / Max */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200 flex items-center justify-between">
                  <span className="text-sm text-galsen-blue/70">Investissement min</span>
                  <span className="font-bold text-galsen-green">{formatCurrency(investmentStats.minInvestment)} F</span>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-between">
                  <span className="text-sm text-galsen-blue/70">Investissement max</span>
                  <span className="font-bold text-galsen-blue">{formatCurrency(investmentStats.maxInvestment)} F</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions rapides */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Campagnes en révision */}
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-galsen-green/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-bold text-galsen-blue">Campagnes en révision</h2>
              <Link
                to="/admin/campaigns"
                className="text-galsen-gold hover:text-galsen-gold/80 text-sm font-medium"
              >
                Voir tout
              </Link>
            </div>

            {reviewCount > 0 ? (
              <div className="text-center py-6">
                <p className="text-3xl font-bold text-galsen-gold mb-2">{reviewCount}</p>
                <p className="text-sm text-galsen-blue/70">campagne{reviewCount > 1 ? 's' : ''} en attente de validation</p>
                <Link
                  to="/admin/campaigns"
                  className="inline-flex items-center gap-1 mt-4 text-sm text-galsen-gold hover:text-galsen-gold/80 font-medium"
                >
                  Valider maintenant
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="text-center py-8 text-galsen-blue/60">
                <CheckSquare className="w-12 h-12 mx-auto mb-3 text-galsen-green/30" />
                <p>Aucune campagne en attente</p>
              </div>
            )}
          </div>

          {/* Documents KYC en attente */}
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-galsen-green/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-bold text-galsen-blue">Documents KYC en attente</h2>
              <Link
                to="/admin/kyc"
                className="text-galsen-gold hover:text-galsen-gold/80 text-sm font-medium"
              >
                Voir tout
              </Link>
            </div>

            {kycLoading && !pendingDocuments.length ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-galsen-green" />
              </div>
            ) : pendingDocuments.length > 0 ? (
              <div className="space-y-3">
                {pendingDocuments.map(doc => (
                  <div key={doc.id} className="p-3 md:p-4 border border-galsen-green/20 rounded-lg hover:border-galsen-gold transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-galsen-blue mb-1 text-sm md:text-base">
                          {doc.userName || doc.userId.slice(0, 8) + '…'}
                        </h3>
                        {doc.userEmail && (
                          <p className="text-xs md:text-sm text-galsen-blue/70">{doc.userEmail}</p>
                        )}
                      </div>
                      <StatusBadge status={doc.status} />
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="text-xs md:text-sm">
                        <span className="text-galsen-blue/70">Type: </span>
                        <span className="font-medium text-galsen-blue">{docTypeLabels[doc.type] || doc.type}</span>
                      </div>
                      <Link
                        to="/admin/kyc"
                        className="inline-flex items-center gap-1 text-xs md:text-sm text-galsen-gold hover:text-galsen-gold/80 font-medium"
                      >
                        Vérifier
                        <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-galsen-blue/60">
                <CheckSquare className="w-12 h-12 mx-auto mb-3 text-galsen-green/30" />
                <p>Aucun document en attente</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
