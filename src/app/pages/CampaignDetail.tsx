import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ProgressBar } from '../components/ProgressBar';
import { StatusBadge } from '../components/StatusBadge';
import { CampaignCard } from '../components/CampaignCard';
import { mockCampaigns } from '../data/mockData';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Building2, 
  ArrowLeft,
  FileText,
  Image as ImageIcon,
  TrendingUp,
  Bell
} from 'lucide-react';

export function CampaignDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('description');
  const [investmentAmount, setInvestmentAmount] = useState('');
  
  const campaign = mockCampaigns.find(c => c.id === id);
  
  if (!campaign) {
    return (
      <Layout userType="investor">
        <div className="text-center py-12">
          <p className="text-gray-600">Campagne non trouvée</p>
          <Link to="/campaigns" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
            ← Retour aux campagnes
          </Link>
        </div>
      </Layout>
    );
  }
  
  const percentage = (campaign.raisedAmount / campaign.goalAmount) * 100;
  const similarCampaigns = mockCampaigns
    .filter(c => c.category === campaign.category && c.id !== campaign.id && c.status === 'ACTIVE')
    .slice(0, 3);
  
  const handleInvest = () => {
    alert(`Investissement de ${investmentAmount} FCFA dans la campagne "${campaign.title}"`);
  };
  
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
              <div className="relative h-96">
                <img 
                  src={campaign.coverImage}
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                />
                <div 
                  className="absolute top-4 left-4 px-3 py-1 rounded-full text-white text-sm font-medium"
                  style={{ backgroundColor: campaign.categoryColor }}
                >
                  {campaign.category}
                </div>
                <StatusBadge 
                  status={campaign.status as any} 
                  className="absolute top-4 right-4"
                />
              </div>
              
              <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {campaign.title}
                </h1>
                
                <div className="flex items-center gap-3 mb-6">
                  <img 
                    src={campaign.businessLogo}
                    alt={campaign.businessName}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{campaign.businessName}</p>
                    <p className="text-sm text-gray-600">Entreprise vérifiée</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Onglets */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex">
                  {[
                    { id: 'description', label: 'Description', icon: <FileText className="w-4 h-4" /> },
                    { id: 'photos', label: 'Photos', icon: <ImageIcon className="w-4 h-4" /> },
                    { id: 'investments', label: 'Investissements', icon: <TrendingUp className="w-4 h-4" /> },
                    { id: 'updates', label: 'Mises à jour', icon: <Bell className="w-4 h-4" /> }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                        activeTab === tab.id
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
                    <p className="text-gray-700 leading-relaxed mb-6">
                      {campaign.shortDescription}
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-6">
                      Notre projet vise à transformer le secteur {campaign.category.toLowerCase()} au Sénégal. 
                      Nous cherchons à lever {new Intl.NumberFormat('fr-FR').format(campaign.goalAmount)} FCFA 
                      pour financer cette initiative ambitieuse qui créera des emplois et générera de la valeur 
                      pour notre communauté.
                    </p>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 mt-8">
                      À propos de {campaign.businessName}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Nous sommes une entreprise innovante dédiée à faire la différence dans notre secteur. 
                      Avec une équipe passionnée et expérimentée, nous nous engageons à livrer des résultats 
                      exceptionnels pour nos investisseurs et notre communauté.
                    </p>
                  </div>
                )}
                
                {activeTab === 'photos' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Galerie photos</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="aspect-video rounded-lg overflow-hidden">
                          <img 
                            src={campaign.coverImage}
                            alt={`Photo ${i}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {activeTab === 'investments' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Liste des investissements ({campaign.investorCount})
                    </h3>
                    <div className="space-y-3">
                      {Array.from({ length: Math.min(campaign.investorCount, 10) }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                              {String.fromCharCode(65 + i)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Investisseur anonyme</p>
                              <p className="text-sm text-gray-600">
                                {new Date(Date.now() - Math.random() * 10000000000).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>
                          <p className="font-medium text-gray-900">
                            {new Intl.NumberFormat('fr-FR').format(50000 + Math.random() * 450000)} FCFA
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {activeTab === 'updates' && (
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Aucune mise à jour pour le moment</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Les nouvelles de la campagne apparaîtront ici
                    </p>
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
                  current={campaign.raisedAmount}
                  goal={campaign.goalAmount}
                  color={campaign.categoryColor}
                  showPercentage={false}
                  showLabels={false}
                />
                <div className="mt-3 space-y-1">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-900">
                      {new Intl.NumberFormat('fr-FR').format(campaign.raisedAmount)} FCFA
                    </span> collectés
                  </p>
                  <p className="text-sm text-gray-600">
                    sur {new Intl.NumberFormat('fr-FR').format(campaign.goalAmount)} FCFA
                  </p>
                </div>
              </div>
              
              {/* Statistiques */}
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Investisseurs</p>
                    <p className="font-medium text-gray-900">{campaign.investorCount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Jours restants</p>
                    <p className="font-medium text-gray-900">
                      {campaign.daysLeft > 0 ? campaign.daysLeft : 'Terminé'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Montant minimum</p>
                    <p className="font-medium text-gray-900">
                      {new Intl.NumberFormat('fr-FR').format(campaign.minInvestment)} FCFA
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Formulaire investissement */}
              {campaign.status === 'ACTIVE' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Montant à investir (FCFA)
                    </label>
                    <input
                      type="number"
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(e.target.value)}
                      min={campaign.minInvestment}
                      placeholder={String(campaign.minInvestment)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum : {new Intl.NumberFormat('fr-FR').format(campaign.minInvestment)} FCFA
                    </p>
                  </div>
                  
                  <button
                    onClick={handleInvest}
                    disabled={!investmentAmount || Number(investmentAmount) < campaign.minInvestment}
                    className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Investir maintenant
                  </button>
                  
                  <p className="text-xs text-gray-500 text-center">
                    Vérifiez votre niveau KYC avant d'investir
                  </p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-2">Campagne terminée</p>
                  <StatusBadge status={campaign.status as any} />
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
