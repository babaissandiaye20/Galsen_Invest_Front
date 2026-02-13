import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { StatusBadge } from '../components/StatusBadge';
import { FileText, CheckCircle, XCircle, Eye, Download, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useKycStore } from '../store';
import { useShallow } from 'zustand/react/shallow';
import { toast } from 'sonner';
import type { KycDocument } from '../models';

// Labels lisibles pour les types de documents
const docTypeLabels: Record<string, string> = {
  ID_CARD_FRONT: 'CNI — Recto',
  ID_CARD_BACK: 'CNI — Verso',
  PASSPORT: 'Passeport',
  SELFIE: 'Selfie avec pièce',
  INCOME_PROOF: 'Justificatif de revenus',
  ADDRESS_PROOF: 'Justificatif de domicile',
  RCCM: 'RCCM',
  NINEA: 'NINEA',
};

export function AdminValidateKYC() {
  const [selectedDoc, setSelectedDoc] = useState<KycDocument | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const {
    pendingDocuments,
    pagination,
    loading,
    error,
    adminFetchPending,
    adminApprove,
    adminReject,
  } = useKycStore(
    useShallow((s) => ({
      pendingDocuments: s.pendingDocuments,
      pagination: s.pagination,
      loading: s.loading,
      error: s.error,
      adminFetchPending: s.adminFetchPending,
      adminApprove: s.adminApprove,
      adminReject: s.adminReject,
    }))
  );

  useEffect(() => {
    adminFetchPending({ page, size: pageSize, sort: 'createdAt,ASC' });
  }, [adminFetchPending, page]);

  const handleApprove = async (doc: KycDocument) => {
    setActionLoading(true);
    try {
      await adminApprove(doc.id);
      toast.success(`Document "${docTypeLabels[doc.type] || doc.type}" approuvé avec succès !`);
      setShowModal(false);
      setSelectedDoc(null);
    } catch {
      toast.error(error || "Erreur lors de l'approbation.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (doc: KycDocument) => {
    if (!rejectionReason.trim()) {
      toast.error('Veuillez indiquer le motif du rejet.');
      return;
    }
    setActionLoading(true);
    try {
      await adminReject(doc.id, rejectionReason.trim());
      toast.success('Document rejeté. L\'utilisateur sera notifié.');
      setShowModal(false);
      setSelectedDoc(null);
      setRejectionReason('');
    } catch {
      toast.error(error || 'Erreur lors du rejet.');
    } finally {
      setActionLoading(false);
    }
  };

  const openDocument = (doc: KycDocument) => {
    setSelectedDoc(doc);
    setRejectionReason('');
    setShowModal(true);
  };

  const totalPages = pagination?.totalPages ?? 0;
  const totalElements = pagination?.totalElements ?? 0;

  return (
    <Layout userType="admin">
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Validation des documents KYC
          </h1>
          <p className="text-gray-600">
            Vérifiez et validez les documents d'identité soumis par les utilisateurs
          </p>
        </div>

        {/* Stat card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-gray-600">En attente</p>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FileText className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalElements}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-gray-600">Page</p>
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {totalPages > 0 ? `${page + 1} / ${totalPages}` : '—'}
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && !pendingDocuments.length && (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-galsen-green" />
          </div>
        )}

        {/* Document list — responsive: cards on mobile, table on desktop */}
        {!loading && pendingDocuments.length > 0 && (
          <>
            {/* Mobile cards */}
            <div className="md:hidden space-y-3 mb-6">
              {pendingDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-400"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {doc.userName || doc.userId.slice(0, 8) + '…'}
                      </p>
                      {doc.userEmail && (
                        <p className="text-xs text-gray-500 truncate">{doc.userEmail}</p>
                      )}
                    </div>
                    <StatusBadge status={doc.status} />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <FileText className="w-4 h-4 shrink-0" />
                    <span>{docTypeLabels[doc.type] || doc.type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(doc.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                    <button
                      onClick={() => openDocument(doc)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Vérifier
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  Documents en attente de validation
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Utilisateur</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Type de document</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Fichier</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Date</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Statut</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingDocuments.map((doc) => (
                      <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <p className="font-medium text-gray-900">
                            {doc.userName || doc.userId.slice(0, 8) + '…'}
                          </p>
                          {doc.userEmail && (
                            <p className="text-sm text-gray-500">{doc.userEmail}</p>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span>{docTypeLabels[doc.type] || doc.type}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600 max-w-[200px] truncate">
                          {doc.originalFilename}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {new Date(doc.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge status={doc.status} />
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
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="inline-flex items-center gap-1 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Précédent
                </button>
                <span className="text-sm text-gray-600">
                  Page {page + 1} sur {totalPages}
                </span>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className="inline-flex items-center gap-1 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {!loading && pendingDocuments.length === 0 && (
          <div className="bg-white rounded-lg shadow-md py-16 text-center">
            <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2 text-lg">Aucun document en attente</p>
            <p className="text-sm text-gray-400">Tous les documents ont été traités</p>
          </div>
        )}

        {/* ── Modal de vérification ── */}
        {showModal && selectedDoc && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Header */}
              <div className="p-5 md:p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                      Vérification de document
                    </h3>
                    <p className="text-gray-600">
                      {docTypeLabels[selectedDoc.type] || selectedDoc.type}
                    </p>
                  </div>
                  <button
                    onClick={() => { setShowModal(false); setSelectedDoc(null); setRejectionReason(''); }}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                {/* Infos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Utilisateur</p>
                    <p className="font-medium text-gray-900">
                      {selectedDoc.userName || selectedDoc.userId}
                    </p>
                    {selectedDoc.userEmail && (
                      <p className="text-sm text-gray-500">{selectedDoc.userEmail}</p>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Date d'upload</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedDoc.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit', month: 'long', year: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedDoc.originalFilename}
                    </p>
                  </div>
                </div>
              </div>

              {/* Document preview */}
              <div className="p-5 md:p-6">
                <div className="bg-gray-100 rounded-lg p-6 mb-6">
                  {selectedDoc.fileUrl && selectedDoc.contentType?.startsWith('image/') ? (
                    <img
                      src={selectedDoc.fileUrl}
                      alt={selectedDoc.originalFilename}
                      className="max-w-full max-h-[400px] mx-auto rounded-lg object-contain"
                    />
                  ) : (
                    <div className="text-center">
                      <FileText className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-3">{selectedDoc.originalFilename}</p>
                    </div>
                  )}
                  {selectedDoc.fileUrl && (
                    <div className="text-center mt-4">
                      <a
                        href={selectedDoc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Télécharger / Ouvrir
                      </a>
                    </div>
                  )}
                </div>

                {/* Checklist */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-blue-900 mb-3">Points de vérification</h4>
                  <div className="space-y-2">
                    {[
                      'Le document est lisible et de bonne qualité',
                      'Les informations correspondent au profil utilisateur',
                      'La date d\'expiration est valide',
                      'Le document n\'est pas altéré ou modifié',
                      'La photo est claire (si applicable)',
                    ].map((item, i) => (
                      <label key={i} className="flex items-center gap-3 text-sm text-blue-900 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                        {item}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rejection reason */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motif du rejet (obligatoire pour rejeter)
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Ex: Document illisible, veuillez envoyer une meilleure qualité..."
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="p-5 md:p-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleApprove(selectedDoc)}
                  disabled={actionLoading}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-medium rounded-lg transition-colors"
                >
                  {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                  Approuver
                </button>
                <button
                  onClick={() => handleReject(selectedDoc)}
                  disabled={actionLoading}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-medium rounded-lg transition-colors"
                >
                  {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                  Rejeter
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
