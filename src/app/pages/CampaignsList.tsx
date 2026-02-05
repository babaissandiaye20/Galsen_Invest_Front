import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { CampaignCard } from '../components/CampaignCard';
import { mockCampaigns, mockCategories } from '../data/mockData';
import { Search, Filter, X } from 'lucide-react';

export function CampaignsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState(['ACTIVE']);
  const [sortBy, setSortBy] = useState('recent');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filtrage des campagnes
  let filteredCampaigns = mockCampaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || campaign.category === selectedCategory;
    const matchesStatus = selectedStatus.includes(campaign.status);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Tri des campagnes
  filteredCampaigns = [...filteredCampaigns].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      case 'ending':
        return a.daysLeft - b.daysLeft;
      case 'funded':
        return (b.raisedAmount / b.goalAmount) - (a.raisedAmount / a.goalAmount);
      default:
        return 0;
    }
  });

  const handleStatusToggle = (status: string) => {
    if (selectedStatus.includes(status)) {
      setSelectedStatus(selectedStatus.filter(s => s !== status));
    } else {
      setSelectedStatus([...selectedStatus, status]);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedStatus(['ACTIVE']);
    setSortBy('recent');
    setShowMobileFilters(false);
  };

  const FiltersContent = () => (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-galsen-green" />
          <h2 className="font-semibold text-galsen-blue">Filtres</h2>
        </div>
        <button
          onClick={() => setShowMobileFilters(false)}
          className="lg:hidden p-2 text-galsen-blue hover:bg-galsen-green/10 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Recherche */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-galsen-blue mb-2">
          Recherche
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-galsen-green" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2 border border-galsen-green/30 rounded-lg text-sm focus:ring-2 focus:ring-galsen-green focus:border-galsen-green"
          />
        </div>
      </div>

      {/* Catégorie */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-galsen-blue mb-2">
          Catégorie
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-3 py-2 border border-galsen-green/30 rounded-lg text-sm focus:ring-2 focus:ring-galsen-green focus:border-galsen-green"
        >
          <option value="all">Toutes les catégories</option>
          {mockCategories.map(cat => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Statut */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-galsen-blue mb-3">
          Statut
        </label>
        <div className="space-y-2">
          {['ACTIVE', 'APPROVED', 'CLOSED'].map(status => (
            <label key={status} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedStatus.includes(status)}
                onChange={() => handleStatusToggle(status)}
                className="w-4 h-4 text-galsen-green rounded focus:ring-galsen-green accent-galsen-green"
              />
              <span className="text-sm text-galsen-blue">
                {status === 'ACTIVE' ? 'Actif' : status === 'APPROVED' ? 'Approuvé' : 'Terminé'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Réinitialiser */}
      <button
        onClick={resetFilters}
        className="w-full px-4 py-2 text-sm text-galsen-blue hover:bg-galsen-green/10 rounded-lg transition-colors border border-galsen-green/20"
      >
        Réinitialiser les filtres
      </button>
    </>
  );

  return (
    <Layout userType="investor">
      <div>
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-galsen-blue mb-2">Campagnes de financement</h1>
          <p className="text-galsen-blue/70 text-sm md:text-base">Découvrez et soutenez les projets qui vous inspirent</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar de filtres - Desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8 border border-galsen-green/10">
              <FiltersContent />
            </div>
          </div>

          {/* Bouton filtres mobile */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setShowMobileFilters(true)}
              className="w-full px-4 py-3 bg-galsen-green text-white rounded-lg flex items-center justify-center gap-2 font-medium shadow-md"
            >
              <Filter className="w-5 h-5" />
              Filtres
            </button>
          </div>

          {/* Modal filtres mobile */}
          {showMobileFilters && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black/50 flex items-end">
              <div className="bg-white w-full rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
                <FiltersContent />
              </div>
            </div>
          )}

          {/* Grille de campagnes */}
          <div className="lg:col-span-3">
            {/* Header avec tri */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <p className="text-galsen-blue/70 text-sm md:text-base">
                <span className="font-medium text-galsen-blue">{filteredCampaigns.length}</span> campagne(s) trouvée(s)
              </p>
              <div className="flex items-center gap-2">
                <label className="text-sm text-galsen-blue">Trier par:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-galsen-green/30 rounded-lg text-sm focus:ring-2 focus:ring-galsen-green focus:border-galsen-green"
                >
                  <option value="recent">Plus récentes</option>
                  <option value="ending">Bientôt terminées</option>
                  <option value="funded">Plus financées</option>
                </select>
              </div>
            </div>

            {/* Grille */}
            {filteredCampaigns.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {filteredCampaigns.map(campaign => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 text-center border border-galsen-green/10">
                <p className="text-galsen-blue mb-2">Aucune campagne trouvée</p>
                <p className="text-sm text-galsen-blue/60">Essayez de modifier vos critères de recherche</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
