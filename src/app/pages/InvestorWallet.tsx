import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { StatusBadge } from '../components/StatusBadge';
import { mockInvestorProfile, mockWalletTransactions } from '../data/mockData';
import { Wallet, Download, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

export function InvestorWallet() {
  const [selectedType, setSelectedType] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const filteredTransactions = mockWalletTransactions.filter(tx => {
    if (selectedType !== 'all' && tx.type !== selectedType) return false;
    if (dateRange.start && new Date(tx.date) < new Date(dateRange.start)) return false;
    if (dateRange.end && new Date(tx.date) > new Date(dateRange.end)) return false;
    return true;
  });

  const totalDebit = mockWalletTransactions
    .filter(tx => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const totalCredit = mockWalletTransactions
    .filter(tx => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <Layout userType="investor">
      <div className="space-y-6 md:space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-galsen-blue mb-2">Mon Portefeuille</h1>
          <p className="text-galsen-blue/70 text-sm md:text-base">Gérez votre solde et consultez vos transactions</p>
        </div>

        {/* Card de solde */}
        <div className="bg-gradient-to-br from-galsen-green to-galsen-blue rounded-2xl shadow-2xl p-6 md:p-8 text-white border border-galsen-green/20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-lg">
                <Wallet className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <p className="text-white/90 text-sm">Solde disponible</p>
                <p className="text-xs text-white/70 mt-1">Wallet Investisseur</p>
              </div>
            </div>
            <div className="px-3 py-1 bg-galsen-gold rounded-full text-xs font-medium text-galsen-blue w-fit">
              ACTIF
            </div>
          </div>

          <div className="mb-6">
            <p className="text-3xl md:text-5xl font-bold mb-2">
              {new Intl.NumberFormat('fr-FR').format(mockInvestorProfile.walletBalance)} FCFA
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
                <ArrowDownCircle className="w-5 h-5 text-galsen-red" />
                <p className="text-sm text-white/90">Total débits</p>
              </div>
              <p className="text-lg md:text-xl font-semibold">
                -{new Intl.NumberFormat('fr-FR').format(totalDebit)} FCFA
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button className="flex-1 px-6 py-3 bg-white text-galsen-green font-medium rounded-lg hover:bg-white/90 transition-colors shadow-md">
              Recharger
            </button>
            <button className="flex-1 px-6 py-3 bg-white/20 text-white font-medium rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm">
              Retirer
            </button>
          </div>
        </div>

        {/* Historique des transactions */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-galsen-green/10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-lg md:text-xl font-bold text-galsen-blue">Historique des transactions</h2>
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
                <option value="INVESTMENT">Investissement</option>
                <option value="DEPOSIT">Recharge</option>
                <option value="REFUND">Remboursement</option>
                <option value="TRANSFER">Transfert</option>
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
              <label className="block text-sm font-medium text-galsen-blue mb-2">
                Date de fin
              </label>
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
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    tx.type === 'INVESTMENT' ? 'bg-galsen-red/10 text-galsen-red' :
                    tx.type === 'DEPOSIT' ? 'bg-galsen-green/10 text-galsen-green' :
                    'bg-galsen-gold/10 text-galsen-gold'
                  }`}>
                    {tx.type === 'INVESTMENT' && <ArrowDownCircle className="w-3 h-3" />}
                    {tx.type === 'DEPOSIT' && <ArrowUpCircle className="w-3 h-3" />}
                    {tx.type === 'INVESTMENT' ? 'Investissement' :
                     tx.type === 'DEPOSIT' ? 'Recharge' :
                     tx.type === 'REFUND' ? 'Remboursement' : 'Transfert'}
                  </span>
                  <StatusBadge status={tx.status as any} />
                </div>
                <p className="text-sm text-galsen-blue mb-2">{tx.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-galsen-blue/70">
                    {new Date(tx.date).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </span>
                  <span className={`text-sm font-bold ${
                    tx.amount < 0 ? 'text-galsen-red' : 'text-galsen-green'
                  }`}>
                    {tx.amount < 0 ? '' : '+'}{new Intl.NumberFormat('fr-FR').format(tx.amount)} FCFA
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Version desktop - Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-galsen-green/20">
                  <th className="text-left py-3 px-4 text-sm font-medium text-galsen-blue">Date & Heure</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-galsen-blue">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-galsen-blue">Description</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-galsen-blue">Montant</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-galsen-blue">Statut</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-galsen-green/10 hover:bg-galsen-white transition-colors">
                    <td className="py-4 px-4 text-sm text-galsen-blue">
                      {new Date(tx.date).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tx.type === 'INVESTMENT' ? 'bg-galsen-red/10 text-galsen-red' :
                        tx.type === 'DEPOSIT' ? 'bg-galsen-green/10 text-galsen-green' :
                        'bg-galsen-gold/10 text-galsen-gold'
                      }`}>
                        {tx.type === 'INVESTMENT' && <ArrowDownCircle className="w-3 h-3" />}
                        {tx.type === 'DEPOSIT' && <ArrowUpCircle className="w-3 h-3" />}
                        {tx.type === 'INVESTMENT' ? 'Investissement' :
                         tx.type === 'DEPOSIT' ? 'Recharge' :
                         tx.type === 'REFUND' ? 'Remboursement' : 'Transfert'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-galsen-blue/70">
                      {tx.description}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-sm font-medium ${
                        tx.amount < 0 ? 'text-galsen-red' : 'text-galsen-green'
                      }`}>
                        {tx.amount < 0 ? '' : '+'}{new Intl.NumberFormat('fr-FR').format(tx.amount)} FCFA
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={tx.status as any} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <Wallet className="w-16 h-16 text-galsen-green/30 mx-auto mb-4" />
              <p className="text-galsen-blue mb-2">Aucune transaction trouvée</p>
              <p className="text-sm text-galsen-blue/60">Modifiez vos filtres pour voir plus de résultats</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
