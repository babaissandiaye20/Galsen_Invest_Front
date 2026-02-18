import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from '../components/Layout';
import { StatusBadge } from '../components/StatusBadge';
import {
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  Search,
  Calendar,
  DollarSign,
  TrendingUp,
  Target,
  Building2,
  Users,
  ArrowLeft,
} from 'lucide-react';
import { useCampaignStore, useAuthStore } from '../store';
import { useShallow } from 'zustand/react/shallow';
import { campaignService, investmentService } from '../services';
import { toast } from 'sonner';
import type { Campaign, Investment } from '../models';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Separator } from '../components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount);
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr));
}

const statusColors: Record<string, string> = {
  APPROVED: 'bg-green-100 text-green-700',
  ACTIVE: 'bg-blue-100 text-blue-700',
  REVIEW: 'bg-yellow-100 text-yellow-700',
  DRAFT: 'bg-gray-100 text-gray-600',
  REJECTED: 'bg-red-100 text-red-700',
  CLOSED: 'bg-gray-600 text-white',
  FUNDED: 'bg-purple-100 text-purple-700',
};

const investmentStatusColors: Record<string, string> = {
  COMPLETED: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

// ─── Composant ───────────────────────────────────────────────────────────────

export function AdminValidateCampaigns() {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Détail campagne — investissements
  const [detailOpen, setDetailOpen] = useState(false);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [investmentsLoading, setInvestmentsLoading] = useState(false);
  const [investmentCount, setInvestmentCount] = useState(0);

  // Filtres pour l'onglet "Toutes"
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { token, isAuthenticated } = useAuthStore(
    useShallow((s) => ({ token: s.token, isAuthenticated: s.isAuthenticated }))
  );

  const { campaigns, fetchAll, loading } = useCampaignStore(
    useShallow((s) => ({
      campaigns: s.campaigns,
      fetchAll: s.fetchAll,
      loading: s.loading,
    }))
  );

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchAll({ page: 0, size: 100, sort: ['createdAt,DESC'] });
    }
  }, [isAuthenticated, token, fetchAll]);

  // Charger les investissements quand on ouvre le détail
  const loadInvestments = useCallback(async (campaignId: string) => {
    setInvestmentsLoading(true);
    setInvestments([]);
    setInvestmentCount(0);
    try {
      const res = await investmentService.getByCampaign(campaignId, { page: 0, size: 50 });
      const data = res.data ?? res;
      setInvestments(data.content ?? []);
      setInvestmentCount(data.totalElements ?? 0);
    } catch {
      setInvestments([]);
      setInvestmentCount(0);
    } finally {
      setInvestmentsLoading(false);
    }
  }, []);

  const openDetail = useCallback((campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setDetailOpen(true);
    loadInvestments(campaign.id);
  }, [loadInvestments]);

  const closeDetail = useCallback(() => {
    setDetailOpen(false);
    setSelectedCampaign(null);
    setInvestments([]);
    setInvestmentCount(0);
  }, []);

  // Campagnes en révision
  const pendingCampaigns = campaigns.filter(
    (c) => c.status === 'REVIEW' || c.status === 'PENDING_REVIEW' || c.status === 'SUBMITTED' || c.status === 'DRAFT'
  );

  // Toutes les campagnes filtrées
  const filteredAll = campaigns.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || c.title.toLowerCase().includes(q) || c.categoryLibelle?.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const uniqueStatuses = [...new Set(campaigns.map((c) => c.status))];

  const handleApprove = async (id: string) => {
    setProcessing(true);
    try {
      await campaignService.approve(id);
      toast.success('Campagne approuvée avec succès');
      closeDetail();
      fetchAll({ page: 0, size: 100, sort: ['createdAt,DESC'] });
    } catch (error: any) {
      toast.error("Erreur lors de l'approbation : " + (error.message || 'Erreur inconnue'));
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      toast.error('Veuillez indiquer le motif du rejet');
      return;
    }

    setProcessing(true);
    try {
      await campaignService.reject(id, { reason: rejectionReason });
      toast.success("Campagne rejetée. L'entreprise a été notifiée.");
      closeDetail();
      setShowRejectModal(false);
      setRejectionReason('');
      fetchAll({ page: 0, size: 100, sort: ['createdAt,DESC'] });
    } catch (error: any) {
      toast.error('Erreur lors du rejet : ' + (error.message || 'Erreur inconnue'));
    } finally {
      setProcessing(false);
    }
  };

  const isReviewable = (status: string) =>
    status === 'REVIEW' || status === 'DRAFT' || status === 'SUBMITTED';

  // ─── Vue détail pleine page ─────────────────────────────────────────────────

  if (detailOpen && selectedCampaign) {
    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);

    return (
      <Layout userType="admin">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={closeDetail}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Retour
            </Button>
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-bold text-galsen-blue">{selectedCampaign.title}</h1>
              <p className="text-sm text-galsen-blue/60">{selectedCampaign.categoryLibelle}</p>
            </div>
            <StatusBadge status={selectedCampaign.status as any} />
          </div>

          {/* Grille info principale */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Card>
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-galsen-green" />
                  <p className="text-[11px] text-galsen-blue/60">Objectif</p>
                </div>
                <p className="font-bold text-galsen-blue text-sm">
                  {formatCurrency(selectedCampaign.targetAmount)} F
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-galsen-gold" />
                  <p className="text-[11px] text-galsen-blue/60">Levé</p>
                </div>
                <p className="font-bold text-galsen-blue text-sm">
                  {formatCurrency(selectedCampaign.raisedAmount || 0)} F
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-galsen-blue" />
                  <p className="text-[11px] text-galsen-blue/60">Progression</p>
                </div>
                <p className="font-bold text-galsen-blue text-sm">
                  {(selectedCampaign.fundingPercentage || 0).toFixed(1)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-galsen-blue/60" />
                  <p className="text-[11px] text-galsen-blue/60">Début</p>
                </div>
                <p className="font-medium text-galsen-blue text-sm">
                  {selectedCampaign.startDate ? formatDate(selectedCampaign.startDate) : '—'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-galsen-blue/60" />
                  <p className="text-[11px] text-galsen-blue/60">Fin</p>
                </div>
                <p className="font-medium text-galsen-blue text-sm">
                  {selectedCampaign.endDate ? formatDate(selectedCampaign.endDate) : '—'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-purple-600" />
                  <p className="text-[11px] text-galsen-blue/60">Investisseurs</p>
                </div>
                <p className="font-bold text-galsen-blue text-sm">{investmentCount}</p>
              </CardContent>
            </Card>
          </div>

          {/* Barre de progression */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex justify-between text-xs text-galsen-blue/60 mb-2">
                <span>Progression du financement</span>
                <span>
                  {formatCurrency(selectedCampaign.raisedAmount || 0)} / {formatCurrency(selectedCampaign.targetAmount)} FCFA
                </span>
              </div>
              <div className="w-full bg-galsen-green/10 rounded-full h-3">
                <div
                  className="bg-galsen-green rounded-full h-3 transition-all"
                  style={{ width: `${Math.min(selectedCampaign.fundingPercentage || 0, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Colonne gauche : description + business + actions */}
            <div className="lg:col-span-1 space-y-4">
              {/* Info Business */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-galsen-blue flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-galsen-gold" />
                    Entreprise
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-[11px] text-galsen-blue/60">ID Profil Business</p>
                      <p className="font-mono text-xs text-galsen-blue bg-gray-50 rounded px-2 py-1 break-all">
                        {selectedCampaign.businessProfileId}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-galsen-blue/60">Devise</p>
                      <p className="font-medium text-galsen-blue">{selectedCampaign.devise || 'FCFA'}</p>
                    </div>
                    {selectedCampaign.minInvestment && (
                      <div>
                        <p className="text-[11px] text-galsen-blue/60">Investissement min</p>
                        <p className="font-medium text-galsen-blue">{formatCurrency(selectedCampaign.minInvestment)} F</p>
                      </div>
                    )}
                    {selectedCampaign.maxInvestment && (
                      <div>
                        <p className="text-[11px] text-galsen-blue/60">Investissement max</p>
                        <p className="font-medium text-galsen-blue">{formatCurrency(selectedCampaign.maxInvestment)} F</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              {selectedCampaign.description && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-galsen-blue">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-galsen-blue/80 max-h-48 overflow-y-auto whitespace-pre-wrap">
                      {selectedCampaign.description}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Rejet précédent */}
              {selectedCampaign.rejectionReason && (
                <Card className="border-red-200">
                  <CardContent className="pt-4">
                    <p className="text-xs font-medium text-red-700 mb-1">Motif du rejet précédent :</p>
                    <p className="text-sm text-red-600">{selectedCampaign.rejectionReason}</p>
                  </CardContent>
                </Card>
              )}

              {/* Infos de révision */}
              {selectedCampaign.reviewedBy && (
                <Card>
                  <CardContent className="pt-4">
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-[11px] text-galsen-blue/60">Révisé par</p>
                        <p className="font-medium text-galsen-blue">{selectedCampaign.reviewedBy}</p>
                      </div>
                      {selectedCampaign.reviewedAt && (
                        <div>
                          <p className="text-[11px] text-galsen-blue/60">Date de révision</p>
                          <p className="font-medium text-galsen-blue">{formatDate(selectedCampaign.reviewedAt)}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions admin */}
              {isReviewable(selectedCampaign.status) && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-galsen-blue">Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="border rounded-lg p-3">
                      <h4 className="font-medium text-galsen-blue mb-2 text-xs">Checklist de validation</h4>
                      <div className="space-y-1.5">
                        {[
                          'Informations complètes et cohérentes',
                          'Description claire et détaillée',
                          'Objectif financier réaliste',
                          'Période de campagne appropriée',
                          'Entreprise vérifiée',
                        ].map((item, index) => (
                          <label key={index} className="flex items-center gap-2 cursor-pointer text-xs">
                            <input type="checkbox" className="w-3.5 h-3.5 rounded text-galsen-green focus:ring-galsen-green" />
                            <span className="text-galsen-blue/80">{item}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        size="sm"
                        onClick={() => handleApprove(selectedCampaign.id)}
                        disabled={processing}
                      >
                        {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        Approuver
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        size="sm"
                        onClick={() => setShowRejectModal(true)}
                        disabled={processing}
                      >
                        {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                        Rejeter
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Colonne droite : investissements */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-galsen-blue flex items-center gap-2">
                      <Users className="w-4 h-4 text-galsen-green" />
                      Investissements ({investmentCount})
                    </CardTitle>
                    {investments.length > 0 && (
                      <Badge className="bg-galsen-green/10 text-galsen-green">
                        Total: {formatCurrency(totalInvested)} F
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {investmentsLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-galsen-green" />
                    </div>
                  ) : investments.length === 0 ? (
                    <div className="text-center py-12">
                      <DollarSign className="w-12 h-12 mx-auto mb-3 text-galsen-blue/20" />
                      <p className="text-galsen-blue/60 text-sm">Aucun investissement pour cette campagne</p>
                    </div>
                  ) : (
                    <>
                      {/* Desktop table */}
                      <div className="hidden md:block">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Investisseur</TableHead>
                              <TableHead>Montant</TableHead>
                              <TableHead>Statut</TableHead>
                              <TableHead>Méthode</TableHead>
                              <TableHead>Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {investments.map((inv) => (
                              <TableRow key={inv.id}>
                                <TableCell>
                                  <span className="text-sm font-medium text-galsen-blue">
                                    {inv.investorName || inv.investorProfileId?.slice(0, 8) + '…' || '—'}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span className="font-semibold text-sm text-galsen-blue">
                                    {formatCurrency(inv.amount)} F
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <Badge className={investmentStatusColors[inv.status] || 'bg-gray-100 text-gray-700'}>
                                    {inv.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <span className="text-xs text-galsen-blue/70">
                                    {inv.paymentMethod || '—'}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span className="text-xs text-galsen-blue/70">
                                    {formatDate(inv.createdAt)}
                                  </span>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Mobile cards */}
                      <div className="md:hidden space-y-3">
                        {investments.map((inv) => (
                          <div key={inv.id} className="border rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-sm text-galsen-blue">
                                {formatCurrency(inv.amount)} F
                              </span>
                              <Badge className={investmentStatusColors[inv.status] || 'bg-gray-100 text-gray-700'}>
                                {inv.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-galsen-blue/60">Investisseur: </span>
                                <span className="font-medium">{inv.investorName || inv.investorProfileId?.slice(0, 8) + '…' || '—'}</span>
                              </div>
                              <div>
                                <span className="text-galsen-blue/60">Méthode: </span>
                                <span>{inv.paymentMethod || '—'}</span>
                              </div>
                            </div>
                            <p className="text-[11px] text-galsen-blue/50">{formatDate(inv.createdAt)}</p>
                            {inv.notes && (
                              <p className="text-xs text-galsen-blue/70 italic">{inv.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Dialog de rejet */}
        <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rejeter la campagne</DialogTitle>
              <DialogDescription>
                Ce message sera envoyé à l'entreprise pour justifier le rejet.
              </DialogDescription>
            </DialogHeader>
            <div>
              <label className="block text-sm font-medium mb-2">
                Motif du rejet <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-galsen-green focus:border-galsen-green"
                placeholder="Expliquez pourquoi cette campagne est rejetée..."
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedCampaign && handleReject(selectedCampaign.id)}
                disabled={processing}
              >
                {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmer le rejet'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Layout>
    );
  }

  // ─── Vue liste (principale) ─────────────────────────────────────────────────

  return (
    <Layout userType="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-galsen-blue mb-1">Gestion des campagnes</h1>
          <p className="text-galsen-blue/60 text-sm">
            {campaigns.length} campagne{campaigns.length > 1 ? 's' : ''} au total
          </p>
        </div>

        <Tabs defaultValue="review">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="review" className="flex-1 sm:flex-none">
              En révision
              {pendingCampaigns.length > 0 && (
                <Badge className="ml-2 bg-yellow-100 text-yellow-700 text-[10px]">
                  {pendingCampaigns.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all" className="flex-1 sm:flex-none">
              Toutes les campagnes
              <Badge variant="secondary" className="ml-2 text-[10px]">
                {campaigns.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* ─── Onglet En révision ──────────────────────────────────────── */}
          <TabsContent value="review">
            <div className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-galsen-blue">
                    Campagnes en attente ({pendingCampaigns.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-galsen-green" />
                    </div>
                  ) : pendingCampaigns.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 mx-auto mb-3 text-galsen-green/30" />
                      <p className="text-galsen-blue/60 text-sm">Aucune campagne en attente</p>
                    </div>
                  ) : (
                    <>
                      {/* Desktop table */}
                      <div className="hidden md:block">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Campagne</TableHead>
                              <TableHead>Statut</TableHead>
                              <TableHead>Objectif</TableHead>
                              <TableHead>Catégorie</TableHead>
                              <TableHead>Date de création</TableHead>
                              <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pendingCampaigns.map((campaign) => (
                              <TableRow key={campaign.id}>
                                <TableCell>
                                  <p className="font-medium text-sm truncate max-w-[250px]">
                                    {campaign.title}
                                  </p>
                                </TableCell>
                                <TableCell>
                                  <StatusBadge status={campaign.status as any} />
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm font-medium">
                                    {formatCurrency(campaign.targetAmount)} F
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm text-galsen-blue/70">{campaign.categoryLibelle}</span>
                                </TableCell>
                                <TableCell>
                                  <span className="text-xs text-galsen-blue/60">{formatDate(campaign.createdAt)}</span>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button variant="outline" size="sm" onClick={() => openDetail(campaign)}>
                                    <Eye className="w-4 h-4 mr-1" />
                                    Détails
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Mobile cards */}
                      <div className="md:hidden space-y-3">
                        {pendingCampaigns.map((campaign) => (
                          <div key={campaign.id} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-sm truncate">{campaign.title}</p>
                                <p className="text-xs text-galsen-blue/60">{campaign.categoryLibelle}</p>
                              </div>
                              <StatusBadge status={campaign.status as any} />
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-galsen-blue/60">
                                Objectif: <span className="font-medium text-galsen-blue">{formatCurrency(campaign.targetAmount)} F</span>
                              </span>
                              <span className="text-galsen-blue/40">{formatDate(campaign.createdAt)}</span>
                            </div>
                            <Button variant="outline" size="sm" className="w-full" onClick={() => openDetail(campaign)}>
                              <Eye className="w-4 h-4 mr-1" />
                              Voir les détails
                            </Button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ─── Onglet Toutes les campagnes ─────────────────────────────── */}
          <TabsContent value="all">
            <div className="space-y-4 mt-4">
              {/* Filtres */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher par titre ou catégorie..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        {uniqueStatuses.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Table */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-galsen-blue">
                    Campagnes ({filteredAll.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-16">
                      <Loader2 className="w-8 h-8 animate-spin text-galsen-green" />
                    </div>
                  ) : filteredAll.length === 0 ? (
                    <div className="text-center py-16">
                      <Eye className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                      <p className="text-muted-foreground">Aucune campagne trouvée</p>
                    </div>
                  ) : (
                    <>
                      {/* Desktop table */}
                      <div className="hidden md:block">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Campagne</TableHead>
                              <TableHead>Statut</TableHead>
                              <TableHead>Objectif</TableHead>
                              <TableHead>Levé</TableHead>
                              <TableHead>Progression</TableHead>
                              <TableHead>Dates</TableHead>
                              <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredAll.map((campaign) => (
                              <TableRow key={campaign.id}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium text-sm truncate max-w-[200px]">
                                      {campaign.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{campaign.categoryLibelle}</p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge className={statusColors[campaign.status] || 'bg-gray-100 text-gray-700'}>
                                    {campaign.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm font-medium">
                                    {formatCurrency(campaign.targetAmount)} F
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm">
                                    {formatCurrency(campaign.raisedAmount)} F
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 bg-galsen-green/10 rounded-full h-2">
                                      <div
                                        className="bg-galsen-green rounded-full h-2"
                                        style={{
                                          width: `${Math.min(campaign.fundingPercentage, 100)}%`,
                                        }}
                                      />
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                      {campaign.fundingPercentage.toFixed(1)}%
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-xs text-muted-foreground">
                                    <p>{campaign.startDate ? formatDate(campaign.startDate) : '—'}</p>
                                    <p>{campaign.endDate ? formatDate(campaign.endDate) : '—'}</p>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openDetail(campaign)}
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    Voir
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Mobile cards */}
                      <div className="md:hidden space-y-3">
                        {filteredAll.map((campaign) => (
                          <div
                            key={campaign.id}
                            className="border rounded-lg p-4 space-y-3"
                          >
                            <div className="flex items-start justify-between">
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-sm truncate">{campaign.title}</p>
                                <p className="text-xs text-muted-foreground">{campaign.categoryLibelle}</p>
                              </div>
                              <Badge className={`ml-2 ${statusColors[campaign.status] || 'bg-gray-100 text-gray-700'}`}>
                                {campaign.status}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-muted-foreground">Objectif: </span>
                                <span className="font-medium">{formatCurrency(campaign.targetAmount)} F</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Levé: </span>
                                <span className="font-medium">{formatCurrency(campaign.raisedAmount)} F</span>
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                                <span>Progression</span>
                                <span>{campaign.fundingPercentage.toFixed(1)}%</span>
                              </div>
                              <div className="w-full bg-galsen-green/10 rounded-full h-2">
                                <div
                                  className="bg-galsen-green rounded-full h-2"
                                  style={{ width: `${Math.min(campaign.fundingPercentage, 100)}%` }}
                                />
                              </div>
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => openDetail(campaign)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Voir les détails
                            </Button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
