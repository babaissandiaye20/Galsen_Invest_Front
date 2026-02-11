import React from 'react';
import { Calendar, TrendingUp } from 'lucide-react'; // Replaced Users with TrendingUp since investorCount is missing
import { ProgressBar } from './ProgressBar';
import { Link } from 'react-router-dom';
import type { Campaign } from '../models';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';

interface CampaignCardProps {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  // Calcul du pourcentage (déjà fourni par l'API mais on peut le recalculer pour être sûr)
  const percentage = campaign.fundingPercentage || (campaign.raisedAmount / campaign.targetAmount) * 100;

  // Calcul des jours restants
  const calculateDaysLeft = (endDateStr: string) => {
    const end = new Date(endDateStr);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysLeft = calculateDaysLeft(campaign.endDate);

  // Génération de couleur déterministe pour la catégorie
  const getCategoryColor = (category: string) => {
    const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'];
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const categoryColor = getCategoryColor(campaign.categoryLibelle || 'Autre');

  return (
    <Link to={`/campaigns/${campaign.id}`} className="block h-full">
      <Card className="rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] h-full flex flex-col border-galsen-green/10 overflow-hidden">
        {/* Image de couverture - Placed directly as child for full width/custom height */}
        <div className="relative h-48 overflow-hidden bg-gray-100 shrink-0">
          {campaign.coverImageUrl ? (
            <img
              src={campaign.coverImageUrl}
              alt={campaign.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-sm">Pas d'image</span>
            </div>
          )}

          {/* Badge catégorie */}
          <div
            className="absolute top-3 left-3 px-3 py-1 rounded-full text-white text-xs font-medium shadow-md"
            style={{ backgroundColor: categoryColor }}
          >
            {campaign.categoryLibelle}
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
        <CardHeader className="p-4 md:p-5 pb-0 flex-none space-y-2">
          {/* Titre */}
          <CardTitle className="font-semibold text-base md:text-lg text-galsen-blue line-clamp-2 leading-tight">
            {campaign.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 md:p-5 pt-2 flex-1 flex flex-col gap-4">
          {/* Description */}
          <p className="text-galsen-blue/70 text-sm line-clamp-3 mb-auto">
            {campaign.description}
          </p>

          {/* Barre de progression */}
          <div className="mt-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-galsen-green">
                {percentage.toFixed(0)}% financé
              </span>
              <span className="text-sm text-galsen-blue/70">
                {new Intl.NumberFormat('fr-FR').format(campaign.targetAmount)} {campaign.devise}
              </span>
            </div>
            <ProgressBar
              current={campaign.raisedAmount}
              goal={campaign.targetAmount}
              color={categoryColor}
              showPercentage={false}
              showLabels={false}
            />
          </div>

          {/* Statistiques */}
          <div className="flex items-center justify-between text-sm text-galsen-blue/70">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>{new Intl.NumberFormat('fr-FR').format(campaign.raisedAmount)} collectés</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{daysLeft > 0 ? `${daysLeft} jours` : 'Terminé'}</span>
            </div>
          </div>
        </CardContent>

        {/* Footer */}
        <CardFooter className="p-4 md:p-5 pt-0 mt-auto border-t border-galsen-green/10 flex items-center justify-between bg-gray-50/50">
          {/* Business Name placeholder since it's not in the model yet */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-galsen-green/10 flex items-center justify-center text-galsen-green font-bold text-xs">
              Ent.
            </div>
            <span className="text-sm text-galsen-blue italic">Voir détails</span>
          </div>
          <button
            className="px-3 md:px-4 py-2 bg-galsen-gold hover:bg-galsen-gold/90 text-galsen-blue text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            disabled={campaign.status === 'CLOSED'}
          >
            {campaign.status === 'CLOSED' ? 'Terminé' : 'Investir'}
          </button>
        </CardFooter>
      </Card>
    </Link>
  );
}
