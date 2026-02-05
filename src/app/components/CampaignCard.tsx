import React from 'react';
import { Users, Calendar } from 'lucide-react';
import { ProgressBar } from './ProgressBar';
import { Link } from 'react-router-dom';

interface Campaign {
  id: string;
  title: string;
  shortDescription: string;
  category: string;
  categoryColor: string;
  goalAmount: number;
  raisedAmount: number;
  investorCount: number;
  daysLeft: number;
  status: string;
  coverImage: string;
  businessName: string;
  businessLogo: string;
}

interface CampaignCardProps {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const percentage = (campaign.raisedAmount / campaign.goalAmount) * 100;

  return (
    <Link to={`/campaigns/${campaign.id}`}>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] h-full flex flex-col border border-galsen-green/10">
        {/* Image de couverture */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={campaign.coverImage}
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
          {/* Badge catégorie */}
          <div
            className="absolute top-3 left-3 px-3 py-1 rounded-full text-white text-xs font-medium shadow-md"
            style={{ backgroundColor: campaign.categoryColor }}
          >
            {campaign.category}
          </div>
          {campaign.status === 'CLOSED' && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
              <span className="bg-white px-4 py-2 rounded-lg font-medium text-galsen-blue shadow-lg">
                Campagne terminée
              </span>
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="p-4 md:p-5 flex-1 flex flex-col">
          {/* Titre */}
          <h3 className="font-semibold text-base md:text-lg text-galsen-blue mb-2 line-clamp-2">
            {campaign.title}
          </h3>

          {/* Description */}
          <p className="text-galsen-blue/70 text-sm mb-4 line-clamp-3 flex-1">
            {campaign.shortDescription}
          </p>

          {/* Barre de progression */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-galsen-green">
                {percentage.toFixed(0)}% financé
              </span>
              <span className="text-sm text-galsen-blue/70">
                {new Intl.NumberFormat('fr-FR').format(campaign.goalAmount)} FCFA
              </span>
            </div>
            <ProgressBar
              current={campaign.raisedAmount}
              goal={campaign.goalAmount}
              color={campaign.categoryColor}
              showPercentage={false}
              showLabels={false}
            />
          </div>

          {/* Statistiques */}
          <div className="flex items-center justify-between text-sm text-galsen-blue/70 mb-4">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{campaign.investorCount} investisseurs</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{campaign.daysLeft > 0 ? `${campaign.daysLeft} jours` : 'Terminé'}</span>
            </div>
          </div>

          {/* Footer avec logo entreprise */}
          <div className="flex items-center justify-between pt-4 border-t border-galsen-green/10">
            <div className="flex items-center gap-2">
              <img
                src={campaign.businessLogo}
                alt={campaign.businessName}
                className="w-8 h-8 rounded-full border border-galsen-green/20"
              />
              <span className="text-sm text-galsen-blue">{campaign.businessName}</span>
            </div>
            <button
              className="px-3 md:px-4 py-2 bg-galsen-gold hover:bg-galsen-gold/90 text-galsen-blue text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              disabled={campaign.status === 'CLOSED'}
            >
              {campaign.status === 'CLOSED' ? 'Terminé' : 'Investir'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
