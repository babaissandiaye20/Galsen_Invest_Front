import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { StatusBadge } from '../components/StatusBadge';
import { FundingProgress } from '../components/FundingProgress';
import { useCampaignStore, useAuthStore } from '../store';
import { useShallow } from 'zustand/react/shallow';
import { Plus, Send, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { campaignService, investmentService } from '../services';

export function BusinessCampaigns() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'DRAFT' | 'REVIEW' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'FUNDED' | 'CLOSED'>('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('DESC');
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [investmentCounts, setInvestmentCounts] = useState<Record<string, number>>({});

  const { token, isAuthenticated } = useAuthStore(
    useShallow((s) => ({ token: s.token, isAuthenticated: s.isAuthenticated }))
  );

  const { campaigns, pagination, fetchMyCampaigns, loading: campaignsLoading } = useCampaignStore(
    useShallow((s) => ({
      campaigns: s.myCampaigns,
      pagination: s.pagination,
      fetchMyCampaigns: s.fetchMyCampaigns,
      loading: s.loading
    }))
  );

  // Charger les campagnes
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchMyCampaigns({
        page: currentPage,
        size: 10,
        sort: [`createdAt,${sortDirection}`]
      });
    }
  }, [isAuthenticated, token, currentPage, sortDirection, fetchMyCampaigns]);

  // Charger le nombre d'investissements pour chaque campagne
  useEffect(() => {
    if (campaigns.length > 0) {
      campaigns.forEach(c => {
        investmentService.getCountByCampaign(c.id)
          .then(count => setInvestmentCounts(prev => ({ ...prev, [c.id]: count })))
          .catch(() => {});
      });
    }
  }, [campaigns]);

  // Filtrer les campagnes
  const filteredCampaigns = activeFilter === 'all'
    ? campaigns
    : campaigns.filter(c => c.status === activeFilter);

  // Debug des campagnes et filtres
  useEffect(() => {
    console.log('🔍 [BusinessCampaigns] Campagnes:', campaigns);
    console.log('🔍 [BusinessCampaigns] Statuts disponibles:', [...new Set(campaigns.map(c => c.status))]);
    console.log('🔍 [BusinessCampaigns] Filtre actif:', activeFilter);
    console.log('🔍 [BusinessCampaigns] Campagnes filtrées:', filteredCampaigns.length);
  }, [campaigns, activeFilter, filteredCampaigns]);

  // Soumettre une campagne pour révision
  const handleSubmit = async (campaignId: string) => {
    if (!confirm('Voulez-vous soumettre cette campagne pour révision ?')) return;
    
    setSubmitting(campaignId);
    try {
      await campaignService.submit(campaignId);
      alert('Campagne soumise avec succès !');
      // Recharger les campagnes
      fetchMyCampaigns({
        page: currentPage,
        size: 10,
        sort: [`createdAt,${sortDirection}`]
      });
    } catch (error: any) {
      alert('Erreur lors de la soumission : ' + (error.message || 'Erreur inconnue'));
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <Layout userType="business">
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-galsen-blue">Mes campagnes</h1>
            <p className="text-galsen-blue/70 mt-1">Gérez vos campagnes de financement</p>
          </div>
          <Link
            to="/business/campaigns/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-galsen-gold hover:bg-galsen-gold/90 text-galsen-blue font-semibold rounded-lg transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Nouvelle campagne
          </Link>
        </div>

        {/* Section principale */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-galsen-green/10">
          {/* Contrôles de tri et filtrage */}
          <div className="flex flex-col gap-4 mb-6">
            {/* Onglets de filtrage — grille responsive */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:flex md:flex-wrap gap-1.5 md:gap-2 border-b border-galsen-green/20 pb-3">
              {[
                { id: 'all', label: 'Toutes' },
                { id: 'DRAFT', label: 'Brouillon' },
                { id: 'REVIEW', label: 'En révision' },
                { id: 'APPROVED', label: 'Approuvé' },
                { id: 'ACTIVE', label: 'Actif' },
                { id: 'FUNDED', label: 'Financé' },
                { id: 'CLOSED', label: 'Terminé' }
              ].map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id as any)}
                  className={`px-2.5 py-1.5 md:px-4 md:py-2 font-medium transition-colors text-xs md:text-sm rounded-lg md:rounded-none md:border-b-2 ${
                    activeFilter === filter.id
                      ? 'bg-galsen-gold/10 md:bg-transparent border-galsen-gold text-galsen-gold md:border-b-2'
                      : 'text-galsen-blue/70 hover:text-galsen-blue border-transparent'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Tri par date */}
            <div className="flex justify-end">
              <button
                onClick={() => setSortDirection(sortDirection === 'DESC' ? 'ASC' : 'DESC')}
                className="px-4 py-2 border border-galsen-green/30 rounded-lg hover:bg-galsen-green/5 transition-colors text-sm flex items-center gap-2"
              >
                <span>Date de création</span>
                <span>{sortDirection === 'DESC' ? '↓' : '↑'}</span>
              </button>
            </div>
          </div>

          {/* Liste des campagnes */}
          {filteredCampaigns.length === 0 && !campaignsLoading ? (
            <div className="text-center py-12">
              <p className="text-galsen-blue mb-2">Aucune campagne trouvée</p>
              <p className="text-sm text-galsen-blue/60 mb-4">
                {activeFilter === 'all'
                  ? 'Créez votre première campagne pour commencer'
                  : 'Aucune campagne avec ce statut'}
              </p>
              {activeFilter === 'all' && (
                <Link
                  to="/business/campaigns/new"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-galsen-gold hover:bg-galsen-gold/90 text-galsen-blue font-medium rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Créer une campagne
                </Link>
              )}
            </div>
          ) : campaignsLoading ? (
            <div className="text-center py-12">
              <p className="text-galsen-blue/70">Chargement des campagnes...</p>
            </div>
          ) : (
            <>
            {/* Vue mobile — cartes */}
            <div className="md:hidden space-y-3">
              {filteredCampaigns.map(campaign => {
                return (
                  <div key={campaign.id} className="border border-galsen-green/10 rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-galsen-blue truncate">{campaign.title}</p>
                        <p className="text-xs text-galsen-blue/60">{campaign.categoryLibelle}</p>
                      </div>
                      <StatusBadge status={campaign.status as any} />
                    </div>

                    <FundingProgress
                      raisedAmount={campaign.raisedAmount}
                      targetAmount={campaign.targetAmount}
                      devise={campaign.devise}
                      variant="compact"
                    />

                    <div className="flex items-center gap-2 text-xs text-galsen-blue/70">
                      <Users className="w-3.5 h-3.5" />
                      <span>{investmentCounts[campaign.id] ?? '…'} investissement(s)</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-galsen-blue">
                          {new Intl.NumberFormat('fr-FR', { notation: 'compact' }).format(campaign.targetAmount)} FCFA
                        </p>
                        <p className="text-xs text-galsen-blue/60">
                          Fin: {new Date(campaign.endDate).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {campaign.status === 'DRAFT' && (
                          <button
                            onClick={() => handleSubmit(campaign.id)}
                            disabled={submitting === campaign.id}
                            className="p-2 bg-galsen-green hover:bg-galsen-green/90 text-white rounded-lg transition-colors disabled:opacity-50"
                            title="Soumettre pour révision"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        <Link
                          to={`/business/campaigns/${campaign.id}`}
                          className="px-3 py-2 border border-galsen-blue/30 hover:bg-galsen-blue/5 text-galsen-blue rounded-lg transition-colors text-sm"
                        >
                          Voir
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Vue desktop — table */}
            <div className="hidden md:block">
              <table className="w-full">
                <thead className="bg-galsen-green/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-galsen-blue">Campagne</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-galsen-blue">Statut</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-galsen-blue">Progression</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-galsen-blue">Investisseurs</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-galsen-blue">Objectif</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-galsen-blue">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-galsen-green/10">
                  {filteredCampaigns.map(campaign => {
                    return (
                      <tr key={campaign.id} className="hover:bg-galsen-green/5 transition-colors">
                        <td className="px-4 py-4">
                          <p className="font-medium text-galsen-blue">{campaign.title}</p>
                          <p className="text-sm text-galsen-blue/60">{campaign.categoryLibelle}</p>
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={campaign.status as any} />
                        </td>
                        <td className="px-4 py-4">
                          <FundingProgress
                            raisedAmount={campaign.raisedAmount}
                            targetAmount={campaign.targetAmount}
                            devise={campaign.devise}
                            variant="compact"
                            className="min-w-[120px]"
                          />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="font-medium text-galsen-blue">{investmentCounts[campaign.id] ?? '…'}</span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <p className="font-medium text-galsen-blue">
                            {new Intl.NumberFormat('fr-FR', { notation: 'compact' }).format(campaign.targetAmount)} FCFA
                          </p>
                          <p className="text-xs text-galsen-blue/60">
                            Fin: {new Date(campaign.endDate).toLocaleDateString('fr-FR')}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {campaign.status === 'DRAFT' && (
                              <button
                                onClick={() => handleSubmit(campaign.id)}
                                disabled={submitting === campaign.id}
                                className="px-3 py-2 bg-galsen-green hover:bg-galsen-green/90 text-white rounded-lg transition-colors flex items-center gap-1 text-sm disabled:opacity-50"
                                title="Soumettre pour révision"
                              >
                                <Send className="w-4 h-4" />
                                Publier
                              </button>
                            )}
                            <Link
                              to={`/business/campaigns/${campaign.id}`}
                              className="px-3 py-2 border border-galsen-blue/30 hover:bg-galsen-blue/5 text-galsen-blue rounded-lg transition-colors text-sm"
                            >
                              Voir
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            </>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-galsen-green/10 mt-6">
              <p className="text-sm text-galsen-blue/70 text-center sm:text-left">
                Page {pagination.pageNumber + 1}/{pagination.totalPages}
                <span className="ml-1">({pagination.totalElements} total)</span>
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={pagination.first || campaignsLoading}
                  className="px-4 py-2 border border-galsen-green/30 rounded-lg hover:bg-galsen-green/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Précédent
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages - 1, prev + 1))}
                  disabled={pagination.last || campaignsLoading}
                  className="px-4 py-2 border border-galsen-green/30 rounded-lg hover:bg-galsen-green/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
