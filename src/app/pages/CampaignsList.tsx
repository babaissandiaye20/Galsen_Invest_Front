import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { CampaignCard } from '../components/CampaignCard';
import { Search, Filter, X } from 'lucide-react';
import { useCampaignStore, useCategoryStore } from '../store';
import { useShallow } from 'zustand/react/shallow';
// import { mockCategories } from '../data/mockData'; // Removed mock data

export function CampaignsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<string[]>(['APPROVED']); // Default showing approved/active
  const [sortBy, setSortBy] = useState('recent');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Stores
  const { campaigns, loading: campaignsLoading, error: campaignsError, fetchApproved, search, fetchByCategory, fetchAll } = useCampaignStore(
    useShallow((s) => ({
      campaigns: s.campaigns,
      loading: s.loading,
      error: s.error,
      fetchApproved: s.fetchApproved,
      search: s.search,
      fetchByCategory: s.fetchByCategory,
      fetchAll: s.fetchAll
    }))
  );

  const { categories, fetchAll: fetchCategories } = useCategoryStore(
    useShallow((s) => ({ categories: s.categories, fetchAll: s.fetchAll }))
  );

  // Initial fetch
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Re-fetch quand la catégorie sélectionnée change (filtrage côté serveur)
  useEffect(() => {
    if (selectedCategory === 'all') {
      fetchApproved();
    } else {
      fetchApproved({ categoryId: selectedCategory });
    }
  }, [selectedCategory, fetchApproved]);

  // Handle Search and Filter Logic
  // Note: The API supports server-side search and category filtering.
  // For simplicity combined with mixed filters (status, sort) which might not be all supported by one API call,
  // we can fetch a base set and filter client-side OR trigger specific API calls.
  // Given the requirement to replace mock data, let's try to leverage the store's fetched data and filter client-side
  // for smoother UI if the dataset isn't huge, OR trigger API calls.
  // Let's rely on client-side filtering of the `campaigns` list currently in store
  // but trigger API search when searchTerm changes significantly.

  // Activating API search on debounce could be better, but for now let's filter the *displayed* list
  // based on the store's `campaigns` which we populated with `fetchApproved`.

  // Filter logic
  let filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = searchTerm === '' ||
      campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    // Le filtre par catégorie est désormais côté serveur (via ?categoryId=)
    const matchesStatus = selectedStatus.length === 0 || selectedStatus.includes(campaign.status);

    return matchesSearch && matchesStatus;
  });

  // Sort logic
  filteredCampaigns = [...filteredCampaigns].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      case 'ending':
        // Calculate days left
        const getDays = (date: string) => Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return getDays(a.endDate) - getDays(b.endDate);
      case 'funded':
        return (b.raisedAmount / b.targetAmount) - (a.raisedAmount / a.targetAmount);
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
    setSelectedCategory('all'); // Déclenche le useEffect → fetchApproved() sans categoryId
    setSelectedStatus(['APPROVED']);
    setSortBy('recent');
    setShowMobileFilters(false);
  };

  const filtersJsx = (
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
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.libelle}</option>
          ))}
        </select>
      </div>

      {/* Statut */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-galsen-blue mb-3">
          Statut
        </label>
        <div className="space-y-2">
          {['APPROVED', 'FUNDED', 'CLOSED'].map(status => (
            <label key={status} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedStatus.includes(status)}
                onChange={() => handleStatusToggle(status)}
                className="w-4 h-4 text-galsen-green rounded focus:ring-galsen-green accent-galsen-green"
              />
              <span className="text-sm text-galsen-blue">
                {status === 'APPROVED' ? 'En cours' : status === 'FUNDED' ? 'Financé' : 'Terminé'}
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

        {campaignsError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 text-sm rounded-lg">
            {campaignsError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar de filtres - Desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8 border border-galsen-green/10">
              {filtersJsx}
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
                {filtersJsx}
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
            {campaignsLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="w-12 h-12 border-4 border-galsen-green border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredCampaigns.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {filteredCampaigns.map(campaign => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 text-center border border-galsen-green/10">
                <p className="text-galsen-blue mb-2">Aucune campagne trouvée</p>
                <p className="text-sm text-galsen-blue/60">Essayez de modifier vos critères de recherche</p>
                <button
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 bg-galsen-green hover:bg-galsen-green/90 text-white rounded-lg text-sm transition-colors"
                >
                  Effacer les filtres
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
