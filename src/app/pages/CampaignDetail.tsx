import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ProgressBar } from '../components/ProgressBar';
import { StatusBadge } from '../components/StatusBadge';
import { CampaignCard } from '../components/CampaignCard';
import { useCampaignStore, useInvestmentStore } from '../store';
import { useShallow } from 'zustand/react/shallow';
import {
  Users,
  Calendar,
  DollarSign,
  ArrowLeft,
  FileText,
  Image as ImageIcon,
  TrendingUp,
  Bell
} from 'lucide-react';
import type { CampaignStatus } from '../models'; // Ensure correct import

export function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('description');
  const [investmentAmount, setInvestmentAmount] = useState('');

  // Store hooks
  const { currentCampaign, loading, error, fetchById, fetchByCategory, campaigns } = useCampaignStore(
    useShallow((s) => ({
      currentCampaign: s.currentCampaign,
      loading: s.loading,
      error: s.error,
      fetchById: s.fetchById,
      fetchByCategory: s.fetchByCategory,
      campaigns: s.campaigns
    }))
  );

  const { createInvestment, loading: investmentLoading } = useInvestmentStore(
    useShallow((state) => ({
      createInvestment: state.invest,
      loading: state.loading,
    }))
  );

  // Fetch campaign on mount
  useEffect(() => {
    if (id) {
      fetchById(id);
    }
  }, [id, fetchById]);

  // Fetch similar campaigns when currentCampaign is loaded
  useEffect(() => {
    if (currentCampaign?.categoryId) {
      fetchByCategory(currentCampaign.categoryId);
    }
  }, [currentCampaign?.categoryId, fetchByCategory]);

  if (error && !currentCampaign) {
    return (
      <Layout userType="investor">
        <div className="flex flex-col justify-center items-center h-[50vh] gap-4">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </Layout>
    );
  }

  if (loading || !currentCampaign) {
    return (
      <Layout userType="investor">
        <div className="flex justify-center items-center h-[50vh]">
          <div className="w-12 h-12 border-4 border-galsen-green border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  // Derived values
  const percentage = (currentCampaign.raisedAmount / currentCampaign.targetAmount) * 100;

  // Similar campaigns: filter out current one
  const similarCampaigns = campaigns
    .filter(c => c.id !== currentCampaign.id && c.status === 'APPROVED')
    .slice(0, 3);

  // Days left calculation
  const calculateDaysLeft = (endDateStr: string) => {
    const end = new Date(endDateStr);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysLeft = calculateDaysLeft(currentCampaign.endDate);

  const handleInvest = async () => {
    try {
      await createInvestment({
        campaignId: currentCampaign.id,
        amount: Number(investmentAmount),
      });
      alert(`Félicitations ! Vous avez investi ${investmentAmount} FCFA dans la campagne "${currentCampaign.title}"`);
      // Refresh campaign data to show updated raisedAmount
      fetchById(currentCampaign.id);
      setInvestmentAmount('');
    } catch (err) {
      alert("Erreur lors de l'investissement. Veuillez vérifier votre solde ou réessayer.");
    }
  };

  // Dummy min investment if not present (assuming 5000 FCFA default)
  const minInvestment = 5000;

  return (
    <Layout userType="investor">
      <div>
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/campaigns"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux campagnes
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2">
            {/* Hero section */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="relative h-96 bg-gray-100">
                {currentCampaign.coverImageUrl ? (
                  <img
                    src={currentCampaign.coverImageUrl}
                    alt={currentCampaign.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    Pas d'image de couverture
                  </div>
                )}
                <div
                  className="absolute top-4 left-4 px-3 py-1 rounded-full text-white text-sm font-medium shadow-sm"
                  style={{ backgroundColor: '#10B981' }} // Default color or strictly mapped
                >
                  {currentCampaign.categoryLibelle}
                </div>
                <StatusBadge
                  status={currentCampaign.status}
                  className="absolute top-4 right-4"
                />
              </div>

              <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {currentCampaign.title}
                </h1>

                <div className="flex items-center gap-3 mb-6">
                  {/* Placeholder for business info since it's missing in Campaign model */}
                  <div className="w-12 h-12 rounded-full bg-galsen-green/10 flex items-center justify-center text-galsen-green font-bold">
                    ENT
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Entreprise Porteur</p>
                    <p className="text-sm text-gray-600">Vérifiée</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Onglets */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex overflow-x-auto">
                  {[
                    { id: 'description', label: 'Description', icon: <FileText className="w-4 h-4" /> },
                    { id: 'photos', label: 'Photos', icon: <ImageIcon className="w-4 h-4" /> },
                    { id: 'investments', label: 'Investissements', icon: <TrendingUp className="w-4 h-4" /> },
                    { id: 'updates', label: 'Mises à jour', icon: <Bell className="w-4 h-4" /> }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'description' && (
                  <div className="prose max-w-none">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">À propos du projet</h3>
                    <p className="text-gray-700 leading-relaxed mb-6 whitespace-pre-wrap">
                      {currentCampaign.description}
                    </p>
                  </div>
                )}

                {activeTab === 'photos' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Galerie photos</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Placeholder gallery */}
                      {currentCampaign.coverImageUrl && (
                        <div className="aspect-video rounded-lg overflow-hidden">
                          <img
                            src={currentCampaign.coverImageUrl}
                            alt="Cover"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="aspect-video rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                        Plus de photos à venir
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'investments' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Derniers investisseurs
                    </h3>
                    <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
                      Liste des investisseurs disponible prochainement.
                    </div>
                  </div>
                )}

                {activeTab === 'updates' && (
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Aucune mise à jour pour le moment</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar droite */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Investir</h2>

              {/* Progression */}
              <div className="mb-6">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {percentage.toFixed(0)}%
                  </span>
                  <span className="text-sm text-gray-600">financé</span>
                </div>
                <ProgressBar
                  current={currentCampaign.raisedAmount}
                  goal={currentCampaign.targetAmount}
                  color={'#10B981'}
                  showPercentage={false}
                  showLabels={false}
                />
                <div className="mt-3 space-y-1">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-900">
                      {new Intl.NumberFormat('fr-FR').format(currentCampaign.raisedAmount)} {currentCampaign.devise}
                    </span> collectés
                  </p>
                  <p className="text-sm text-gray-600">
                    sur {new Intl.NumberFormat('fr-FR').format(currentCampaign.targetAmount)} {currentCampaign.devise}
                  </p>
                </div>
              </div>

              {/* Statistiques */}
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Contributeurs</p>
                    {/* Investor count not in API yet */}
                    <p className="font-medium text-gray-900">-</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Jours restants</p>
                    <p className="font-medium text-gray-900">
                      {daysLeft > 0 ? daysLeft : 'Terminé'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Montant minimum</p>
                    <p className="font-medium text-gray-900">
                      {new Intl.NumberFormat('fr-FR').format(minInvestment)} {currentCampaign.devise}
                    </p>
                  </div>
                </div>
              </div>

              {/* Formulaire investissement */}
              {currentCampaign.status === 'APPROVED' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Montant à investir ({currentCampaign.devise})
                    </label>
                    <input
                      type="number"
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(e.target.value)}
                      min={minInvestment}
                      placeholder={String(minInvestment)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum : {new Intl.NumberFormat('fr-FR').format(minInvestment)} {currentCampaign.devise}
                    </p>
                  </div>

                  <button
                    onClick={handleInvest}
                    disabled={investmentLoading || !investmentAmount || Number(investmentAmount) < minInvestment}
                    className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                  >
                    {investmentLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Investir maintenant'
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    Vérifiez votre niveau KYC avant d'investir
                  </p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-2">Campagne terminée ou non disponible</p>
                  <StatusBadge status={currentCampaign.status} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Campagnes similaires */}
        {similarCampaigns.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Campagnes similaires</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarCampaigns.map(campaign => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
