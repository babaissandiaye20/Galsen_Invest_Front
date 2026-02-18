import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from '../components/Layout';
import { StatusBadge } from '../components/StatusBadge';
import { StripeEmbeddedCheckoutForm } from '../components/StripePaymentForm';
import { Wallet, Download, ArrowUpCircle, ArrowDownCircle, X, CreditCard, Loader2, ArrowLeft } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '../components/ui/table';
import { useWalletStore } from '../store';
import { useShallow } from 'zustand/react/shallow';
import { toast } from 'sonner';
import { loadStripe } from '@stripe/stripe-js';
import type { PaymentMethodCode } from '../models';
import type { DepositSession } from '../models';

// ─── Méthodes de paiement disponibles ────────────────────────────────────────
const PAYMENT_METHODS: {
  code: PaymentMethodCode;
  label: string;
  description: string;
  logo: string;
  available: boolean;
  color: string;
}[] = [
  {
    code: 'STRIPE',
    label: 'Carte bancaire',
    description: 'Visa, Mastercard',
    logo: '💳',
    available: true,
    color: 'border-blue-500 bg-blue-50',
  },
  {
    code: 'WAVE',
    label: 'Wave',
    description: 'Paiement mobile Wave',
    logo: '🌊',
    available: false,
    color: 'border-gray-200 bg-gray-50',
  },
  {
    code: 'ORANGE_MONEY',
    label: 'Orange Money',
    description: 'Paiement mobile Orange',
    logo: '🟠',
    available: false,
    color: 'border-gray-200 bg-gray-50',
  },
];

const MIN_AMOUNT = 1000;

export function InvestorWallet() {
  const [selectedType, setSelectedType] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Modal recharge — étape 1 : saisie, étape 2 : paiement Stripe
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositStep, setDepositStep] = useState<'amount' | 'payment'>('amount');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodCode>('STRIPE');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositSession, setDepositSession] = useState<DepositSession | null>(null);


  const { wallet, transactions, fetchWallet, fetchTransactions, deposit, loading, error } = useWalletStore(
    useShallow(s => ({
      wallet: s.wallet,
      transactions: s.transactions,
      fetchWallet: s.fetchWallet,
      fetchTransactions: s.fetchTransactions,
      deposit: s.deposit,
      loading: s.loading,
      error: s.error
    }))
  );

  useEffect(() => {
    fetchWallet();
    fetchTransactions();
  }, [fetchWallet, fetchTransactions]);

  const filteredTransactions = transactions.filter(tx => {
    if (selectedType !== 'all' && tx.transactionType !== selectedType) return false;
    if (dateRange.start && new Date(tx.createdAt) < new Date(dateRange.start)) return false;
    if (dateRange.end && new Date(tx.createdAt) > new Date(dateRange.end)) return false;
    return true;
  });

  const totalDebit = transactions
    .filter(tx => ['WITHDRAWAL', 'INVESTMENT'].includes(tx.transactionType))
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const totalCredit = transactions
    .filter(tx => ['DEPOSIT', 'RETURN', 'REFUND'].includes(tx.transactionType))
    .reduce((sum, tx) => sum + tx.amount, 0);

  const handleDepositSubmit = async () => {
    const amount = Number(depositAmount);
    if (!amount || amount < MIN_AMOUNT) {
      toast.error(`Le montant minimum est de ${new Intl.NumberFormat('fr-FR').format(MIN_AMOUNT)} FCFA.`);
      return;
    }
    setDepositLoading(true);
    try {
      const session = await deposit({ amount, paymentMethodCode: selectedMethod });
      // Passer à l'étape 2 avec le formulaire Stripe embarqué
      setDepositSession(session);
      setDepositStep('payment');
    } catch {
      toast.error(error || 'Erreur lors de la création de la session de paiement.');
    } finally {
      setDepositLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    toast.success('Paiement réussi ! Votre wallet sera crédité sous peu.');
    // Rafraîchir le wallet et les transactions après un délai
    setTimeout(() => {
      fetchWallet();
      fetchTransactions();
      closeModal();
    }, 2000);
  };

  const handlePaymentError = (message: string) => {
    toast.error(message);
  };

  const closeModal = () => {
    setShowDepositModal(false);
    setDepositAmount('');
    setDepositStep('amount');
    setDepositSession(null);
  };

  // Instance Stripe chargée dynamiquement avec la clé publique du backend
  const stripePromise = useMemo(() => {
    if (depositSession?.stripePublicKey) {
      return loadStripe(depositSession.stripePublicKey);
    }
    return null;
  }, [depositSession?.stripePublicKey]);

  const handleWithdraw = () => {
    toast.info('Les retraits seront bientôt disponibles.');
  };

  return (
    <Layout userType="investor">
      <div className="space-y-6 md:space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-galsen-blue mb-2">Mon Portefeuille</h1>
          <p className="text-galsen-blue/70 text-sm md:text-base">Gérez votre solde et consultez vos transactions</p>
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-300 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

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
                <ArrowDownCircle className="w-5 h-5 text-galsen-red" />
                <p className="text-sm text-white/90">Total débits</p>
              </div>
              <p className="text-lg md:text-xl font-semibold">
                -{new Intl.NumberFormat('fr-FR').format(totalDebit)} FCFA
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={() => setShowDepositModal(true)}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-white text-galsen-green font-medium rounded-lg hover:bg-white/90 transition-colors shadow-md disabled:opacity-70"
            >
              Recharger
            </button>
            <button
              onClick={handleWithdraw}
              className="flex-1 px-6 py-3 bg-white/20 text-white font-medium rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm"
            >
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
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${tx.transactionType === 'INVESTMENT' ? 'bg-galsen-red/10 text-galsen-red' :
                      tx.transactionType === 'DEPOSIT' ? 'bg-galsen-green/10 text-galsen-green' :
                        'bg-galsen-gold/10 text-galsen-gold'
                    }`}>
                    {tx.transactionType === 'INVESTMENT' && <ArrowDownCircle className="w-3 h-3" />}
                    {tx.transactionType === 'DEPOSIT' && <ArrowUpCircle className="w-3 h-3" />}
                    {tx.transactionType === 'INVESTMENT' ? 'Investissement' :
                      tx.transactionType === 'DEPOSIT' ? 'Recharge' :
                        tx.transactionType === 'WITHDRAWAL' ? 'Retrait' :
                          tx.transactionType === 'REFUND' ? 'Remboursement' : 'Retour'}
                  </span>
                  <StatusBadge status={tx.status as any} />
                </div>
                <p className="text-sm text-galsen-blue mb-2">{tx.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-galsen-blue/70">
                    {new Date(tx.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </span>
                  <span className={`text-sm font-bold ${['INVESTMENT', 'WITHDRAWAL'].includes(tx.transactionType) ? 'text-galsen-red' : 'text-galsen-green'
                    }`}>
                    {['INVESTMENT', 'WITHDRAWAL'].includes(tx.transactionType) ? '-' : '+'}{new Intl.NumberFormat('fr-FR').format(tx.amount)} FCFA
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
                  <TableHead className="text-left py-3 px-4 text-sm font-medium text-galsen-blue">Date & Heure</TableHead>
                  <TableHead className="text-left py-3 px-4 text-sm font-medium text-galsen-blue">Type</TableHead>
                  <TableHead className="text-left py-3 px-4 text-sm font-medium text-galsen-blue">Description</TableHead>
                  <TableHead className="text-left py-3 px-4 text-sm font-medium text-galsen-blue">Montant</TableHead>
                  <TableHead className="text-left py-3 px-4 text-sm font-medium text-galsen-blue">Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((tx) => (
                  <TableRow key={tx.id} className="border-b border-galsen-green/10 hover:bg-galsen-white transition-colors">
                    <TableCell className="py-4 px-4 text-sm text-galsen-blue">
                      {new Date(tx.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${tx.transactionType === 'INVESTMENT' ? 'bg-galsen-red/10 text-galsen-red' :
                          tx.transactionType === 'DEPOSIT' ? 'bg-galsen-green/10 text-galsen-green' :
                            'bg-galsen-gold/10 text-galsen-gold'
                        }`}>
                        {tx.transactionType === 'INVESTMENT' && <ArrowDownCircle className="w-3 h-3" />}
                        {tx.transactionType === 'DEPOSIT' && <ArrowUpCircle className="w-3 h-3" />}
                        {tx.transactionType === 'INVESTMENT' ? 'Investissement' :
                          tx.transactionType === 'DEPOSIT' ? 'Recharge' :
                            tx.transactionType === 'WITHDRAWAL' ? 'Retrait' :
                              tx.transactionType === 'REFUND' ? 'Remboursement' : 'Retour'}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 px-4 text-sm text-galsen-blue/70">
                      {tx.description}
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      <span className={`text-sm font-medium ${['INVESTMENT', 'WITHDRAWAL'].includes(tx.transactionType) ? 'text-galsen-red' : 'text-galsen-green'
                        }`}>
                        {['INVESTMENT', 'WITHDRAWAL'].includes(tx.transactionType) ? '-' : '+'}{new Intl.NumberFormat('fr-FR').format(tx.amount)} FCFA
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
              <Wallet className="w-16 h-16 text-galsen-green/30 mx-auto mb-4" />
              <p className="text-galsen-blue mb-2">Aucune transaction trouvée</p>
              <p className="text-sm text-galsen-blue/60">Modifiez vos filtres pour voir plus de résultats</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal Recharge ── */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className={`bg-white rounded-2xl w-full shadow-2xl my-auto ${depositStep === 'payment' ? 'max-w-2xl' : 'max-w-md'}`}>

            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {depositStep === 'payment' && (
                  <button
                    onClick={() => { setDepositStep('amount'); setDepositSession(null); }}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <h3 className="text-xl font-bold text-galsen-blue">
                  {depositStep === 'amount' ? 'Recharger mon wallet' : 'Paiement sécurisé'}
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ── Étape 1 : Choix méthode + montant ── */}
            {depositStep === 'amount' && (
              <>
                <div className="p-5 space-y-5">
                  {/* Méthodes de paiement */}
                  <div>
                    <p className="text-sm font-medium text-galsen-blue mb-3">Moyen de paiement</p>
                    <div className="space-y-2">
                      {PAYMENT_METHODS.map((method) => (
                        <button
                          key={method.code}
                          type="button"
                          disabled={!method.available}
                          onClick={() => method.available && setSelectedMethod(method.code)}
                          className={`w-full flex items-center gap-4 p-3 rounded-xl border-2 transition-all
                            ${!method.available ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-galsen-green'}
                            ${selectedMethod === method.code && method.available ? 'border-galsen-green bg-galsen-green/5' : method.color}`}
                        >
                          <span className="text-2xl w-8 text-center">{method.logo}</span>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-galsen-blue text-sm">{method.label}</p>
                            <p className="text-xs text-galsen-blue/60">{method.description}</p>
                          </div>
                          {!method.available && (
                            <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                              Bientôt disponible
                            </span>
                          )}
                          {method.available && selectedMethod === method.code && (
                            <div className="w-5 h-5 rounded-full bg-galsen-green flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Montant */}
                  <div>
                    <label className="block text-sm font-medium text-galsen-blue mb-2">
                      Montant (minimum {new Intl.NumberFormat('fr-FR').format(MIN_AMOUNT)} FCFA)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={MIN_AMOUNT}
                        step="500"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="Ex: 5000"
                        className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-xl focus:ring-2 focus:ring-galsen-green focus:border-transparent"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                        FCFA
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {[5000, 10000, 25000, 50000].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setDepositAmount(String(v))}
                          className="flex-1 py-1.5 text-xs border border-galsen-green/30 text-galsen-green rounded-lg hover:bg-galsen-green/5 transition-colors font-medium"
                        >
                          {new Intl.NumberFormat('fr-FR', { notation: 'compact' }).format(v)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-5 border-t border-gray-100">
                  <button
                    onClick={handleDepositSubmit}
                    disabled={depositLoading || !depositAmount || Number(depositAmount) < MIN_AMOUNT}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-galsen-green hover:bg-galsen-green/90 disabled:opacity-60 text-white font-medium rounded-xl transition-colors"
                  >
                    {depositLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                    {depositLoading ? 'Préparation du paiement...' : 'Continuer vers le paiement'}
                  </button>
                  <p className="text-xs text-center text-gray-400 mt-3">
                    Paiement sécurisé par Stripe
                  </p>
                </div>
              </>
            )}

            {/* ── Étape 2 : Stripe Embedded Checkout ── */}
            {depositStep === 'payment' && depositSession && stripePromise && (
              <div className="p-4 sm:p-6">
                {/* Résumé du montant */}
                <div className="mb-4 p-3 bg-galsen-green/5 border border-galsen-green/20 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-galsen-blue/70">Montant à recharger</span>
                    <span className="text-lg font-bold text-galsen-blue">
                      {new Intl.NumberFormat('fr-FR').format(Number(depositAmount))} FCFA
                    </span>
                  </div>
                </div>

                {/* EmbeddedCheckout — iframe Stripe qui gère tout le formulaire */}
                <div className="w-full">
                  <StripeEmbeddedCheckoutForm
                    stripePromise={stripePromise}
                    clientSecret={depositSession.clientSecret}
                    onComplete={handlePaymentSuccess}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
