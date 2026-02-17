import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { StatusBadge } from '../components/StatusBadge';
import { Eye, CheckCircle, XCircle, FileText } from 'lucide-react';
import { useCampaignStore, useAuthStore } from '../store';
import { useShallow } from 'zustand/react/shallow';
import { campaignService, investmentService } from '../services';

export function AdminValidateCampaigns() {
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [investmentCount, setInvestmentCount] = useState<number>(0);
  
  const { token, isAuthenticated } = useAuthStore(
    useShallow((s) => ({ token: s.token, isAuthenticated: s.isAuthenticated }))
  );

  const { campaigns, fetchAll, loading } = useCampaignStore(
    useShallow((s) => ({
      campaigns: s.campaigns,
      fetchAll: s.fetchAll,
      loading: s.loading
    }))
  );

  // Charger toutes les campagnes au montage
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchAll({ page: 0, size: 100, sort: ['createdAt,DESC'] });
    }
  }, [isAuthenticated, token, fetchAll]);

  // Charger le nombre d'investissements quand une campagne est sélectionnée
  useEffect(() => {
    if (selectedCampaign?.id) {
      setInvestmentCount(0);
      investmentService.getCountByCampaign(selectedCampaign.id)
        .then(setInvestmentCount)
        .catch(() => setInvestmentCount(0));
    }
  }, [selectedCampaign?.id]);

  // Filtrer uniquement les campagnes en révision (REVIEW, PENDING_REVIEW ou DRAFT)
  const pendingCampaigns = campaigns.filter(c => 
    c.status === 'REVIEW' || c.status === 'PENDING_REVIEW' || c.status === 'SUBMITTED' || c.status === 'DRAFT'
  );

  // Debug
  useEffect(() => {
    console.log('🔍 [Admin] Toutes les campagnes:', campaigns);
    console.log('🔍 [Admin] Statuts disponibles:', [...new Set(campaigns.map(c => c.status))]);
    console.log('🔍 [Admin] Détail des statuts:', campaigns.map(c => ({ title: c.title, status: c.status })));
    console.log('🔍 [Admin] Campagnes en attente:', pendingCampaigns);
  }, [campaigns, pendingCampaigns]);
  
  const handleApprove = async (id: string) => {
    if (!confirm('Voulez-vous approuver cette campagne ?')) return;
    
    setProcessing(true);
    try {
      await campaignService.approve(id);
      alert('Campagne approuvée avec succès !');
      setSelectedCampaign(null);
      // Recharger les campagnes
      fetchAll({ page: 0, size: 100, sort: ['createdAt,DESC'] });
    } catch (error: any) {
      alert('Erreur lors de l\'approbation : ' + (error.message || 'Erreur inconnue'));
    } finally {
      setProcessing(false);
    }
  };
  
  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      alert('Veuillez indiquer le motif du rejet');
      return;
    }
    
    setProcessing(true);
    try {
      await campaignService.reject(id, { reason: rejectionReason });
      alert('Campagne rejetée. L\'entreprise a été notifiée.');
      setSelectedCampaign(null);
      setShowRejectModal(false);
      setRejectionReason('');
      // Recharger les campagnes
      fetchAll({ page: 0, size: 100, sort: ['createdAt,DESC'] });
    } catch (error: any) {
      alert('Erreur lors du rejet : ' + (error.message || 'Erreur inconnue'));
    } finally {
      setProcessing(false);
    }
  };
  
  return (
    <Layout userType="admin">
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Validation des campagnes</h1>
          <p className="text-gray-600">Examinez et validez les campagnes soumises par les entreprises</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liste des campagnes */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="font-semibold text-gray-900 mb-4">
                Campagnes en révision ({pendingCampaigns.length})
              </h2>
              
              {loading ? (
                <p className="text-gray-500 text-sm">Chargement...</p>
              ) : pendingCampaigns.length === 0 ? (
                <p className="text-gray-500 text-sm">Aucune campagne en attente de validation</p>
              ) : (
                <div className="space-y-3">
                  {pendingCampaigns.map(campaign => (
                  <button
                    key={campaign.id}
                    onClick={() => setSelectedCampaign(campaign)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                      selectedCampaign?.id === campaign.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h3 className="font-medium text-gray-900 mb-1">{campaign.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{campaign.categoryLibelle}</p>
                    <div className="flex items-center justify-between">
                      <StatusBadge status={campaign.status as any} />
                      <span className="text-xs text-gray-500">
                        {new Date(campaign.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </button>
                ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Détails de la campagne sélectionnée */}
          <div className="lg:col-span-2">
            {selectedCampaign ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedCampaign.title}
                    </h2>
                    <p className="text-gray-600">{selectedCampaign.categoryLibelle}</p>
                  </div>
                  <StatusBadge status={selectedCampaign.status as any} />
                </div>
                
                {/* Informations de la campagne */}
                <div className="space-y-6 mb-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Catégorie</p>
                      <p className="font-medium text-gray-900">{selectedCampaign.category}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Objectif financier</p>
                      <p className="font-medium text-gray-900">
                        {new Intl.NumberFormat('fr-FR').format(selectedCampaign.goalAmount)} FCFA
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Date de soumission</p>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedCampaign.submittedDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Statut</p>
                      <StatusBadge status={selectedCampaign.status as any} />
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Investissements</p>
                      <p className="font-medium text-gray-900">{investmentCount}</p>
                    </div>
                  </div>
                  
                  {/* Checklist de validation */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Checklist de validation</h3>
                    <div className="space-y-3">
                      {[
                        'Informations complètes et cohérentes',
                        'Documents fournis et valides',
                        'Description claire et détaillée',
                        'Objectif financier réaliste',
                        'Période de campagne appropriée',
                        'Entreprise vérifiée'
                      ].map((item, index) => (
                        <label key={index} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-gray-700">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Aperçu de la description */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Description du projet</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700">
                        Ce projet vise à développer une solution innovante dans le secteur {selectedCampaign.categoryLibelle}. 
                        L'entreprise {selectedCampaign.categoryLibelle} souhaite lever {new Intl.NumberFormat('fr-FR').format(selectedCampaign.goalAmount)} FCFA 
                        pour financer cette initiative qui aura un impact significatif sur le marché local.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => handleApprove(selectedCampaign.id)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Approuver la campagne
                  </button>
                  
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                    Rejeter la campagne
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Sélectionnez une campagne</p>
                <p className="text-sm text-gray-400">Cliquez sur une campagne pour voir les détails</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Modal de rejet */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Rejeter la campagne</h3>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motif du rejet <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Expliquez pourquoi cette campagne est rejetée..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ce message sera envoyé à l'entreprise
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleReject(selectedCampaign.id)}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                >
                  Confirmer le rejet
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
