import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { StatusBadge } from '../components/StatusBadge';
import { mockPendingDocuments } from '../data/mockData';
import { FileText, CheckCircle, XCircle, Eye, Download } from 'lucide-react';

export function AdminValidateKYC() {
  const [documents, setDocuments] = useState(mockPendingDocuments);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const handleApprove = (id: string) => {
    if (confirm('Voulez-vous approuver ce document ?')) {
      setDocuments(documents.filter(d => d.id !== id));
      setShowModal(false);
      setSelectedDoc(null);
      alert('Document approuvé avec succès ! Le niveau KYC de l\'utilisateur sera mis à jour automatiquement.');
    }
  };
  
  const handleReject = (id: string) => {
    if (!rejectionReason.trim()) {
      alert('Veuillez indiquer le motif du rejet');
      return;
    }
    
    setDocuments(documents.filter(d => d.id !== id));
    setShowModal(false);
    setSelectedDoc(null);
    setRejectionReason('');
    alert('Document rejeté. L\'utilisateur a été notifié.');
  };
  
  const openDocument = (doc: any) => {
    setSelectedDoc(doc);
    setShowModal(true);
  };
  
  return (
    <Layout userType="admin">
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Validation des documents KYC</h1>
          <p className="text-gray-600">Vérifiez et validez les documents d'identité soumis par les utilisateurs</p>
        </div>
        
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">En attente</p>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FileText className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{documents.length}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Traités aujourd'hui</p>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">12</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Rejetés aujourd'hui</p>
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">3</p>
          </div>
        </div>
        
        {/* Liste des documents */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Documents en attente de validation</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Utilisateur</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Type de document</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Date d'upload</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Statut</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-900">{doc.userName}</p>
                        <p className="text-sm text-gray-600">{doc.userEmail}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{doc.documentType}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {new Date(doc.uploadDate).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={doc.status as any} />
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => openDocument(doc)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Vérifier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {documents.length === 0 && (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">Aucun document en attente</p>
              <p className="text-sm text-gray-400">Tous les documents ont été traités</p>
            </div>
          )}
        </div>
        
        {/* Modal de visualisation */}
        {showModal && selectedDoc && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      Vérification de document
                    </h3>
                    <p className="text-gray-600">{selectedDoc.documentType}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedDoc(null);
                      setRejectionReason('');
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Utilisateur</p>
                    <p className="font-medium text-gray-900">{selectedDoc.userName}</p>
                    <p className="text-sm text-gray-600">{selectedDoc.userEmail}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Date d'upload</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedDoc.uploadDate).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Aperçu du document */}
              <div className="p-6">
                <div className="bg-gray-100 rounded-lg p-8 mb-6">
                  <div className="text-center">
                    <FileText className="w-24 h-24 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-700 mb-4">
                      Aperçu du document : {selectedDoc.documentType}
                    </p>
                    <button className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Download className="w-4 h-4" />
                      Télécharger le document
                    </button>
                  </div>
                  
                  {/* Simulation d'un aperçu d'image */}
                  <div className="mt-6 bg-white rounded-lg p-8 border-2 border-dashed border-gray-300">
                    <div className="text-center text-gray-500">
                      <p className="mb-2">📄 Document d'identité</p>
                      <p className="text-sm">Pour la démo, l'aperçu du document serait affiché ici</p>
                      <p className="text-xs mt-2 text-gray-400">
                        En production, l'image ou le PDF du document serait chargé depuis Cloudinary
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Checklist de vérification */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-blue-900 mb-3">Points de vérification</h4>
                  <div className="space-y-2">
                    {[
                      'Le document est lisible et de bonne qualité',
                      'Les informations correspondent au profil utilisateur',
                      'La date d\'expiration est valide',
                      'Le document n\'est pas altéré ou modifié',
                      'La photo est claire (si applicable)'
                    ].map((item, index) => (
                      <label key={index} className="flex items-center gap-3 text-sm text-blue-900 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        {item}
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Zone de rejet */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motif du rejet (optionnel)
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Document illisible, veuillez uploader une meilleure qualité..."
                  />
                </div>
              </div>
              
              {/* Actions */}
              <div className="p-6 border-t border-gray-200 flex gap-4">
                <button
                  onClick={() => handleApprove(selectedDoc.id)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approuver le document
                </button>
                
                <button
                  onClick={() => handleReject(selectedDoc.id)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                  Rejeter le document
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
