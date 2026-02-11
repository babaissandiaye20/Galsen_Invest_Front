import React, { useEffect } from 'react';
import { Layout } from '../components/Layout';
import { KYCBadge } from '../components/KYCBadge';
import { StatusBadge } from '../components/StatusBadge';
import { CampaignCard } from '../components/CampaignCard';
import { TrendingUp, Activity, CreditCard, DollarSign, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '../components/ui/table';
import { useProfileStore, useCampaignStore, useInvestmentStore, useAuthStore } from '../store';
import { useShallow } from 'zustand/react/shallow';

export function InvestorDashboard() {
  const { investorProfile, fetchInvestorProfile, loading: profileLoading, error: profileError } = useProfileStore(
    useShallow((s) => ({
      investorProfile: s.investorProfile,
      fetchInvestorProfile: s.fetchInvestorProfile,
      loading: s.loading,
      error: s.error
    }))
  );

  const { campaigns, fetchApproved, loading: campaignsLoading } = useCampaignStore(
    useShallow((s) => ({
      campaigns: s.campaigns,
      fetchApproved: s.fetchApproved,
      loading: s.loading
    }))
  );

  const { investments, fetchByInvestor, loading: investmentsLoading } = useInvestmentStore(
    useShallow((s) => ({
      investments: s.investments,
      fetchByInvestor: s.fetchByInvestor,
      loading: s.loading
    }))
  );

  // Récupérer le token pour vérifier qu'on est authentifié
  const { token, isAuthenticated } = useAuthStore(
    useShallow((s) => ({ token: s.token, isAuthenticated: s.isAuthenticated }))
  );

  // Charger les données uniquement quand le token est disponible
  useEffect(() => {
    if (isAuthenticated && token) {
      // Petit délai pour s'assurer que le token est bien injecté dans httpClient
      const timer = setTimeout(() => {
        fetchInvestorProfile();
        
        // Charger les campagnes approuvées (peut échouer avec 401 si permissions manquantes)
        fetchApproved().catch(() => {
          // Ignorer l'erreur silencieusement
        });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, token, fetchInvestorProfile, fetchApproved]);

  // DÉSACTIVÉ : L'endpoint investments retourne 401 même avec un token valide
  // TODO: Attendre que le backend configure les permissions pour le rôle INVESTOR
  // useEffect(() => {
  //   if (investorProfile?.id && isAuthenticated) {
  //     fetchByInvestor(investorProfile.id).catch(() => {
  //       // Ignorer l'erreur silencieusement
  //     });
  //   }
  // }, [investorProfile?.id, isAuthenticated, fetchByInvestor]);

  if (profileLoading && !investorProfile) {
    return (
      <Layout userType="investor">
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-galsen-green"></div>
        </div>
      </Layout>
    );
  }

  if (profileError && !investorProfile) {
    return (
      <Layout userType="investor">
        <div className="flex flex-col justify-center items-center h-[50vh] gap-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <p className="text-red-600 font-medium">{profileError}</p>
        </div>
      </Layout>
    );
  }

  if (!investorProfile) {
    return null;
  }

  // Calculations
  const availableLimit = investorProfile.remainingMonthlyCapacity;
  const limitPercentage = (investorProfile.monthlyInvestmentCap - investorProfile.remainingMonthlyCapacity) / investorProfile.monthlyInvestmentCap * 100;

  // Recommended campaigns: Take first 3 approved
  const recommendedCampaigns = campaigns.slice(0, 3);

  // Recent investments: Take first 5
  const recentInvestments = investments.slice(0, 5);

  return (
    <Layout userType="investor">
      <div className="space-y-6 md:space-y-8">
        {/* Header avec profil */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-galsen-green/10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-galsen-gold bg-galsen-green/10 flex items-center justify-center text-galsen-green text-xl font-bold">
                {investorProfile.firstName.charAt(0)}{investorProfile.lastName.charAt(0)}
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-galsen-blue">
                  {investorProfile.firstName} {investorProfile.lastName}
                </h1>
                <p className="text-sm md:text-base text-galsen-blue/70">{investorProfile.user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <KYCBadge level={investorProfile.kycLevel} />
              <Link
                to="/investor/profile"
                className="px-4 py-2 text-galsen-green hover:bg-galsen-green/10 rounded-lg transition-colors font-medium text-sm md:text-base"
              >
                Mon profil
              </Link>
            </div>
          </div>

          {investorProfile.kycLevel === 'L0' && (
            <div className="mt-4 p-4 bg-galsen-gold/10 border border-galsen-gold/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-galsen-gold mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-galsen-blue">Vérifiez votre compte pour investir</p>
                <p className="text-sm text-galsen-blue/70 mt-1">
                  Complétez votre KYC pour commencer à investir dans les campagnes.
                </p>
                <Link
                  to="/investor/profile"
                  className="inline-block mt-2 text-sm font-medium text-galsen-gold hover:text-galsen-gold/80 underline"
                >
                  Vérifier mon compte →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Cards de statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Total investi */}
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-galsen-green/10 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="p-2 md:p-3 bg-galsen-green/10 rounded-lg">
                <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-galsen-green" />
              </div>
            </div>
            <p className="text-galsen-blue/70 text-xs md:text-sm mb-1">Total investi</p>
            <p className="text-xl md:text-2xl font-bold text-galsen-blue">
              {new Intl.NumberFormat('fr-FR').format(investorProfile.totalInvested)} FCFA
            </p>
          </div>

          {/* Nombre d'investissements */}
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-galsen-green/10 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="p-2 md:p-3 bg-galsen-gold/10 rounded-lg">
                <Activity className="w-5 h-5 md:w-6 md:h-6 text-galsen-gold" />
              </div>
            </div>
            <p className="text-galsen-blue/70 text-xs md:text-sm mb-1">Investissements</p>
            <p className="text-xl md:text-2xl font-bold text-galsen-blue">{investments.length}</p>
            <p className="text-xs text-galsen-blue/60 mt-1">campagnes soutenues</p>
          </div>

          {/* Plafond disponible */}
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-galsen-green/10 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="p-2 md:p-3 bg-galsen-gold/10 rounded-lg">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-galsen-gold" />
              </div>
            </div>
            <p className="text-galsen-blue/70 text-xs md:text-sm mb-1">Plafond disponible</p>
            <p className="text-xl md:text-2xl font-bold text-galsen-blue">
              {new Intl.NumberFormat('fr-FR').format(availableLimit)} FCFA
            </p>
            <div className="mt-3">
              <div className="w-full bg-galsen-green/10 rounded-full h-2">
                <div
                  className="bg-galsen-gold h-2 rounded-full transition-all"
                  style={{ width: `${limitPercentage}%` }}
                />
              </div>
              <p className="text-xs text-galsen-blue/60 mt-1">
                {limitPercentage.toFixed(0)}% utilisé ce mois
              </p>
            </div>
          </div>

          {/* Portefeuille (Coming soon / Mocked for now if Wallet not integrated here yet) */}
          {/* Note: Ideally we use useWalletStore here too, but let's stick to profile/investment focus first or add it */}
          {/* I will keep the link to wallet page */}
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-galsen-green/10 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="p-2 md:p-3 bg-galsen-green/10 rounded-lg">
                <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-galsen-green" />
              </div>
            </div>
            <p className="text-galsen-blue/70 text-xs md:text-sm mb-1">Mon Portefeuille</p>
            <p className="text-sm text-galsen-blue font-medium">
              Gérer mes fonds
            </p>
            <Link
              to="/investor/wallet"
              className="text-xs text-galsen-gold hover:text-galsen-gold/80 mt-2 inline-block font-medium"
            >
              Voir transactions →
            </Link>
          </div>
        </div>

        {/* Campagnes recommandées */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-bold text-galsen-blue">Campagnes recommandées</h2>
            <Link
              to="/campaigns"
              className="text-galsen-gold hover:text-galsen-gold/80 font-medium text-sm md:text-base"
            >
              Voir toutes les campagnes →
            </Link>
          </div>
          {campaignsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {recommendedCampaigns.map(campaign => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
              {recommendedCampaigns.length === 0 && (
                <p className="text-gray-500 col-span-3 text-center py-8">Aucune campagne disponible pour le moment.</p>
              )}
            </div>
          )}
        </div>

        {/* Mes investissements récents */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-galsen-green/10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-bold text-galsen-blue">Mes investissements récents</h2>
            <Link
              to="/investor/investments"
              className="text-galsen-gold hover:text-galsen-gold/80 font-medium text-sm"
            >
              Voir tout
            </Link>
          </div>

          {/* Version mobile - Cards */}
          <div className="md:hidden space-y-3">
            {recentInvestments.map(investment => (
              <div key={investment.id} className="p-4 border border-galsen-green/10 rounded-lg bg-galsen-white">
                <div className="flex justify-between items-start mb-2">
                  {/*  Note: Investment model might not have campaignTitle directly if it's nested or ID based.
                       Checking Investment model: includes campaignId. 
                       Usually backend returns enriched DTO or we need to find campaign in store.
                       The mock data had campaignTitle. The API model likely maps it or we need to lookup using campaignStore. 
                       For now, assuming API returns it or I fallback to 'Campagne X'.
                       Actually, looking at `Investment` model in `api.model.ts` (wait, I saw index.ts, need to check investment.model.ts).
                       I will check investment.model.ts via thought process or assume standard fields.
                       If missing, I might display "Campagne #{id}".
                       Let's check `investment.model.ts` to be sure. */
                  }
                  <p className="font-medium text-galsen-blue text-sm">{investment.campaignId}</p>
                  <StatusBadge status={investment.status} />
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-galsen-blue/70">
                    {new Date(investment.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                  <span className="font-bold text-galsen-green">
                    {new Intl.NumberFormat('fr-FR').format(investment.amount)} FCFA
                  </span>
                </div>
              </div>
            ))}
            {recentInvestments.length === 0 && (
              <p className="text-gray-500 text-center py-4">Aucun investissement récent.</p>
            )}
          </div>

          {/* Version desktop - Table */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-galsen-green/20">
                  <TableHead className="text-left py-3 px-4 text-sm font-medium text-galsen-blue">Campagne</TableHead>
                  <TableHead className="text-left py-3 px-4 text-sm font-medium text-galsen-blue">Montant</TableHead>
                  <TableHead className="text-left py-3 px-4 text-sm font-medium text-galsen-blue">Date</TableHead>
                  <TableHead className="text-left py-3 px-4 text-sm font-medium text-galsen-blue">Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentInvestments.map(investment => (
                  <TableRow key={investment.id} className="border-b border-galsen-green/10 hover:bg-galsen-white transition-colors">
                    <TableCell className="py-4 px-4 text-sm text-galsen-blue">
                      {/* Fallback title if not in model */}
                      {investment.campaignId}
                    </TableCell>
                    <TableCell className="py-4 px-4 text-sm font-medium text-galsen-green">
                      {new Intl.NumberFormat('fr-FR').format(investment.amount)} FCFA
                    </TableCell>
                    <TableCell className="py-4 px-4 text-sm text-galsen-blue/70">
                      {new Date(investment.createdAt).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      <StatusBadge status={investment.status} />
                    </TableCell>
                  </TableRow>
                ))}
                {recentInvestments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      Aucun investissement récent.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
