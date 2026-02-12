import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useProfileStore, useAuthStore } from '../store';
import { useShallow } from 'zustand/react/shallow';
import { Building2, Mail, Phone, MapPin, Calendar, Users, DollarSign, FileText, Globe, Edit2, Save, X, User } from 'lucide-react';

export function BusinessProfile() {
  const [isEditing, setIsEditing] = useState(false);
  
  const { businessProfile, fetchBusinessProfile, loading, error } = useProfileStore(
    useShallow((s) => ({
      businessProfile: s.businessProfile,
      fetchBusinessProfile: s.fetchBusinessProfile,
      loading: s.loading,
      error: s.error
    }))
  );

  const { token, isAuthenticated } = useAuthStore(
    useShallow((s) => ({ token: s.token, isAuthenticated: s.isAuthenticated }))
  );

  // Charger le profil au montage
  useEffect(() => {
    if (isAuthenticated && token) {
      const timer = setTimeout(() => {
        fetchBusinessProfile();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, token, fetchBusinessProfile]);

  // Afficher un loader pendant le chargement
  if (loading && !businessProfile) {
    return (
      <Layout userType="business">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Chargement de votre profil...</p>
        </div>
      </Layout>
    );
  }

  // Afficher une erreur si le profil n'a pas pu être chargé
  if (error && !businessProfile) {
    return (
      <Layout userType="business">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-2">Erreur de chargement du profil</p>
            <p className="text-gray-600 text-sm">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!businessProfile) {
    return (
      <Layout userType="business">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Aucun profil trouvé</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout userType="business">
      <div className="space-y-6">
        {/* En-tête du profil */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-galsen-green/10">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex items-center gap-4">
              {businessProfile.logoUrl ? (
                <img
                  src={businessProfile.logoUrl}
                  alt={businessProfile.companyName}
                  className="w-20 h-20 rounded-lg border-2 border-galsen-gold object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-lg border-2 border-galsen-gold bg-galsen-gold/10 flex items-center justify-center">
                  <Building2 className="w-10 h-10 text-galsen-gold" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-galsen-blue">{businessProfile.companyName}</h1>
                {businessProfile.tradeName && (
                  <p className="text-galsen-blue/70">{businessProfile.tradeName}</p>
                )}
                <p className="text-sm text-galsen-blue/60">{businessProfile.legalForm}</p>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 border border-galsen-green hover:bg-galsen-green/5 text-galsen-green rounded-lg transition-colors flex items-center gap-2"
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4" />
                  Annuler
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4" />
                  Modifier
                </>
              )}
            </button>
          </div>
        </div>

        {/* Informations de l'entreprise */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-galsen-green/10">
          <h2 className="text-xl font-bold text-galsen-blue mb-6 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-galsen-gold" />
            Informations de l'entreprise
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Nom de l'entreprise */}
            <div>
              <label className="block text-sm font-medium text-galsen-blue/70 mb-2">
                Nom de l'entreprise
              </label>
              <p className="text-galsen-blue font-medium">{businessProfile.companyName}</p>
            </div>

            {/* Nom commercial */}
            {businessProfile.tradeName && (
              <div>
                <label className="block text-sm font-medium text-galsen-blue/70 mb-2">
                  Nom commercial
                </label>
                <p className="text-galsen-blue font-medium">{businessProfile.tradeName}</p>
              </div>
            )}

            {/* Forme juridique */}
            <div>
              <label className="block text-sm font-medium text-galsen-blue/70 mb-2">
                Forme juridique
              </label>
              <p className="text-galsen-blue font-medium">{businessProfile.legalForm}</p>
            </div>

            {/* Secteur d'activité */}
            {businessProfile.sectorName && (
              <div>
                <label className="block text-sm font-medium text-galsen-blue/70 mb-2">
                  Secteur d'activité
                </label>
                <p className="text-galsen-blue font-medium">{businessProfile.sectorName}</p>
              </div>
            )}

            {/* Numéro d'enregistrement */}
            {businessProfile.registrationNumber && (
              <div>
                <label className="block text-sm font-medium text-galsen-blue/70 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  N° d'enregistrement
                </label>
                <p className="text-galsen-blue font-medium">{businessProfile.registrationNumber}</p>
              </div>
            )}

            {/* NINEA */}
            {businessProfile.taxId && (
              <div>
                <label className="block text-sm font-medium text-galsen-blue/70 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  NINEA
                </label>
                <p className="text-galsen-blue font-medium">{businessProfile.taxId}</p>
              </div>
            )}

            {/* Date de création */}
            {businessProfile.foundedDate && (
              <div>
                <label className="block text-sm font-medium text-galsen-blue/70 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date de création
                </label>
                <p className="text-galsen-blue font-medium">
                  {new Date(businessProfile.foundedDate).toLocaleDateString('fr-FR')}
                </p>
              </div>
            )}

            {/* Nombre d'employés */}
            {businessProfile.employeeCount && (
              <div>
                <label className="block text-sm font-medium text-galsen-blue/70 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Nombre d'employés
                </label>
                <p className="text-galsen-blue font-medium">{businessProfile.employeeCount}</p>
              </div>
            )}

            {/* Chiffre d'affaires */}
            {businessProfile.annualRevenue && (
              <div>
                <label className="block text-sm font-medium text-galsen-blue/70 mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Chiffre d'affaires annuel
                </label>
                <p className="text-galsen-blue font-medium">
                  {new Intl.NumberFormat('fr-FR').format(businessProfile.annualRevenue)} FCFA
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Contact et localisation */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-galsen-green/10">
          <h2 className="text-xl font-bold text-galsen-blue mb-6 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-galsen-gold" />
            Contact et localisation
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-galsen-blue/70 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <p className="text-galsen-blue font-medium">{businessProfile.user?.email || 'N/A'}</p>
            </div>

            {/* Téléphone */}
            {businessProfile.phoneNumber && (
              <div>
                <label className="block text-sm font-medium text-galsen-blue/70 mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Téléphone
                </label>
                <p className="text-galsen-blue font-medium">{businessProfile.phoneNumber}</p>
              </div>
            )}

            {/* Site web */}
            {businessProfile.websiteUrl && (
              <div>
                <label className="block text-sm font-medium text-galsen-blue/70 mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Site web
                </label>
                <a
                  href={businessProfile.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-galsen-green hover:underline font-medium"
                >
                  {businessProfile.websiteUrl}
                </a>
              </div>
            )}

            {/* Pays */}
            {businessProfile.countryName && (
              <div>
                <label className="block text-sm font-medium text-galsen-blue/70 mb-2">
                  Pays
                </label>
                <p className="text-galsen-blue font-medium">{businessProfile.countryName}</p>
              </div>
            )}

            {/* Ville */}
            {businessProfile.city && (
              <div>
                <label className="block text-sm font-medium text-galsen-blue/70 mb-2">
                  Ville
                </label>
                <p className="text-galsen-blue font-medium">{businessProfile.city}</p>
              </div>
            )}

            {/* Adresse */}
            {businessProfile.address && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-galsen-blue/70 mb-2">
                  Adresse
                </label>
                <p className="text-galsen-blue font-medium">{businessProfile.address}</p>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {businessProfile.description && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-galsen-green/10">
            <h2 className="text-xl font-bold text-galsen-blue mb-4">À propos</h2>
            <p className="text-galsen-blue/80 whitespace-pre-line">{businessProfile.description}</p>
          </div>
        )}

        {/* Représentant légal */}
        {(businessProfile.representativeName || businessProfile.representativeTitle) && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-galsen-green/10">
            <h2 className="text-xl font-bold text-galsen-blue mb-6 flex items-center gap-2">
              <User className="w-6 h-6 text-galsen-gold" />
              Représentant légal
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {businessProfile.representativeName && (
                <div>
                  <label className="block text-sm font-medium text-galsen-blue/70 mb-2">
                    Nom
                  </label>
                  <p className="text-galsen-blue font-medium">{businessProfile.representativeName}</p>
                </div>
              )}

              {businessProfile.representativeTitle && (
                <div>
                  <label className="block text-sm font-medium text-galsen-blue/70 mb-2">
                    Fonction
                  </label>
                  <p className="text-galsen-blue font-medium">{businessProfile.representativeTitle}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Statistiques de financement */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-galsen-green/10">
          <h2 className="text-xl font-bold text-galsen-blue mb-6">Statistiques de financement</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-galsen-gold/5 rounded-lg">
              <p className="text-sm text-galsen-blue/70 mb-2">Campagnes actives</p>
              <p className="text-3xl font-bold text-galsen-gold">{businessProfile.activeCampaigns || 0}</p>
            </div>

            <div className="text-center p-4 bg-galsen-green/5 rounded-lg">
              <p className="text-sm text-galsen-blue/70 mb-2">Total collecté</p>
              <p className="text-3xl font-bold text-galsen-green">
                {new Intl.NumberFormat('fr-FR', { notation: 'compact', maximumFractionDigits: 1 }).format(businessProfile.totalRaised || 0)}
              </p>
              <p className="text-xs text-galsen-blue/60 mt-1">FCFA</p>
            </div>

            <div className="text-center p-4 bg-galsen-blue/5 rounded-lg">
              <p className="text-sm text-galsen-blue/70 mb-2">Investisseurs</p>
              <p className="text-3xl font-bold text-galsen-blue">{businessProfile.investorCount || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
