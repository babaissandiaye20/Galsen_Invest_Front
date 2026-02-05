import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { KYCBadge } from '../components/KYCBadge';
import { StatusBadge } from '../components/StatusBadge';
import { mockInvestorProfile, mockCountries } from '../data/mockData';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export function InvestorProfile() {
  const [activeTab, setActiveTab] = useState<'info' | 'kyc' | 'security'>('info');
  const [formData, setFormData] = useState({
    firstName: mockInvestorProfile.firstName,
    lastName: mockInvestorProfile.lastName,
    phone: mockInvestorProfile.phone,
    city: 'Dakar',
    address: 'Mermoz, Villa 45',
    occupation: 'Entrepreneur',
    incomeBracket: 'MEDIUM'
  });
  
  const [kycDocuments, setKycDocuments] = useState([
    { id: '1', type: 'CNI', status: 'APPROVED', uploadedAt: '2026-02-01', fileName: 'cni.pdf' },
    { id: '2', type: 'Passeport', status: 'PENDING', uploadedAt: '2026-02-03', fileName: 'passport.pdf' }
  ]);
  
  const [uploading, setUploading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSave = () => {
    alert('Profil mis à jour avec succès !');
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    // Simulation d'upload
    setTimeout(() => {
      const newDoc = {
        id: Date.now().toString(),
        type: 'Justificatif domicile',
        status: 'PENDING',
        uploadedAt: new Date().toISOString().split('T')[0],
        fileName: file.name
      };
      setKycDocuments([...kycDocuments, newDoc]);
      setUploading(false);
      alert('Document uploadé avec succès !');
    }, 2000);
  };
  
  const kycLevels = [
    {
      level: 'L0',
      label: 'Non vérifié',
      limit: '0 FCFA/mois',
      requirements: ['Aucun document requis'],
      current: mockInvestorProfile.kycLevel === 'L0'
    },
    {
      level: 'L1',
      label: 'Basique',
      limit: '500 000 FCFA/mois',
      requirements: ['CNI ou Passeport'],
      current: mockInvestorProfile.kycLevel === 'L1'
    },
    {
      level: 'L2',
      label: 'Complet',
      limit: '5 000 000 FCFA/mois',
      requirements: ['CNI ou Passeport', 'Justificatif de domicile', 'Justificatif de revenus', 'Selfie avec CNI'],
      current: mockInvestorProfile.kycLevel === 'L2'
    }
  ];
  
  return (
    <Layout userType="investor">
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon Profil</h1>
          <p className="text-gray-600">Gérez vos informations personnelles et votre vérification KYC</p>
        </div>
        
        {/* Onglets */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'info'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Informations personnelles
              </button>
              <button
                onClick={() => setActiveTab('kyc')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'kyc'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Vérification KYC
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'security'
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
                      value={mockInvestorProfile.email}
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      <option value="MEDIUM">2 000 000 - 10 000 000 FCFA</option>
                      <option value="HIGH">Plus de 10 000 000 FCFA</option>
                    </select>
                  </div>
                  
                  <button
                    onClick={handleSave}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Enregistrer les modifications
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
                    <KYCBadge level={mockInvestorProfile.kycLevel as any} />
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      <strong>Plafond mensuel :</strong> {new Intl.NumberFormat('fr-FR').format(mockInvestorProfile.monthlyLimit)} FCFA
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      Utilisé ce mois : {new Intl.NumberFormat('fr-FR').format(mockInvestorProfile.monthlyUsed)} FCFA 
                      ({((mockInvestorProfile.monthlyUsed / mockInvestorProfile.monthlyLimit) * 100).toFixed(0)}%)
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
                        className={`p-4 rounded-lg border-2 ${
                          level.current ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
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
                      {uploading ? 'Upload en cours...' : 'Choisir un fichier'}
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        accept="image/*,.pdf"
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-4">Formats acceptés : JPG, PNG, PDF (max 5 MB)</p>
                  </div>
                </div>
                
                {/* Liste des documents */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Mes documents</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Type</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Fichier</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {kycDocuments.map((doc) => (
                          <tr key={doc.id} className="border-b border-gray-100">
                            <td className="py-4 px-4 text-sm text-gray-900">{doc.type}</td>
                            <td className="py-4 px-4 text-sm text-gray-600 flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              {doc.fileName}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-600">
                              {new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="py-4 px-4">
                              <StatusBadge status={doc.status as any} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
