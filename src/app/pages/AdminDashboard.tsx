import React, { useEffect } from 'react';
import { Layout } from '../components/Layout';
import { StatusBadge } from '../components/StatusBadge';
import { mockPendingCampaigns, mockCampaigns } from '../data/mockData';
import { Users, FileText, CheckSquare, DollarSign, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useKycStore } from '../store';
import { useShallow } from 'zustand/react/shallow';

// Labels lisibles pour les types de documents
const docTypeLabels: Record<string, string> = {
  ID_CARD_FRONT: 'CNI — Recto',
  ID_CARD_BACK: 'CNI — Verso',
  PASSPORT: 'Passeport',
  SELFIE: 'Selfie',
  INCOME_PROOF: 'Revenus',
  ADDRESS_PROOF: 'Domicile',
};

export function AdminDashboard() {
  const { pendingDocuments, pagination, loading: kycLoading, adminFetchPending } = useKycStore(
    useShallow((s) => ({
      pendingDocuments: s.pendingDocuments,
      pagination: s.pagination,
      loading: s.loading,
      adminFetchPending: s.adminFetchPending,
    }))
  );

  useEffect(() => {
    adminFetchPending({ page: 0, size: 5, sort: 'createdAt,ASC' });
  }, [adminFetchPending]);

  const totalUsers = 247; // Mock data
  const totalInvested = mockCampaigns.reduce((sum, c) => sum + c.raisedAmount, 0);
  const pendingCampaignsCount = mockPendingCampaigns.length;
  const pendingDocumentsCount = pagination?.totalElements ?? pendingDocuments.length;

  return (
    <Layout userType="admin">
      <div className="space-y-6 md:space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-galsen-blue mb-2">Dashboard Administrateur</h1>
          <p className="text-galsen-blue/70 text-sm md:text-base">Vue d'ensemble de la plateforme</p>
        </div>

        {/* Cards de statistiques */}
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
            <p className="text-xs text-galsen-blue/60 mt-1">investisseurs + entreprises</p>
          </div>

          {/* Campagnes en attente */}
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-galsen-green/10 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="p-2 md:p-3 bg-galsen-gold/10 rounded-lg">
                <FileText className="w-5 h-5 md:w-6 md:h-6 text-galsen-gold" />
              </div>
            </div>
            <p className="text-galsen-blue/70 text-xs md:text-sm mb-1">Campagnes en révision</p>
            <p className="text-xl md:text-2xl font-bold text-galsen-blue">{pendingCampaignsCount}</p>
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

          {/* Total investi */}
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-galsen-green/10 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="p-2 md:p-3 bg-galsen-green/10 rounded-lg">
                <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-galsen-green" />
              </div>
            </div>
            <p className="text-galsen-blue/70 text-xs md:text-sm mb-1">Total investi</p>
            <p className="text-xl md:text-2xl font-bold text-galsen-blue">
              {new Intl.NumberFormat('fr-FR', { notation: 'compact' }).format(totalInvested)} FCFA
            </p>
            <p className="text-xs text-galsen-blue/60 mt-1">sur toute la plateforme</p>
          </div>
        </div>

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

            {pendingCampaignsCount > 0 ? (
              <div className="space-y-3">
                {mockPendingCampaigns.map(campaign => (
                  <div key={campaign.id} className="p-3 md:p-4 border border-galsen-green/20 rounded-lg hover:border-galsen-gold transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-galsen-blue mb-1 text-sm md:text-base">{campaign.title}</h3>
                        <p className="text-xs md:text-sm text-galsen-blue/70">{campaign.businessName}</p>
                      </div>
                      <StatusBadge status={campaign.status as any} />
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="text-xs md:text-sm">
                        <span className="text-galsen-blue/70">Objectif: </span>
                        <span className="font-medium text-galsen-green">
                          {new Intl.NumberFormat('fr-FR').format(campaign.goalAmount)} FCFA
                        </span>
                      </div>
                      <Link
                        to={`/admin/campaigns/${campaign.id}`}
                        className="inline-flex items-center gap-1 text-xs md:text-sm text-galsen-gold hover:text-galsen-gold/80 font-medium"
                      >
                        Valider
                        <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
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

        {/* Statistiques des campagnes */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-galsen-green/10">
          <h2 className="text-lg md:text-xl font-bold text-galsen-blue mb-6">Vue d'ensemble des campagnes</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            <div className="text-center p-4 bg-galsen-green/5 rounded-lg border border-galsen-green/20">
              <p className="text-2xl md:text-3xl font-bold text-galsen-green mb-1">
                {mockCampaigns.filter(c => c.status === 'ACTIVE').length}
              </p>
              <p className="text-xs md:text-sm text-galsen-blue/70">Campagnes actives</p>
            </div>
            <div className="text-center p-4 bg-galsen-gold/5 rounded-lg border border-galsen-gold/20">
              <p className="text-2xl md:text-3xl font-bold text-galsen-gold mb-1">
                {mockCampaigns.filter(c => c.status === 'CLOSED').length}
              </p>
              <p className="text-xs md:text-sm text-galsen-blue/70">Campagnes terminées</p>
            </div>
            <div className="text-center p-4 bg-galsen-blue/5 rounded-lg border border-galsen-blue/20">
              <p className="text-2xl md:text-3xl font-bold text-galsen-blue mb-1">
                {pendingCampaignsCount}
              </p>
              <p className="text-xs md:text-sm text-galsen-blue/70">En révision</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
