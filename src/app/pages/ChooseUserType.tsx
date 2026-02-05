import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Building2, ArrowRight } from 'lucide-react';
import logoGalsen from '../images/logogalsen_invest.png';

export function ChooseUserType() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<'investor' | 'business' | null>(null);

  const handleContinue = () => {
    if (selectedType === 'investor') {
      navigate('/register/investor');
    } else if (selectedType === 'business') {
      navigate('/register/business');
    }
  };

  return (
    <div className="min-h-screen bg-galsen-white flex">
      {/* Partie gauche - Background Image (masquée sur mobile) */}
      <div
        className="hidden md:block md:w-1/2 bg-gradient-to-br from-galsen-green to-galsen-blue relative"
        style={{
          backgroundImage: `url(${logoGalsen})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-galsen-green/80 to-galsen-blue/80"></div>

        {/* Contenu */}
        <div className="relative h-full flex items-end p-8 md:p-12">
          <div className="text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Rejoignez GALSEN INVEST
            </h2>
            <p className="text-lg md:text-xl text-white/90">
              Que vous soyez investisseur ou entrepreneur, nous avons une solution pour vous
            </p>
          </div>
        </div>
      </div>

      {/* Partie droite - Choix du type */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-2xl">
          {/* Logo mobile */}
          <div className="md:hidden text-center mb-6">
            <img
              src={logoGalsen}
              alt="GALSEN INVEST"
              className="h-16 mx-auto mb-4"
            />
          </div>

          {/* En-tête */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-galsen-green mb-2">
              Choisissez votre profil
            </h1>
            <p className="text-galsen-blue/70 text-sm md:text-base">
              Sélectionnez le type de compte que vous souhaitez créer
            </p>
          </div>

          {/* Cartes de choix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8">
            {/* Carte Investisseur */}
            <div
              onClick={() => setSelectedType('investor')}
              className={`relative cursor-pointer rounded-2xl border-2 p-6 md:p-8 transition-all hover:scale-105 ${
                selectedType === 'investor'
                  ? 'border-galsen-gold bg-galsen-gold/5 shadow-xl shadow-galsen-gold/20'
                  : 'border-galsen-green/20 bg-white hover:border-galsen-gold/50'
              }`}
            >
              {/* Radio indicator */}
              <div className="absolute top-4 right-4">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedType === 'investor'
                      ? 'border-galsen-gold bg-galsen-gold'
                      : 'border-galsen-green/30'
                  }`}
                >
                  {selectedType === 'investor' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                  )}
                </div>
              </div>

              {/* Icône */}
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-galsen-gold/10">
                <TrendingUp className="w-8 h-8 text-galsen-gold" />
              </div>

              {/* Contenu */}
              <h3 className="text-xl font-bold text-galsen-blue mb-2">
                Investisseur
              </h3>
              <p className="text-sm text-galsen-blue/70 mb-4">
                Investissez dans des projets prometteurs et soutenez l'entrepreneuriat sénégalais
              </p>

              {/* Avantages */}
              <ul className="space-y-2 text-xs text-galsen-blue/80">
                <li className="flex items-start gap-2">
                  <span className="text-galsen-gold mt-0.5">✓</span>
                  <span>Accès à des opportunités d'investissement vérifiées</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-galsen-gold mt-0.5">✓</span>
                  <span>Diversifiez votre portefeuille</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-galsen-gold mt-0.5">✓</span>
                  <span>Suivez vos investissements en temps réel</span>
                </li>
              </ul>
            </div>

            {/* Carte Entreprise */}
            <div
              onClick={() => setSelectedType('business')}
              className={`relative cursor-pointer rounded-2xl border-2 p-6 md:p-8 transition-all hover:scale-105 ${
                selectedType === 'business'
                  ? 'border-galsen-green bg-galsen-green/5 shadow-xl shadow-galsen-green/20'
                  : 'border-galsen-green/20 bg-white hover:border-galsen-green/50'
              }`}
            >
              {/* Radio indicator */}
              <div className="absolute top-4 right-4">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedType === 'business'
                      ? 'border-galsen-green bg-galsen-green'
                      : 'border-galsen-green/30'
                  }`}
                >
                  {selectedType === 'business' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                  )}
                </div>
              </div>

              {/* Icône */}
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-galsen-green/10">
                <Building2 className="w-8 h-8 text-galsen-green" />
              </div>

              {/* Contenu */}
              <h3 className="text-xl font-bold text-galsen-blue mb-2">
                Entreprise
              </h3>
              <p className="text-sm text-galsen-blue/70 mb-4">
                Levez des fonds pour développer votre projet et faire grandir votre entreprise
              </p>

              {/* Avantages */}
              <ul className="space-y-2 text-xs text-galsen-blue/80">
                <li className="flex items-start gap-2">
                  <span className="text-galsen-green mt-0.5">✓</span>
                  <span>Créez et gérez vos campagnes de financement</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-galsen-green mt-0.5">✓</span>
                  <span>Accédez à une communauté d'investisseurs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-galsen-green mt-0.5">✓</span>
                  <span>Obtenez un accompagnement personnalisé</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bouton Continuer */}
          <button
            onClick={handleContinue}
            disabled={!selectedType}
            className={`w-full py-3 md:py-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
              selectedType
                ? 'bg-galsen-green hover:bg-galsen-green/90 text-white shadow-lg shadow-galsen-green/20'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Continuer
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Retour connexion */}
          <div className="text-center mt-6">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-galsen-blue/70 hover:text-galsen-green transition-colors"
            >
              ← Retour à la connexion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
