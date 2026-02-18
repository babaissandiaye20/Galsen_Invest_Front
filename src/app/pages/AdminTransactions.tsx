import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from '../components/Layout';
import { StatusBadge } from '../components/StatusBadge';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Receipt,
  Filter,
  User,
} from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../components/ui/table';
import { useWalletStore } from '../store';
import { useShallow } from 'zustand/react/shallow';

// ─── Labels lisibles ─────────────────────────────────────────────────────────
const typeLabels: Record<string, string> = {
  DEPOSIT: 'Recharge',
  WITHDRAWAL: 'Retrait',
  INVESTMENT: 'Investissement',
  RETURN: 'Retour',
  REFUND: 'Remboursement',
};

const TRANSACTION_TYPES = ['', 'DEPOSIT', 'WITHDRAWAL', 'INVESTMENT', 'RETURN', 'REFUND'] as const;
const TRANSACTION_STATUSES = ['', 'PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'] as const;

const statusLabels: Record<string, string> = {
  PENDING: 'En attente',
  COMPLETED: 'Complétée',
  FAILED: 'Échouée',
  CANCELLED: 'Annulée',
};

const PAGE_SIZE = 20;

export function AdminTransactions() {
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(0);

  const {
    adminTransactions,
    adminTransactionsPagination,
    adminLoading,
    error,
    adminFetchTransactions,
  } = useWalletStore(
    useShallow((s) => ({
      adminTransactions: s.adminTransactions,
      adminTransactionsPagination: s.adminTransactionsPagination,
      adminLoading: s.adminLoading,
      error: s.error,
      adminFetchTransactions: s.adminFetchTransactions,
    }))
  );

  const fetchData = useCallback(() => {
    adminFetchTransactions({
      page,
      size: PAGE_SIZE,
      sort: 'createdAt,DESC',
      ...(selectedType && { type: selectedType }),
      ...(selectedStatus && { status: selectedStatus }),
    });
  }, [adminFetchTransactions, page, selectedType, selectedStatus]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Remettre à la page 0 quand on change les filtres
  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    setPage(0);
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    setPage(0);
  };

  const totalPages = adminTransactionsPagination?.totalPages ?? 0;
  const totalElements = adminTransactionsPagination?.totalElements ?? 0;

  const isDebit = (type: string) => ['WITHDRAWAL', 'INVESTMENT'].includes(type);

  return (
    <Layout userType="admin">
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Transactions
          </h1>
          <p className="text-gray-600">
            Consultez l'ensemble des transactions de la plateforme
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-gray-600">Total transactions</p>
              <div className="p-2 bg-green-100 rounded-lg">
                <Receipt className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalElements}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-gray-600">Page</p>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Filter className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {totalPages > 0 ? `${page + 1} / ${totalPages}` : '—'}
            </p>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtres
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-galsen-green focus:border-galsen-green"
              >
                <option value="">Tous les types</option>
                {TRANSACTION_TYPES.filter(Boolean).map((t) => (
                  <option key={t} value={t}>
                    {typeLabels[t] || t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Statut
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-galsen-green focus:border-galsen-green"
              >
                <option value="">Tous les statuts</option>
                {TRANSACTION_STATUSES.filter(Boolean).map((s) => (
                  <option key={s} value={s}>
                    {statusLabels[s] || s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Loading */}
        {adminLoading && !adminTransactions.length && (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-galsen-green" />
          </div>
        )}

        {/* Transactions list */}
        {!adminLoading && adminTransactions.length > 0 && (
          <>
            {/* Mobile cards */}
            <div className="md:hidden space-y-3 mb-6">
              {adminTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${tx.status === 'PENDING'
                      ? 'border-yellow-400'
                      : tx.status === 'COMPLETED'
                        ? 'border-green-400'
                        : tx.status === 'FAILED'
                          ? 'border-red-400'
                          : 'border-gray-400'
                    }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${isDebit(tx.transactionType)
                          ? 'bg-red-50 text-red-700'
                          : 'bg-green-50 text-green-700'
                        }`}
                    >
                      {isDebit(tx.transactionType) ? (
                        <ArrowDownCircle className="w-3 h-3" />
                      ) : (
                        <ArrowUpCircle className="w-3 h-3" />
                      )}
                      {typeLabels[tx.transactionType] || tx.transactionType}
                    </span>
                    <StatusBadge status={tx.status} />
                  </div>
                  <p className="text-sm text-gray-600 mb-1 truncate">
                    {tx.description || tx.reference}
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-600 font-medium">{tx.ownerName}</span>
                    <span className="text-xs text-gray-400">({tx.ownerEmail})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(tx.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                    <span
                      className={`text-sm font-bold ${isDebit(tx.transactionType) ? 'text-red-600' : 'text-green-600'
                        }`}
                    >
                      {isDebit(tx.transactionType) ? '-' : '+'}
                      {new Intl.NumberFormat('fr-FR').format(tx.amount)} FCFA
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  Liste des transactions
                </h2>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-200 bg-gray-50">
                      <TableHead className="text-left py-4 px-6 text-sm font-medium text-gray-700">
                        Référence
                      </TableHead>
                      <TableHead className="text-left py-4 px-6 text-sm font-medium text-gray-700">
                        Propriétaire
                      </TableHead>
                      <TableHead className="text-left py-4 px-6 text-sm font-medium text-gray-700">
                        Type
                      </TableHead>
                      <TableHead className="text-left py-4 px-6 text-sm font-medium text-gray-700">
                        Description
                      </TableHead>
                      <TableHead className="text-left py-4 px-6 text-sm font-medium text-gray-700">
                        Montant
                      </TableHead>
                      <TableHead className="text-left py-4 px-6 text-sm font-medium text-gray-700">
                        Statut
                      </TableHead>
                      <TableHead className="text-left py-4 px-6 text-sm font-medium text-gray-700">
                        Date
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminTransactions.map((tx) => (
                      <TableRow
                        key={tx.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <TableCell className="py-4 px-6 text-sm text-gray-600 font-mono">
                          {tx.reference?.slice(0, 12) || '—'}
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">{tx.ownerName}</span>
                            <span className="text-xs text-gray-500">{tx.ownerEmail}</span>
                            <span className={`text-xs mt-0.5 px-1.5 py-0.5 rounded-full w-fit ${tx.ownerType === 'INVESTOR' ? 'bg-blue-50 text-blue-700' : tx.ownerType === 'BUSINESS' ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                              {tx.ownerType}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${isDebit(tx.transactionType)
                                ? 'bg-red-50 text-red-700'
                                : 'bg-green-50 text-green-700'
                              }`}
                          >
                            {isDebit(tx.transactionType) ? (
                              <ArrowDownCircle className="w-3 h-3" />
                            ) : (
                              <ArrowUpCircle className="w-3 h-3" />
                            )}
                            {typeLabels[tx.transactionType] || tx.transactionType}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-sm text-gray-600 max-w-[200px] truncate">
                          {tx.description || '—'}
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <span
                            className={`text-sm font-medium ${isDebit(tx.transactionType) ? 'text-red-600' : 'text-green-600'
                              }`}
                          >
                            {isDebit(tx.transactionType) ? '-' : '+'}
                            {new Intl.NumberFormat('fr-FR').format(tx.amount)} FCFA
                          </span>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <StatusBadge status={tx.status} />
                        </TableCell>
                        <TableCell className="py-4 px-6 text-sm text-gray-600">
                          {new Date(tx.createdAt).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
        {!adminLoading && adminTransactions.length === 0 && !error && (
          <div className="bg-white rounded-lg shadow-md py-16 text-center">
            <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2 text-lg">Aucune transaction trouvée</p>
            <p className="text-sm text-gray-400">
              Modifiez vos filtres pour voir plus de résultats
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
