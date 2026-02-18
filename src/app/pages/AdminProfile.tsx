import React, { useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Link } from 'react-router-dom';
import {
    Shield,
    Mail,
    User,
    KeyRound,
    Calendar,
    Users,
    FileText,
    CheckSquare,
    DollarSign,
    TrendingUp,
    Target,
    ArrowRight,
    Loader2,
    Receipt,
    ArrowDownCircle,
} from 'lucide-react';
import { useAuthStore, useAdminStore, useKycStore } from '../store';
import { useShallow } from 'zustand/react/shallow';
import {
    getUserInfoFromToken,
    getUserIdFromToken,
    getUserRole,
} from '../config/jwt';

function formatCurrency(amount: number): string {
    if (amount >= 1_000_000_000) {
        return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(amount / 1_000_000_000) + ' Mrd';
    }
    if (amount >= 1_000_000) {
        return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(amount / 1_000_000) + ' M';
    }
    return new Intl.NumberFormat('fr-FR').format(amount);
}

export function AdminProfile() {
    const token = useAuthStore((s) => s.token);

    const {
        users,
        pagination: usersPagination,
        campaignStats,
        statsLoading,
        fetchUsers,
        fetchCampaignStats,
    } = useAdminStore(
        useShallow((s) => ({
            users: s.users,
            pagination: s.pagination,
            campaignStats: s.campaignStats,
            statsLoading: s.statsLoading,
            fetchUsers: s.fetchUsers,
            fetchCampaignStats: s.fetchCampaignStats,
        }))
    );

    const { pendingDocuments, pagination: kycPagination, loading: kycLoading, adminFetchPending } = useKycStore(
        useShallow((s) => ({
            pendingDocuments: s.pendingDocuments,
            pagination: s.pagination,
            loading: s.loading,
            adminFetchPending: s.adminFetchPending,
        }))
    );

    useEffect(() => {
        fetchUsers({ page: 0, size: 5 });
        fetchCampaignStats();
        adminFetchPending({ page: 0, size: 5 });
    }, [fetchUsers, fetchCampaignStats, adminFetchPending]);

    // Extraire les infos du JWT
    const userInfo = getUserInfoFromToken(token);
    const userId = getUserIdFromToken(token);
    const role = getUserRole(token);

    const totalUsers = usersPagination?.totalElements ?? users.length;
    const pendingKycCount = kycPagination?.totalElements ?? pendingDocuments.length;
    const stats = campaignStats;

    return (
        <Layout userType="admin">
            <div className="space-y-6">
                {/* En-tête du profil */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-galsen-green/10">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                        {/* Avatar */}
                        <div className="w-20 h-20 rounded-full bg-galsen-red text-white flex items-center justify-center text-2xl font-bold shadow-lg shrink-0">
                            {userInfo.initials}
                        </div>

                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-galsen-blue">
                                {userInfo.name ?? 'Administrateur'}
                            </h1>
                            {userInfo.email && (
                                <p className="text-galsen-blue/70 mt-1">{userInfo.email}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-galsen-red text-white">
                                    <Shield className="w-3.5 h-3.5" />
                                    Administrateur
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Informations du compte */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-galsen-green/10">
                    <h2 className="text-xl font-bold text-galsen-blue mb-6 flex items-center gap-2">
                        <User className="w-6 h-6 text-galsen-gold" />
                        Informations du compte
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Nom complet */}
                        <div>
                            <label className="block text-sm font-medium text-galsen-blue/70 mb-2 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Nom complet
                            </label>
                            <p className="text-galsen-blue font-medium">
                                {userInfo.name ?? 'Non défini'}
                            </p>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-galsen-blue/70 mb-2 flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Email
                            </label>
                            <p className="text-galsen-blue font-medium">
                                {userInfo.email ?? 'Non défini'}
                            </p>
                        </div>

                        {/* Rôle */}
                        <div>
                            <label className="block text-sm font-medium text-galsen-blue/70 mb-2 flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                Rôle
                            </label>
                            <p className="text-galsen-blue font-medium capitalize">
                                {role ?? 'Inconnu'}
                            </p>
                        </div>

                        {/* ID utilisateur */}
                        <div>
                            <label className="block text-sm font-medium text-galsen-blue/70 mb-2 flex items-center gap-2">
                                <KeyRound className="w-4 h-4" />
                                Identifiant
                            </label>
                            <p className="text-galsen-blue font-medium font-mono text-sm">
                                {userId ? userId.slice(0, 20) + '…' : 'Non disponible'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Statistiques de la plateforme */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-galsen-green/10">
                    <h2 className="text-xl font-bold text-galsen-blue mb-6 flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-galsen-gold" />
                        Vue d'ensemble de la plateforme
                    </h2>

                    {statsLoading || kycLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-galsen-green" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Utilisateurs */}
                            <div className="text-center p-4 bg-galsen-gold/5 rounded-lg border border-galsen-gold/20">
                                <div className="p-2 bg-galsen-gold/10 rounded-lg w-fit mx-auto mb-3">
                                    <Users className="w-5 h-5 text-galsen-gold" />
                                </div>
                                <p className="text-sm text-galsen-blue/70 mb-1">Utilisateurs</p>
                                <p className="text-2xl font-bold text-galsen-gold">{totalUsers}</p>
                            </div>

                            {/* Campagnes */}
                            <div className="text-center p-4 bg-galsen-green/5 rounded-lg border border-galsen-green/20">
                                <div className="p-2 bg-galsen-green/10 rounded-lg w-fit mx-auto mb-3">
                                    <FileText className="w-5 h-5 text-galsen-green" />
                                </div>
                                <p className="text-sm text-galsen-blue/70 mb-1">Campagnes</p>
                                <p className="text-2xl font-bold text-galsen-green">{stats?.totalCampaigns ?? 0}</p>
                            </div>

                            {/* KYC en attente */}
                            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                <div className="p-2 bg-yellow-100 rounded-lg w-fit mx-auto mb-3">
                                    <CheckSquare className="w-5 h-5 text-yellow-600" />
                                </div>
                                <p className="text-sm text-galsen-blue/70 mb-1">KYC en attente</p>
                                <p className="text-2xl font-bold text-yellow-600">{pendingKycCount}</p>
                            </div>

                            {/* Total levé */}
                            <div className="text-center p-4 bg-galsen-blue/5 rounded-lg border border-galsen-blue/20">
                                <div className="p-2 bg-galsen-blue/10 rounded-lg w-fit mx-auto mb-3">
                                    <DollarSign className="w-5 h-5 text-galsen-blue" />
                                </div>
                                <p className="text-sm text-galsen-blue/70 mb-1">Total levé</p>
                                <p className="text-2xl font-bold text-galsen-blue">
                                    {formatCurrency(stats?.totalRaisedAmount ?? 0)}
                                </p>
                                <p className="text-xs text-galsen-blue/60 mt-1">FCFA</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Indicateurs avancés */}
                {stats && (
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-galsen-green/10">
                        <h2 className="text-xl font-bold text-galsen-blue mb-6 flex items-center gap-2">
                            <Target className="w-6 h-6 text-galsen-gold" />
                            Indicateurs de performance
                        </h2>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="text-center p-4 bg-galsen-green/5 rounded-lg">
                                <p className="text-sm text-galsen-blue/70 mb-2">Campagnes actives</p>
                                <p className="text-3xl font-bold text-galsen-green">{stats.activeCampaigns}</p>
                            </div>

                            <div className="text-center p-4 bg-galsen-gold/5 rounded-lg">
                                <p className="text-sm text-galsen-blue/70 mb-2">Taux de succès moyen</p>
                                <p className="text-3xl font-bold text-galsen-gold">
                                    {stats.averageSuccessRate.toFixed(1)}%
                                </p>
                            </div>

                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <p className="text-sm text-galsen-blue/70 mb-2">100% financées</p>
                                <p className="text-3xl font-bold text-purple-600">{stats.fullyFundedCampaigns}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Accès rapides */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-galsen-green/10">
                    <h2 className="text-xl font-bold text-galsen-blue mb-6">Accès rapides</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link
                            to="/admin/campaigns"
                            className="flex items-center gap-3 p-4 rounded-lg border border-galsen-green/20 hover:border-galsen-gold hover:shadow-md transition-all group"
                        >
                            <div className="p-2 bg-galsen-gold/10 rounded-lg">
                                <FileText className="w-5 h-5 text-galsen-gold" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-galsen-blue">Campagnes</p>
                                <p className="text-xs text-galsen-blue/60">Valider les campagnes</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-galsen-blue/30 group-hover:text-galsen-gold transition-colors" />
                        </Link>

                        <Link
                            to="/admin/kyc"
                            className="flex items-center gap-3 p-4 rounded-lg border border-galsen-green/20 hover:border-galsen-gold hover:shadow-md transition-all group"
                        >
                            <div className="p-2 bg-galsen-green/10 rounded-lg">
                                <CheckSquare className="w-5 h-5 text-galsen-green" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-galsen-blue">Documents KYC</p>
                                <p className="text-xs text-galsen-blue/60">Vérifier les documents</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-galsen-blue/30 group-hover:text-galsen-gold transition-colors" />
                        </Link>

                        <Link
                            to="/admin/transactions"
                            className="flex items-center gap-3 p-4 rounded-lg border border-galsen-green/20 hover:border-galsen-gold hover:shadow-md transition-all group"
                        >
                            <div className="p-2 bg-galsen-blue/10 rounded-lg">
                                <Receipt className="w-5 h-5 text-galsen-blue" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-galsen-blue">Transactions</p>
                                <p className="text-xs text-galsen-blue/60">Voir les transactions</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-galsen-blue/30 group-hover:text-galsen-gold transition-colors" />
                        </Link>

                        <Link
                            to="/admin/withdrawals"
                            className="flex items-center gap-3 p-4 rounded-lg border border-galsen-green/20 hover:border-galsen-gold hover:shadow-md transition-all group"
                        >
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <ArrowDownCircle className="w-5 h-5 text-orange-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-galsen-blue">Retraits</p>
                                <p className="text-xs text-galsen-blue/60">Gérer les demandes</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-galsen-blue/30 group-hover:text-galsen-gold transition-colors" />
                        </Link>

                        <Link
                            to="/admin/users"
                            className="flex items-center gap-3 p-4 rounded-lg border border-galsen-green/20 hover:border-galsen-gold hover:shadow-md transition-all group"
                        >
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Users className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-galsen-blue">Utilisateurs</p>
                                <p className="text-xs text-galsen-blue/60">Gérer les comptes</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-galsen-blue/30 group-hover:text-galsen-gold transition-colors" />
                        </Link>

                        <Link
                            to="/admin/dashboard"
                            className="flex items-center gap-3 p-4 rounded-lg border border-galsen-green/20 hover:border-galsen-gold hover:shadow-md transition-all group"
                        >
                            <div className="p-2 bg-galsen-red/10 rounded-lg">
                                <Shield className="w-5 h-5 text-galsen-red" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-galsen-blue">Dashboard</p>
                                <p className="text-xs text-galsen-blue/60">Vue d'ensemble</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-galsen-blue/30 group-hover:text-galsen-gold transition-colors" />
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
