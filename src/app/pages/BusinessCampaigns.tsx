import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { StatusBadge } from '../components/StatusBadge';
import { ProgressBar } from '../components/ProgressBar';
import { useCampaignStore, useAuthStore } from '../store';
import { useShallow } from 'zustand/react/shallow';
import { Plus, Send, Archive } from 'lucide-react';
import { Link } from 'react-router-dom';
import { campaignService } from '../services';

export function BusinessCampaigns() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'FUNDED' | 'CLOSED'>('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('DESC');
  const [submitting, setSubmitting] = useState<string | null>(null);

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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            {/* Onglets de filtrage */}
            <div className="flex gap-2 border-b border-galsen-green/20 overflow-x-auto pb-2">
              {[
                { id: 'all', label: 'Toutes' },
                { id: 'DRAFT', label: 'Brouillon' },
                { id: 'PENDING_REVIEW', label: 'En révision' },
                { id: 'APPROVED', label: 'Approuvé' },
                { id: 'ACTIVE', label: 'Actif' },
                { id: 'FUNDED', label: 'Financé' },
                { id: 'CLOSED', label: 'Terminé' }
              ].map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id as any)}
                  className={`px-4 py-2 font-medium transition-colors whitespace-nowrap text-sm ${
                    activeFilter === filter.id
                      ? 'border-b-2 border-galsen-gold text-galsen-gold'
                      : 'text-galsen-blue/70 hover:text-galsen-blue'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Tri par date */}
            <button
              onClick={() => setSortDirection(sortDirection === 'DESC' ? 'ASC' : 'DESC')}
              className="px-4 py-2 border border-galsen-green/30 rounded-lg hover:bg-galsen-green/5 transition-colors text-sm flex items-center gap-2"
            >
              <span>Date de création</span>
              <span>{sortDirection === 'DESC' ? '↓' : '↑'}</span>
            </button>
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-galsen-green/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-galsen-blue">Campagne</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-galsen-blue hidden md:table-cell">Statut</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-galsen-blue">Progression</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-galsen-blue">Objectif</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-galsen-blue">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-galsen-green/10">
                  {filteredCampaigns.map(campaign => {
                    const percentage = campaign.fundingPercentage ?? 0;
                    
                    return (
                      <tr key={campaign.id} className="hover:bg-galsen-green/5 transition-colors">
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-galsen-blue">{campaign.title}</p>
                            <p className="text-sm text-galsen-blue/60">{campaign.categoryLibelle}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell">
                          <StatusBadge status={campaign.status as any} />
                        </td>
                        <td className="px-4 py-4">
                          <div className="min-w-[120px]">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-galsen-green">{percentage.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-galsen-green/10 rounded-full h-2">
                              <div
                                className="bg-galsen-gold h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              />
                            </div>
                          </div>
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
                                <span className="hidden sm:inline">Publier</span>
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
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-galsen-green/10 mt-6">
              <p className="text-sm text-galsen-blue/70">
                Page {pagination.pageNumber + 1} sur {pagination.totalPages}
                <span className="ml-2">({pagination.totalElements} campagnes au total)</span>
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
