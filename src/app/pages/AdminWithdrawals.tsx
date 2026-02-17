import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { StatusBadge } from '../components/StatusBadge';
import {
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    ArrowDownCircle,
    Banknote,
    AlertTriangle,
} from 'lucide-react';
import { useWithdrawalStore, useAuthStore } from '../store';
import { useShallow } from 'zustand/react/shallow';
import { getUserIdFromToken } from '../config/jwt';
import type { WithdrawalStatus } from '../models';

const STATUS_TABS: { label: string; value: WithdrawalStatus | 'ALL' }[] = [
    { label: 'En attente', value: 'PENDING' },
    { label: 'Approuvées', value: 'APPROVED' },
    { label: 'Rejetées', value: 'REJECTED' },
    { label: 'Annulées', value: 'CANCELLED' },
];

export function AdminWithdrawals() {
    const [activeTab, setActiveTab] = useState<WithdrawalStatus>('PENDING');
    const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [processing, setProcessing] = useState(false);

    const token = useAuthStore((s) => s.token);
    const adminId = getUserIdFromToken(token) ?? '';

    const {
        withdrawals,
        loading,
        error,
        adminFetchPending,
        adminFetchByStatus,
        adminApprove,
        adminReject,
        clearError,
    } = useWithdrawalStore(
        useShallow((s) => ({
            withdrawals: s.withdrawals,
            loading: s.loading,
            error: s.error,
            adminFetchPending: s.adminFetchPending,
            adminFetchByStatus: s.adminFetchByStatus,
            adminApprove: s.adminApprove,
            adminReject: s.adminReject,
            clearError: s.clearError,
        }))
    );

    // Charger les retraits en fonction de l'onglet actif
    useEffect(() => {
        console.log('[AdminWithdrawals] useEffect triggered - activeTab:', activeTab);
        console.log('[AdminWithdrawals] token present:', !!token);
        console.log('[AdminWithdrawals] adminId:', adminId);
        if (activeTab === 'PENDING') {
            console.log('[AdminWithdrawals] Calling adminFetchPending...');
            adminFetchPending({ page: 0, size: 50 });
        } else {
            console.log('[AdminWithdrawals] Calling adminFetchByStatus with:', activeTab);
            adminFetchByStatus(activeTab, { page: 0, size: 50 });
        }
        setSelectedWithdrawal(null);
    }, [activeTab, adminFetchPending, adminFetchByStatus]);

    // Debug: log whenever withdrawals data changes
    useEffect(() => {
        console.log('[AdminWithdrawals] withdrawals state changed:', withdrawals);
        console.log('[AdminWithdrawals] withdrawals length:', withdrawals.length);
        console.log('[AdminWithdrawals] loading:', loading);
        console.log('[AdminWithdrawals] error:', error);
    }, [withdrawals, loading, error]);

    const handleApprove = async (id: string) => {
        if (!confirm('Voulez-vous approuver cette demande de retrait ?')) return;

        setProcessing(true);
        clearError();
        try {
            await adminApprove(id, adminId);
            alert('Retrait approuvé avec succès !');
            setSelectedWithdrawal(null);
            // Recharger
            if (activeTab === 'PENDING') {
                adminFetchPending({ page: 0, size: 50 });
            } else {
                adminFetchByStatus(activeTab, { page: 0, size: 50 });
            }
        } catch (err: any) {
            alert("Erreur lors de l'approbation : " + (err?.message || 'Erreur inconnue'));
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async (id: string) => {
        if (!rejectionReason.trim()) {
            alert('Veuillez indiquer le motif du rejet');
            return;
        }

        setProcessing(true);
        clearError();
        try {
            await adminReject(id, { reason: rejectionReason }, adminId);
            alert('Retrait rejeté. Le business a été notifié.');
            setSelectedWithdrawal(null);
            setShowRejectModal(false);
            setRejectionReason('');
            // Recharger
            if (activeTab === 'PENDING') {
                adminFetchPending({ page: 0, size: 50 });
            } else {
                adminFetchByStatus(activeTab, { page: 0, size: 50 });
            }
        } catch (err: any) {
            alert('Erreur lors du rejet : ' + (err?.message || 'Erreur inconnue'));
        } finally {
            setProcessing(false);
        }
    };

    const formatAmount = (amount: number) =>
        new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

    return (
        <Layout userType="admin">
            <div>
                {/* En-tête */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Demandes de retrait
                    </h1>
                    <p className="text-gray-600">
                        Gérez les demandes de retrait des entreprises
                    </p>
                </div>

                {/* Statistiques rapides */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {STATUS_TABS.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setActiveTab(tab.value as WithdrawalStatus)}
                            className={`p-4 rounded-xl border-2 transition-all ${activeTab === tab.value
                                ? 'border-galsen-green bg-galsen-green/5 shadow-md'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                {tab.value === 'PENDING' && (
                                    <Clock className="w-4 h-4 text-yellow-500" />
                                )}
                                {tab.value === 'APPROVED' && (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                )}
                                {tab.value === 'REJECTED' && (
                                    <XCircle className="w-4 h-4 text-red-500" />
                                )}
                                {tab.value === 'CANCELLED' && (
                                    <AlertTriangle className="w-4 h-4 text-gray-400" />
                                )}
                                <span
                                    className={`text-sm font-medium ${activeTab === tab.value
                                        ? 'text-galsen-green'
                                        : 'text-gray-600'
                                        }`}
                                >
                                    {tab.label}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Erreur */}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                        <button
                            onClick={clearError}
                            className="ml-2 underline hover:no-underline"
                        >
                            Fermer
                        </button>
                    </div>
                )}

                {/* Contenu principal */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Liste des retraits */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-md p-4">
                            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <ArrowDownCircle className="w-5 h-5 text-galsen-green" />
                                Demandes ({withdrawals.length})
                            </h2>

                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-galsen-green"></div>
                                </div>
                            ) : withdrawals.length === 0 ? (
                                <div className="text-center py-12">
                                    <Banknote className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 text-sm">
                                        Aucune demande de retrait{' '}
                                        {activeTab === 'PENDING' ? 'en attente' : ''}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
                                    {withdrawals.map((w) => (
                                        <button
                                            key={w.id}
                                            onClick={() => setSelectedWithdrawal(w)}
                                            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${selectedWithdrawal?.id === w.id
                                                ? 'border-galsen-green bg-galsen-green/5 shadow-sm'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-bold text-gray-900">
                                                    {formatAmount(w.amount)}
                                                </span>
                                                <StatusBadge status={w.status} />
                                            </div>
                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span className="truncate max-w-[140px]">
                                                    ID: {w.businessProfileId?.slice(0, 8)}…
                                                </span>
                                                <span>{formatDate(w.requestedAt)}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Détail du retrait sélectionné */}
                    <div className="lg:col-span-2">
                        {selectedWithdrawal ? (
                            <div className="bg-white rounded-xl shadow-md p-6">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                            {formatAmount(selectedWithdrawal.amount)}
                                        </h2>
                                        <p className="text-sm text-gray-500">
                                            Demande #{selectedWithdrawal.id?.slice(0, 8)}
                                        </p>
                                    </div>
                                    <StatusBadge
                                        status={selectedWithdrawal.status}
                                        className="text-sm px-3 py-1"
                                    />
                                </div>

                                {/* Informations */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-600 mb-1">
                                            ID Business
                                        </p>
                                        <p className="font-medium text-gray-900 text-sm break-all">
                                            {selectedWithdrawal.businessProfileId}
                                        </p>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-600 mb-1">Montant</p>
                                        <p className="font-bold text-gray-900 text-lg">
                                            {formatAmount(selectedWithdrawal.amount)}
                                        </p>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-600 mb-1">
                                            Date de la demande
                                        </p>
                                        <p className="font-medium text-gray-900">
                                            {formatDate(selectedWithdrawal.requestedAt)}
                                        </p>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-600 mb-1">Statut</p>
                                        <StatusBadge status={selectedWithdrawal.status} />
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-600 mb-1">Méthode</p>
                                        <p className="font-medium text-gray-900">
                                            {selectedWithdrawal.withdrawalMethod === 'BANK_TRANSFER' ? 'Virement bancaire' : 'Mobile Money'}
                                        </p>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-600 mb-1">Détails de paiement</p>
                                        <p className="font-medium text-gray-900 text-sm break-all">
                                            {selectedWithdrawal.paymentDetails}
                                        </p>
                                    </div>

                                    {selectedWithdrawal.processedBy && (
                                        <div className="bg-green-50 rounded-lg p-4">
                                            <p className="text-sm text-green-700 mb-1">
                                                Traité par
                                            </p>
                                            <p className="font-medium text-green-900 text-sm break-all">
                                                {selectedWithdrawal.processedBy}
                                            </p>
                                            {selectedWithdrawal.processedAt && (
                                                <p className="text-xs text-green-600 mt-1">
                                                    {formatDate(selectedWithdrawal.processedAt)}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {selectedWithdrawal.rejectionReason && (
                                        <div className="bg-red-50 rounded-lg p-4 md:col-span-2">
                                            <p className="text-sm text-red-700 mb-1">
                                                Motif du rejet
                                            </p>
                                            <p className="font-medium text-red-900">
                                                {selectedWithdrawal.rejectionReason}
                                            </p>
                                            {selectedWithdrawal.processedAt && (
                                                <p className="text-xs text-red-600 mt-1">
                                                    {formatDate(selectedWithdrawal.processedAt)}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Actions pour PENDING uniquement */}
                                {selectedWithdrawal.status === 'PENDING' && (
                                    <div className="flex gap-4 pt-6 border-t border-gray-200">
                                        <button
                                            onClick={() =>
                                                handleApprove(selectedWithdrawal.id)
                                            }
                                            disabled={processing}
                                            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-medium rounded-lg transition-colors"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            {processing ? 'Traitement...' : 'Approuver'}
                                        </button>

                                        <button
                                            onClick={() => setShowRejectModal(true)}
                                            disabled={processing}
                                            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-medium rounded-lg transition-colors"
                                        >
                                            <XCircle className="w-5 h-5" />
                                            Rejeter
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-md p-12 text-center">
                                <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 mb-2">
                                    Sélectionnez une demande
                                </p>
                                <p className="text-sm text-gray-400">
                                    Cliquez sur une demande de retrait pour voir les détails
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal de rejet */}
                {showRejectModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                Rejeter la demande de retrait
                            </h3>

                            <div className="mb-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm text-yellow-800">
                                    <strong>Montant :</strong>{' '}
                                    {formatAmount(selectedWithdrawal?.amount ?? 0)}
                                </p>
                            </div>

                            <div className="mb-6 mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Motif du rejet{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                                    placeholder="Expliquez pourquoi cette demande est rejetée…"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Ce message sera visible par l'entreprise
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        setRejectionReason('');
                                    }}
                                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={() =>
                                        handleReject(selectedWithdrawal.id)
                                    }
                                    disabled={processing}
                                    className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-medium rounded-lg transition-colors"
                                >
                                    {processing ? 'Traitement...' : 'Confirmer le rejet'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
