import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { KYCBadge } from '../components/KYCBadge';
import { StatusBadge } from '../components/StatusBadge';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useProfileStore, useKycStore, useReferenceStore } from '../store';
import { useShallow } from 'zustand/react/shallow';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '../components/ui/table';
import { KycDocumentType } from '../models';

export function InvestorProfile() {
  const [activeTab, setActiveTab] = useState<'info' | 'kyc' | 'security'>('info');

  const { investorProfile, fetchInvestorProfile, updateInvestorProfile, loading: profileLoading, error: profileError } = useProfileStore(
    useShallow(s => ({
      investorProfile: s.investorProfile,
      fetchInvestorProfile: s.fetchInvestorProfile,
      updateInvestorProfile: s.updateInvestorProfile,
      loading: s.loading,
      error: s.error
    }))
  );

  const { documents, fetchMyDocuments, uploadDocument, loading: kycLoading, error: kycError } = useKycStore(
    useShallow(s => ({
      documents: s.documents,
      fetchMyDocuments: s.fetchMyDocuments,
      uploadDocument: s.uploadDocument,
      loading: s.loading,
      error: s.error
    }))
  );

  const { countries, fetchCountries } = useReferenceStore(
    useShallow(s => ({
      countries: s.countries,
      fetchCountries: s.fetchCountries
    }))
  );

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    city: '',
    address: '',
    occupation: '',
    incomeBracket: 'LOW',
    nationalityId: '',
    residenceCountryId: '',
    bio: ''
  });

  useEffect(() => {
    fetchInvestorProfile();
    fetchMyDocuments();
    fetchCountries();
  }, [fetchInvestorProfile, fetchMyDocuments, fetchCountries]);

  useEffect(() => {
    if (investorProfile) {
      setFormData({
        firstName: investorProfile.firstName || '',
        lastName: investorProfile.lastName || '',
        phone: investorProfile.user.phone || '',
        city: investorProfile.city || '',
        address: investorProfile.address || '',
        occupation: investorProfile.occupation || '',
        incomeBracket: investorProfile.incomeBracket || 'LOW',
        nationalityId: '', // To be matched with countries if we had the ID in profile (profile has names)
        residenceCountryId: '',
        bio: investorProfile.bio || ''
      });
    }
  }, [investorProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await updateInvestorProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        city: formData.city,
        address: formData.address,
        occupation: formData.occupation,
        incomeBracket: formData.incomeBracket as any,
        bio: formData.bio
      });
      alert('Profil mis à jour avec succès !');
    } catch {
      // Error displayed via profileError
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !investorProfile) return;

    const docType: KycDocumentType = 'ID_CARD_FRONT';
    try {
      await uploadDocument(investorProfile.id, docType, file);
      alert('Document uploadé avec succès !');
    } catch {
      // Error displayed via kycError
    }
  };

  if (profileLoading && !investorProfile) {
    return (
      <Layout userType="investor">
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-galsen-green"></div>
        </div>
      </Layout>
    );
  }

  if (!investorProfile) return null;

  const kycLevels = [
    {
      level: 'L0',
      label: 'Non vérifié',
      limit: '0 FCFA/mois',
      requirements: ['Aucun document requis'],
      current: investorProfile.kycLevel === 'L0'
    },
    {
      level: 'L1',
      label: 'Basique',
      limit: '500 000 FCFA/mois',
      requirements: ['CNI ou Passeport'],
      current: investorProfile.kycLevel === 'L1'
    },
    {
      level: 'L2',
      label: 'Complet',
      limit: '5 000 000 FCFA/mois',
      requirements: ['CNI ou Passeport', 'Justificatif de domicile', 'Justificatif de revenus', 'Selfie avec CNI'],
      current: investorProfile.kycLevel === 'L2'
    }
  ];

  return (
    <Layout userType="investor">
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon Profil</h1>
          <p className="text-gray-600">Gérez vos informations personnelles et votre vérification KYC</p>
        </div>

        {(profileError || kycError) && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 text-sm rounded-lg">
            {profileError || kycError}
          </div>
        )}

        {/* Onglets */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-6 py-4 font-medium transition-colors ${activeTab === 'info'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                Informations personnelles
              </button>
              <button
                onClick={() => setActiveTab('kyc')}
                className={`px-6 py-4 font-medium transition-colors ${activeTab === 'kyc'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                Vérification KYC
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`px-6 py-4 font-medium transition-colors ${activeTab === 'security'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                Sécurité
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Onglet Informations personnelles */}
            {activeTab === 'info' && (
              <div className="max-w-2xl">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={investorProfile.user.email}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      readOnly // Phone often read-only or requires verify
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Profession</label>
                    <input
                      type="text"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tranche de revenus</label>
                    <select
                      name="incomeBracket"
                      value={formData.incomeBracket}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="LOW">Moins de 2 000 000 FCFA</option>
                      <option value="MID">2 000 000 - 10 000 000 FCFA</option>
                      <option value="HIGH">Plus de 10 000 000 FCFA</option>
                      <option value="VERY_HIGH">Très hauts revenus</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={profileLoading}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {profileLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                  </button>
                </div>
              </div>
            )}

            {/* Onglet Vérification KYC */}
            {activeTab === 'kyc' && (
              <div>
                {/* Niveau actuel */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Niveau KYC actuel</h3>
                    <KYCBadge level={investorProfile.kycLevel} />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      <strong>Plafond mensuel :</strong> {new Intl.NumberFormat('fr-FR').format(investorProfile.monthlyInvestmentCap)} FCFA
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      Restant ce mois : {new Intl.NumberFormat('fr-FR').format(investorProfile.remainingMonthlyCapacity)} FCFA
                    </p>
                  </div>
                </div>

                {/* Niveaux KYC */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Niveaux de vérification</h3>
                  <div className="space-y-4">
                    {kycLevels.map((level) => (
                      <div
                        key={level.level}
                        className={`p-4 rounded-lg border-2 ${level.current ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                          }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900">{level.level}</span>
                              <span className="text-sm text-gray-600">- {level.label}</span>
                              {level.current && (
                                <CheckCircle className="w-5 h-5 text-blue-600" />
                              )}
                            </div>
                            <p className="text-sm text-gray-700 font-medium">{level.limit}</p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs text-gray-600 mb-1">Documents requis :</p>
                          <ul className="text-xs text-gray-700 space-y-1">
                            {level.requirements.map((req, i) => (
                              <li key={i}>• {req}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upload de documents */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploader un document</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-700 mb-2">Glissez-déposez votre document ici</p>
                    <p className="text-sm text-gray-500 mb-4">ou</p>
                    <label className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg cursor-pointer transition-colors">
                      {kycLoading ? 'Upload en cours...' : 'Choisir un fichier'}
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        accept="image/*,.pdf"
                        className="hidden"
                        disabled={kycLoading}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-4">Formats acceptés : JPG, PNG, PDF (max 5 MB)</p>
                    <p className="text-xs text-amber-600 mt-2 font-medium">Note: Upload par défaut en tant que CNI (Dev Mode)</p>
                  </div>
                </div>

                {/* Liste des documents */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Mes documents</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-gray-200">
                          <TableHead className="text-left py-3 px-4 text-sm font-medium text-gray-700">Type</TableHead>
                          <TableHead className="text-left py-3 px-4 text-sm font-medium text-gray-700">Fichier</TableHead>
                          <TableHead className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</TableHead>
                          <TableHead className="text-left py-3 px-4 text-sm font-medium text-gray-700">Statut</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {documents.map((doc) => (
                          <TableRow key={doc.id} className="border-b border-gray-100">
                            <TableCell className="py-4 px-4 text-sm text-gray-900">{doc.type}</TableCell>
                            <TableCell className="py-4 px-4 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                {doc.originalFilename}
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-4 text-sm text-gray-600">
                              {new Date(doc.createdAt).toLocaleDateString('fr-FR')}
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <StatusBadge status={doc.status} />
                            </TableCell>
                          </TableRow>
                        ))}
                        {documents.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-4 text-gray-500">Aucun document téléchargé</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}

            {/* Onglet Sécurité */}
            {activeTab === 'security' && (
              <div className="max-w-2xl space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Mot de passe</h3>
                  <button className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors">
                    Changer mon mot de passe
                  </button>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Sessions</h3>
                  <button className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">
                    Se déconnecter de tous les appareils
                  </button>
                  <p className="text-sm text-gray-600 mt-2">
                    Cela vous déconnectera de toutes les sessions actives sur tous vos appareils.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
