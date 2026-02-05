import React from 'react';
import { Layout } from '../components/Layout';
import { KYCBadge } from '../components/KYCBadge';
import { StatusBadge } from '../components/StatusBadge';
import { CampaignCard } from '../components/CampaignCard';
import { mockInvestorProfile, mockCampaigns, mockInvestments } from '../data/mockData';
import { TrendingUp, Activity, CreditCard, DollarSign, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function InvestorDashboard() {
  const profile = mockInvestorProfile;
  const recommendedCampaigns = mockCampaigns.filter(c => c.status === 'ACTIVE').slice(0, 3);
  const recentInvestments = mockInvestments.slice(0, 5);

  const availableLimit = profile.monthlyLimit - profile.monthlyUsed;
  const limitPercentage = (profile.monthlyUsed / profile.monthlyLimit) * 100;

  return (
    <Layout userType="investor">
      <div className="space-y-6 md:space-y-8">
        {/* Header avec profil */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-galsen-green/10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3 md:gap-4">
              <img
                src={profile.avatar}
                alt={`${profile.firstName} ${profile.lastName}`}
                className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-galsen-gold"
              />
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-galsen-blue">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className="text-sm md:text-base text-galsen-blue/70">{profile.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <KYCBadge level={profile.kycLevel as any} />
              <Link
                to="/investor/profile"
                className="px-4 py-2 text-galsen-green hover:bg-galsen-green/10 rounded-lg transition-colors font-medium text-sm md:text-base"
              >
                Mon profil
              </Link>
            </div>
          </div>

          {profile.kycLevel === 'L0' && (
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
              {new Intl.NumberFormat('fr-FR').format(profile.totalInvested)} FCFA
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
            <p className="text-xl md:text-2xl font-bold text-galsen-blue">{profile.investmentCount}</p>
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

          {/* Portefeuille */}
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-galsen-green/10 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="p-2 md:p-3 bg-galsen-green/10 rounded-lg">
                <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-galsen-green" />
              </div>
            </div>
            <p className="text-galsen-blue/70 text-xs md:text-sm mb-1">Solde portefeuille</p>
            <p className="text-xl md:text-2xl font-bold text-galsen-blue">
              {new Intl.NumberFormat('fr-FR').format(profile.walletBalance)} FCFA
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {recommendedCampaigns.map(campaign => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
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
                  <p className="font-medium text-galsen-blue text-sm">{investment.campaignTitle}</p>
                  <StatusBadge status={investment.status as any} />
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-galsen-blue/70">
                    {new Date(investment.date).toLocaleDateString('fr-FR')}
                  </span>
                  <span className="font-bold text-galsen-green">
                    {new Intl.NumberFormat('fr-FR').format(investment.amount)} FCFA
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Version desktop - Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-galsen-green/20">
                  <th className="text-left py-3 px-4 text-sm font-medium text-galsen-blue">Campagne</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-galsen-blue">Montant</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-galsen-blue">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-galsen-blue">Statut</th>
                </tr>
              </thead>
              <tbody>
                {recentInvestments.map(investment => (
                  <tr key={investment.id} className="border-b border-galsen-green/10 hover:bg-galsen-white transition-colors">
                    <td className="py-4 px-4 text-sm text-galsen-blue">{investment.campaignTitle}</td>
                    <td className="py-4 px-4 text-sm font-medium text-galsen-green">
                      {new Intl.NumberFormat('fr-FR').format(investment.amount)} FCFA
                    </td>
                    <td className="py-4 px-4 text-sm text-galsen-blue/70">
                      {new Date(investment.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={investment.status as any} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
