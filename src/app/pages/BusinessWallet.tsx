import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { StatusBadge } from '../components/StatusBadge';
import {
    Wallet,
    Download,
    ArrowUpCircle,
    ArrowDownCircle,
    X,
    Loader2,
    Banknote,
    Trash2,
    Eye,
    Clock,
    RefreshCw,
} from 'lucide-react';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from '../components/ui/table';
import { useWalletStore, useWithdrawalStore, useProfileStore } from '../store';
import { useShallow } from 'zustand/react/shallow';
import { toast } from 'sonner';

const MIN_WITHDRAWAL = 5000;

export function BusinessWallet() {
    const [selectedType, setSelectedType] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    // Modal retrait
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawMethod, setWithdrawMethod] = useState<'BANK_TRANSFER' | 'MOBILE_MONEY'>('MOBILE_MONEY');
    const [withdrawPaymentDetails, setWithdrawPaymentDetails] = useState('');
    const [withdrawNotes, setWithdrawNotes] = useState('');
    const [withdrawLoading, setWithdrawLoading] = useState(false);

    const { wallet, transactions, fetchWallet, fetchTransactions, loading, error } = useWalletStore(
        useShallow((s) => ({
            wallet: s.wallet,
            transactions: s.transactions,
            fetchWallet: s.fetchWallet,
            fetchTransactions: s.fetchTransactions,
            loading: s.loading,
            error: s.error,
        }))
    );

    const {
        requestWithdrawal,
        withdrawals: myWithdrawals,
        fetchMyWithdrawals,
        cancelWithdrawal,
        loading: withdrawalsLoading,
    } = useWithdrawalStore(
        useShallow((s) => ({
            requestWithdrawal: s.requestWithdrawal,
            withdrawals: s.withdrawals,
            fetchMyWithdrawals: s.fetchMyWithdrawals,
            cancelWithdrawal: s.cancelWithdrawal,
            loading: s.loading,
        }))
    );

    const [selectedWithdrawalDetail, setSelectedWithdrawalDetail] = useState<any>(null);

    const { businessProfile, fetchBusinessProfile } = useProfileStore(
        useShallow((s) => ({
            businessProfile: s.businessProfile,
            fetchBusinessProfile: s.fetchBusinessProfile,
        }))
    );

    useEffect(() => {
        fetchWallet();
        fetchTransactions();
        fetchBusinessProfile();
        if (businessProfile?.id) {
            fetchMyWithdrawals({ page: 0, size: 50 }, businessProfile.id);
        }
    }, [fetchWallet, fetchTransactions, fetchBusinessProfile, fetchMyWithdrawals, businessProfile?.id]);

    const handleCancelWithdrawal = async (withdrawalId: string) => {
        if (!confirm('Voulez-vous annuler cette demande de retrait ?')) return;
        if (!businessProfile?.id) {
            toast.error('Profil business introuvable.');
            return;
        }
        try {
            await cancelWithdrawal(withdrawalId, businessProfile.id);
            toast.success('Demande de retrait annulée.');
            fetchMyWithdrawals({ page: 0, size: 50 }, businessProfile.id);
            fetchWallet();
        } catch {
            toast.error("Erreur lors de l'annulation.");
        }
    };

    const formatWdAmount = (amount: number) =>
        new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';

    const formatWdDate = (d: string) =>
        new Date(d).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

    const filteredTransactions = transactions.filter((tx) => {
        if (selectedType !== 'all' && tx.type !== selectedType) return false;
        if (dateRange.start && new Date(tx.createdAt) < new Date(dateRange.start)) return false;
        if (dateRange.end && new Date(tx.createdAt) > new Date(dateRange.end)) return false;
        return true;
    });

    const totalDebit = transactions
        .filter((tx) => ['WITHDRAWAL', 'INVESTMENT'].includes(tx.type))
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    const totalCredit = transactions
        .filter((tx) => ['DEPOSIT', 'RETURN', 'REFUND'].includes(tx.type))
        .reduce((sum, tx) => sum + tx.amount, 0);

    const handleWithdrawSubmit = async () => {
        const amount = Number(withdrawAmount);
        if (!amount || amount < MIN_WITHDRAWAL) {
            toast.error(
                `Le montant minimum de retrait est de ${new Intl.NumberFormat('fr-FR').format(MIN_WITHDRAWAL)} FCFA.`
            );
            return;
        }
        if (wallet && amount > wallet.balance) {
            toast.error('Solde insuffisant pour cette demande de retrait.');
            return;
        }
        if (!businessProfile?.id) {
            toast.error('Profil business introuvable. Veuillez recharger la page.');
            return;
        }
        if (!withdrawPaymentDetails.trim()) {
            toast.error('Veuillez renseigner les détails de paiement.');
            return;
        }
        setWithdrawLoading(true);
        try {
            await requestWithdrawal(
                {
                    amount,
                    withdrawalMethod: withdrawMethod,
                    paymentDetails: withdrawPaymentDetails.trim(),
                    notes: withdrawNotes.trim() || undefined,
                },
                businessProfile.id
            );
            toast.success('Demande de retrait envoyée avec succès ! Elle sera traitée par un administrateur.');
            closeWithdrawModal();
            // Rafraîchir le wallet
            setTimeout(() => {
                fetchWallet();
                fetchTransactions();
                fetchMyWithdrawals({ page: 0, size: 50 }, businessProfile.id);
            }, 1000);
        } catch {
            toast.error('Erreur lors de la demande de retrait.');
        } finally {
            setWithdrawLoading(false);
        }
    };

    const closeWithdrawModal = () => {
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        setWithdrawMethod('MOBILE_MONEY');
        setWithdrawPaymentDetails('');
        setWithdrawNotes('');
    };

    return (
        <Layout userType="business">
            <div className="space-y-6 md:space-y-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-galsen-blue mb-2">
                        Portefeuille Entreprise
                    </h1>
                    <p className="text-galsen-blue/70 text-sm md:text-base">
                        Consultez vos fonds reçus et gérez vos retraits
                    </p>
                </div>

                {error && (
                    <div className="p-3 bg-red-100 border border-red-300 text-red-700 text-sm rounded-lg">
                        {error}
                    </div>
                )}

                {/* Card de solde */}
                <div className="bg-gradient-to-br from-galsen-gold to-galsen-blue rounded-2xl shadow-2xl p-6 md:p-8 text-white border border-galsen-gold/20">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/20 rounded-lg">
                                <Wallet className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <div>
                                <p className="text-white/90 text-sm">Solde disponible</p>
                                <p className="text-xs text-white/70 mt-1">Wallet Entreprise</p>
                            </div>
                        </div>
                        <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium text-white w-fit">
                            {wallet?.status || 'INCONNU'}
                        </div>
                    </div>

                    <div className="mb-6">
                        <p className="text-3xl md:text-5xl font-bold mb-2">
                            {wallet ? new Intl.NumberFormat('fr-FR').format(wallet.balance) : '---'} FCFA
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <ArrowUpCircle className="w-5 h-5 text-galsen-gold" />
                                <p className="text-sm text-white/90">Total crédits</p>
                            </div>
                            <p className="text-lg md:text-xl font-semibold">
                                +{new Intl.NumberFormat('fr-FR').format(totalCredit)} FCFA
                            </p>
                        </div>

                        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <ArrowDownCircle className="w-5 h-5 text-red-300" />
                                <p className="text-sm text-white/90">Total débits</p>
                            </div>
                            <p className="text-lg md:text-xl font-semibold">
                                -{new Intl.NumberFormat('fr-FR').format(totalDebit)} FCFA
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                        <button
                            onClick={() => setShowWithdrawModal(true)}
                            disabled={loading || !wallet || wallet.balance <= 0}
                            className="flex-1 px-6 py-3 bg-white text-galsen-blue font-medium rounded-lg hover:bg-white/90 transition-colors shadow-md disabled:opacity-70 inline-flex items-center justify-center gap-2"
                        >
                            <Banknote className="w-5 h-5" />
                            Demander un retrait
                        </button>
                    </div>
                </div>

                {/* ── Mes demandes de retrait ── */}
                <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-galsen-green/10">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <h2 className="text-lg md:text-xl font-bold text-galsen-blue flex items-center gap-2">
                            <Banknote className="w-5 h-5 text-galsen-gold" />
                            Mes demandes de retrait
                        </h2>
                        <button
                            onClick={() => fetchMyWithdrawals({ page: 0, size: 50 }, businessProfile?.id)}
                            className="inline-flex items-center gap-2 px-4 py-2 text-galsen-gold hover:bg-galsen-gold/10 rounded-lg transition-colors font-medium text-sm"
                        >
                            <RefreshCw className={`w-4 h-4 ${withdrawalsLoading ? 'animate-spin' : ''}`} />
                            Actualiser
                        </button>
                    </div>

                    {myWithdrawals.length === 0 ? (
                        <div className="text-center py-10">
                            <Clock className="w-12 h-12 text-galsen-gold/30 mx-auto mb-3" />
                            <p className="text-galsen-blue/60 text-sm">
                                Aucune demande de retrait pour le moment
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {myWithdrawals.map((wd) => (
                                <div
                                    key={wd.id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-galsen-green/10 rounded-xl bg-galsen-white hover:shadow-sm transition-shadow gap-3"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-base font-bold text-galsen-blue">
                                                {formatWdAmount(wd.amount)}
                                            </span>
                                            <StatusBadge status={wd.status} />
                                        </div>
                                        <p className="text-xs text-galsen-blue/60">
                                            Demandé le {formatWdDate(wd.requestedAt)}
                                        </p>
                                        {wd.rejectionReason && (
                                            <p className="text-xs text-red-600 mt-1">
                                                Motif : {wd.rejectionReason}
                                            </p>
                                        )}
                                        {wd.processedAt && wd.status === 'APPROVED' && (
                                            <p className="text-xs text-green-600 mt-1">
                                                Approuvé le {formatWdDate(wd.processedAt)}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        {/* Détail toggle */}
                                        <button
                                            onClick={() =>
                                                setSelectedWithdrawalDetail(
                                                    selectedWithdrawalDetail?.id === wd.id ? null : wd
                                                )
                                            }
                                            className="p-2 text-galsen-blue/50 hover:text-galsen-blue hover:bg-galsen-green/10 rounded-lg transition-colors"
                                            title="Voir le détail"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>

                                        {/* Annuler si PENDING */}
                                        {wd.status === 'PENDING' && (
                                            <button
                                                onClick={() => handleCancelWithdrawal(wd.id)}
                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Annuler la demande"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Détail sélectionné */}
                    {selectedWithdrawalDetail && (
                        <div className="mt-4 p-5 bg-galsen-gold/5 border border-galsen-gold/20 rounded-xl">
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="font-semibold text-galsen-blue">
                                    Détail de la demande
                                </h3>
                                <button
                                    onClick={() => setSelectedWithdrawalDetail(null)}
                                    className="p-1 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-galsen-blue/60 mb-1">Montant</p>
                                    <p className="font-bold text-galsen-blue">
                                        {formatWdAmount(selectedWithdrawalDetail.amount)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-galsen-blue/60 mb-1">Statut</p>
                                    <StatusBadge status={selectedWithdrawalDetail.status} />
                                </div>
                                <div>
                                    <p className="text-galsen-blue/60 mb-1">Date de demande</p>
                                    <p className="text-galsen-blue">
                                        {formatWdDate(selectedWithdrawalDetail.requestedAt)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-galsen-blue/60 mb-1">ID</p>
                                    <p className="text-galsen-blue text-xs break-all">
                                        {selectedWithdrawalDetail.id}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-galsen-blue/60 mb-1">Méthode</p>
                                    <p className="text-galsen-blue">
                                        {selectedWithdrawalDetail.withdrawalMethod === 'BANK_TRANSFER' ? 'Virement bancaire' : 'Mobile Money'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-galsen-blue/60 mb-1">Détails paiement</p>
                                    <p className="text-galsen-blue text-xs break-all">
                                        {selectedWithdrawalDetail.paymentDetails}
                                    </p>
                                </div>
                                {selectedWithdrawalDetail.processedBy && (
                                    <div className="col-span-2">
                                        <p className="text-galsen-blue/60 mb-1">Traité par</p>
                                        <p className="text-green-700 text-xs break-all">
                                            {selectedWithdrawalDetail.processedBy}
                                            {selectedWithdrawalDetail.processedAt &&
                                                ` — le ${formatWdDate(selectedWithdrawalDetail.processedAt)}`}
                                        </p>
                                    </div>
                                )}
                                {selectedWithdrawalDetail.rejectionReason && (
                                    <div className="col-span-2">
                                        <p className="text-galsen-blue/60 mb-1">Motif de rejet</p>
                                        <p className="text-red-700">
                                            {selectedWithdrawalDetail.rejectionReason}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Historique des transactions */}
                <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-galsen-green/10">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <h2 className="text-lg md:text-xl font-bold text-galsen-blue">
                            Historique des transactions
                        </h2>
                        <button className="inline-flex items-center gap-2 px-4 py-2 text-galsen-gold hover:bg-galsen-gold/10 rounded-lg transition-colors font-medium">
                            <Download className="w-5 h-5" />
                            <span className="text-sm md:text-base">Exporter CSV</span>
                        </button>
                    </div>

                    {/* Filtres */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-galsen-white rounded-lg border border-galsen-green/10">
                        <div>
                            <label className="block text-sm font-medium text-galsen-blue mb-2">
                                Type de transaction
                            </label>
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="w-full px-3 py-2 border border-galsen-green/30 rounded-lg text-sm focus:ring-2 focus:ring-galsen-green focus:border-galsen-green"
                            >
                                <option value="all">Tous les types</option>
                                <option value="INVESTMENT">Investissement reçu</option>
                                <option value="DEPOSIT">Dépôt</option>
                                <option value="WITHDRAWAL">Retrait</option>
                                <option value="REFUND">Remboursement</option>
                                <option value="RETURN">Retour sur inv.</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-galsen-blue mb-2">
                                Date de début
                            </label>
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                className="w-full px-3 py-2 border border-galsen-green/30 rounded-lg text-sm focus:ring-2 focus:ring-galsen-green focus:border-galsen-green"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-galsen-blue mb-2">Date de fin</label>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                className="w-full px-3 py-2 border border-galsen-green/30 rounded-lg text-sm focus:ring-2 focus:ring-galsen-green focus:border-galsen-green"
                            />
                        </div>
                    </div>

                    {/* Version mobile - Cards */}
                    <div className="md:hidden space-y-3">
                        {filteredTransactions.map((tx) => (
                            <div key={tx.id} className="p-4 border border-galsen-green/10 rounded-lg bg-galsen-white">
                                <div className="flex justify-between items-start mb-3">
                                    <span
                                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${tx.type === 'WITHDRAWAL'
                                            ? 'bg-galsen-red/10 text-galsen-red'
                                            : tx.type === 'INVESTMENT'
                                                ? 'bg-galsen-green/10 text-galsen-green'
                                                : 'bg-galsen-gold/10 text-galsen-gold'
                                            }`}
                                    >
                                        {tx.type === 'WITHDRAWAL' && <ArrowDownCircle className="w-3 h-3" />}
                                        {tx.type === 'INVESTMENT' && <ArrowUpCircle className="w-3 h-3" />}
                                        {tx.type === 'INVESTMENT'
                                            ? 'Investissement reçu'
                                            : tx.type === 'DEPOSIT'
                                                ? 'Dépôt'
                                                : tx.type === 'WITHDRAWAL'
                                                    ? 'Retrait'
                                                    : tx.type === 'REFUND'
                                                        ? 'Remboursement'
                                                        : 'Retour'}
                                    </span>
                                    <StatusBadge status={tx.status as any} />
                                </div>
                                <p className="text-sm text-galsen-blue mb-2">{tx.description}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-galsen-blue/70">
                                        {new Date(tx.createdAt).toLocaleDateString('fr-FR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                        })}
                                    </span>
                                    <span
                                        className={`text-sm font-bold ${['WITHDRAWAL'].includes(tx.type) ? 'text-galsen-red' : 'text-galsen-green'
                                            }`}
                                    >
                                        {['WITHDRAWAL'].includes(tx.type) ? '-' : '+'}
                                        {new Intl.NumberFormat('fr-FR').format(tx.amount)} FCFA
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Version desktop - Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-galsen-green/20">
                                    <TableHead className="text-left py-3 px-4 text-sm font-medium text-galsen-blue">
                                        Date & Heure
                                    </TableHead>
                                    <TableHead className="text-left py-3 px-4 text-sm font-medium text-galsen-blue">
                                        Type
                                    </TableHead>
                                    <TableHead className="text-left py-3 px-4 text-sm font-medium text-galsen-blue">
                                        Description
                                    </TableHead>
                                    <TableHead className="text-left py-3 px-4 text-sm font-medium text-galsen-blue">
                                        Montant
                                    </TableHead>
                                    <TableHead className="text-left py-3 px-4 text-sm font-medium text-galsen-blue">
                                        Statut
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTransactions.map((tx) => (
                                    <TableRow
                                        key={tx.id}
                                        className="border-b border-galsen-green/10 hover:bg-galsen-white transition-colors"
                                    >
                                        <TableCell className="py-4 px-4 text-sm text-galsen-blue">
                                            {new Date(tx.createdAt).toLocaleDateString('fr-FR', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </TableCell>
                                        <TableCell className="py-4 px-4">
                                            <span
                                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${tx.type === 'WITHDRAWAL'
                                                    ? 'bg-galsen-red/10 text-galsen-red'
                                                    : tx.type === 'INVESTMENT'
                                                        ? 'bg-galsen-green/10 text-galsen-green'
                                                        : 'bg-galsen-gold/10 text-galsen-gold'
                                                    }`}
                                            >
                                                {tx.type === 'WITHDRAWAL' && <ArrowDownCircle className="w-3 h-3" />}
                                                {tx.type === 'INVESTMENT' && <ArrowUpCircle className="w-3 h-3" />}
                                                {tx.type === 'INVESTMENT'
                                                    ? 'Investissement reçu'
                                                    : tx.type === 'DEPOSIT'
                                                        ? 'Dépôt'
                                                        : tx.type === 'WITHDRAWAL'
                                                            ? 'Retrait'
                                                            : tx.type === 'REFUND'
                                                                ? 'Remboursement'
                                                                : 'Retour'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-4 px-4 text-sm text-galsen-blue/70">
                                            {tx.description}
                                        </TableCell>
                                        <TableCell className="py-4 px-4">
                                            <span
                                                className={`text-sm font-medium ${['WITHDRAWAL'].includes(tx.type) ? 'text-galsen-red' : 'text-galsen-green'
                                                    }`}
                                            >
                                                {['WITHDRAWAL'].includes(tx.type) ? '-' : '+'}
                                                {new Intl.NumberFormat('fr-FR').format(tx.amount)} FCFA
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-4 px-4">
                                            <StatusBadge status={tx.status as any} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {filteredTransactions.length === 0 && (
                        <div className="text-center py-12">
                            <Wallet className="w-16 h-16 text-galsen-gold/30 mx-auto mb-4" />
                            <p className="text-galsen-blue mb-2">Aucune transaction trouvée</p>
                            <p className="text-sm text-galsen-blue/60">
                                Les fonds provenant des investissements dans vos campagnes apparaîtront ici
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Modal Demande de retrait ── */}
            {showWithdrawModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
                        {/* Header */}
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-galsen-blue">Demander un retrait</h3>
                            <button
                                onClick={closeWithdrawModal}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-5 space-y-5">
                            {/* Info solde */}
                            <div className="p-4 bg-galsen-gold/5 border border-galsen-gold/20 rounded-xl">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-galsen-blue/70">Solde actuel</span>
                                    <span className="text-lg font-bold text-galsen-blue">
                                        {wallet ? new Intl.NumberFormat('fr-FR').format(wallet.balance) : '---'} FCFA
                                    </span>
                                </div>
                            </div>

                            {/* Montant */}
                            <div>
                                <label className="block text-sm font-medium text-galsen-blue mb-2">
                                    Montant du retrait (minimum{' '}
                                    {new Intl.NumberFormat('fr-FR').format(MIN_WITHDRAWAL)} FCFA)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min={MIN_WITHDRAWAL}
                                        max={wallet?.balance || 0}
                                        step="500"
                                        value={withdrawAmount}
                                        onChange={(e) => setWithdrawAmount(e.target.value)}
                                        placeholder="Ex: 50 000"
                                        className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-xl focus:ring-2 focus:ring-galsen-gold focus:border-transparent"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                                        FCFA
                                    </span>
                                </div>
                                <div className="flex gap-2 mt-2">
                                    {[10000, 25000, 50000, 100000].map((v) => (
                                        <button
                                            key={v}
                                            type="button"
                                            onClick={() => setWithdrawAmount(String(v))}
                                            disabled={wallet ? v > wallet.balance : true}
                                            className="flex-1 py-1.5 text-xs border border-galsen-gold/30 text-galsen-gold rounded-lg hover:bg-galsen-gold/5 transition-colors font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            {new Intl.NumberFormat('fr-FR', { notation: 'compact' }).format(v)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Méthode de retrait */}
                            <div>
                                <label className="block text-sm font-medium text-galsen-blue mb-2">
                                    Méthode de retrait
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setWithdrawMethod('MOBILE_MONEY')}
                                        className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${withdrawMethod === 'MOBILE_MONEY'
                                            ? 'border-galsen-gold bg-galsen-gold/10 text-galsen-blue'
                                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                            }`}
                                    >
                                        📱 Mobile Money
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setWithdrawMethod('BANK_TRANSFER')}
                                        className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${withdrawMethod === 'BANK_TRANSFER'
                                            ? 'border-galsen-gold bg-galsen-gold/10 text-galsen-blue'
                                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                            }`}
                                    >
                                        🏦 Virement bancaire
                                    </button>
                                </div>
                            </div>

                            {/* Détails de paiement */}
                            <div>
                                <label className="block text-sm font-medium text-galsen-blue mb-2">
                                    {withdrawMethod === 'MOBILE_MONEY'
                                        ? 'Numéro de téléphone'
                                        : 'Coordonnées bancaires (IBAN / RIB)'}
                                    <span className="text-red-500 ml-1">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={withdrawPaymentDetails}
                                    onChange={(e) => setWithdrawPaymentDetails(e.target.value)}
                                    placeholder={
                                        withdrawMethod === 'MOBILE_MONEY'
                                            ? 'Ex: +221 77 123 45 67'
                                            : 'Ex: SN08 SN00 0100 1520...'
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-galsen-gold focus:border-transparent"
                                />
                            </div>

                            {/* Notes (optionnel) */}
                            <div>
                                <label className="block text-sm font-medium text-galsen-blue mb-2">
                                    Notes (optionnel)
                                </label>
                                <textarea
                                    value={withdrawNotes}
                                    onChange={(e) => setWithdrawNotes(e.target.value)}
                                    rows={2}
                                    placeholder="Informations complémentaires..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-galsen-gold focus:border-transparent resize-none"
                                />
                            </div>

                            {/* Info */}
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                                <p className="text-xs text-blue-700">
                                    💡 Votre demande de retrait sera examinée par un administrateur. Vous serez notifié
                                    une fois la demande approuvée.
                                </p>
                            </div>
                        </div>

                        <div className="p-5 border-t border-gray-100">
                            <button
                                onClick={handleWithdrawSubmit}
                                disabled={
                                    withdrawLoading ||
                                    !withdrawAmount ||
                                    Number(withdrawAmount) < MIN_WITHDRAWAL ||
                                    !withdrawPaymentDetails.trim() ||
                                    (wallet ? Number(withdrawAmount) > wallet.balance : true)
                                }
                                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-galsen-gold hover:bg-galsen-gold/90 disabled:opacity-60 text-galsen-blue font-medium rounded-xl transition-colors"
                            >
                                {withdrawLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Banknote className="w-5 h-5" />
                                )}
                                {withdrawLoading ? 'Envoi en cours...' : 'Envoyer la demande'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
