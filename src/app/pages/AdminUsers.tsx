import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { useAdminStore } from '../store/adminStore';
import { useShallow } from 'zustand/react/shallow';
import {
  Users,
  Search,
  Loader2,
  AlertCircle,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Building2,
  TrendingUp,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
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

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

function getInitials(name?: string, email?: string): string {
  if (name) {
    const parts = name.split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  }
  return (email || '??')[0].toUpperCase();
}

// ─── Composant ───────────────────────────────────────────────────────────────

export function AdminUsers() {
  const { users, pagination, loading, error, togglingId, fetchUsers, toggleUserStatus, clearError } =
    useAdminStore(
      useShallow((s) => ({
        users: s.users,
        pagination: s.pagination,
        loading: s.loading,
        error: s.error,
        togglingId: s.togglingId,
        fetchUsers: s.fetchUsers,
        toggleUserStatus: s.toggleUserStatus,
        clearError: s.clearError,
      }))
    );

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Dialog de confirmation
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<{
    id: string;
    name: string;
    isActive: boolean;
  } | null>(null);

  useEffect(() => {
    fetchUsers({ page, size: 15 });
  }, [page, fetchUsers]);

  const openConfirm = (id: string, name: string, isActive: boolean) => {
    setConfirmTarget({ id, name, isActive });
    setConfirmOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!confirmTarget) return;
    try {
      await toggleUserStatus(confirmTarget.id, confirmTarget.isActive);
      toast.success(
        confirmTarget.isActive
          ? `${confirmTarget.name} a été suspendu`
          : `${confirmTarget.name} a été activé`
      );
    } catch {
      toast.error('Erreur lors du changement de statut');
    } finally {
      setConfirmOpen(false);
      setConfirmTarget(null);
    }
  };

  // Filtrage local
  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      u.email.toLowerCase().includes(q) ||
      (u.display_name || '').toLowerCase().includes(q) ||
      u.phone.includes(q);
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const totalPages = pagination?.totalPages ?? 1;
  const totalElements = pagination?.totalElements ?? 0;

  // Compteurs rapides
  const activeCount = users.filter((u) => u.status === 'ACTIVE').length;
  const pendingCount = users.filter((u) => u.status === 'PENDING_ACTIVATION').length;
  const suspendedCount = users.filter((u) => u.status === 'SUSPENDED').length;

  return (
    <Layout userType="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-galsen-blue mb-1">
            Gestion des utilisateurs
          </h1>
          <p className="text-galsen-blue/60 text-sm">
            {totalElements} utilisateur{totalElements > 1 ? 's' : ''} enregistré{totalElements > 1 ? 's' : ''}
          </p>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="py-4">
            <CardContent className="flex items-center gap-3 px-4">
              <div className="p-2 rounded-lg bg-galsen-blue/5">
                <Users className="w-5 h-5 text-galsen-blue" />
              </div>
              <div>
                <p className="text-xs text-galsen-blue/60">Total</p>
                <p className="text-lg font-bold text-galsen-blue">{totalElements}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="py-4">
            <CardContent className="flex items-center gap-3 px-4">
              <div className="p-2 rounded-lg bg-green-50">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-galsen-blue/60">Actifs</p>
                <p className="text-lg font-bold text-green-600">{activeCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="py-4">
            <CardContent className="flex items-center gap-3 px-4">
              <div className="p-2 rounded-lg bg-yellow-50">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-galsen-blue/60">En attente</p>
                <p className="text-lg font-bold text-yellow-600">{pendingCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="py-4">
            <CardContent className="flex items-center gap-3 px-4">
              <div className="p-2 rounded-lg bg-red-50">
                <UserX className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-galsen-blue/60">Suspendus</p>
                <p className="text-lg font-bold text-red-600">{suspendedCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Erreur */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm flex-1">{error}</p>
            <Button variant="ghost" size="sm" onClick={clearError}>
              Fermer
            </Button>
          </div>
        )}

        {/* Filtres */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, email ou téléphone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  <SelectItem value="investor">Investisseurs</SelectItem>
                  <SelectItem value="business">Entreprises</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="ACTIVE">Actifs</SelectItem>
                  <SelectItem value="PENDING_ACTIVATION">En attente</SelectItem>
                  <SelectItem value="SUSPENDED">Suspendus</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table des utilisateurs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-galsen-blue">
              Utilisateurs ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && !users.length ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-galsen-green" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground text-lg">Aucun utilisateur trouvé</p>
                <p className="text-muted-foreground/60 text-sm mt-1">Essayez de modifier vos filtres</p>
              </div>
            ) : (
              <>
                {/* Vue Desktop : Table */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Utilisateur</TableHead>
                        <TableHead>Rôle</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Vérification</TableHead>
                        <TableHead>Inscrit le</TableHead>
                        <TableHead>Dernière connexion</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((user) => {
                        const isActive = user.status === 'ACTIVE';
                        const isToggling = togglingId === user.id;
                        const displayName = user.display_name || user.email.split('@')[0];

                        return (
                          <TableRow key={user.id}>
                            {/* Utilisateur */}
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="size-9">
                                  <AvatarFallback
                                    className={
                                      user.role === 'business'
                                        ? 'bg-galsen-gold/10 text-galsen-gold text-xs font-semibold'
                                        : 'bg-galsen-green/10 text-galsen-green text-xs font-semibold'
                                    }
                                  >
                                    {user.role === 'business' ? (
                                      <Building2 className="w-4 h-4" />
                                    ) : (
                                      getInitials(user.display_name, user.email)
                                    )}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <p className="font-medium text-sm truncate max-w-[200px]">
                                    {displayName}
                                  </p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Mail className="w-3 h-3" />
                                    <span className="truncate max-w-[180px]">{user.email}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Phone className="w-3 h-3" />
                                    {user.phone}
                                  </div>
                                </div>
                              </div>
                            </TableCell>

                            {/* Rôle */}
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className={
                                  user.role === 'business'
                                    ? 'bg-galsen-gold/10 text-galsen-gold border-galsen-gold/20'
                                    : 'bg-galsen-green/10 text-galsen-green border-galsen-green/20'
                                }
                              >
                                {user.role === 'business' ? (
                                  <Building2 className="w-3 h-3 mr-1" />
                                ) : (
                                  <TrendingUp className="w-3 h-3 mr-1" />
                                )}
                                {user.role === 'business' ? 'Entreprise' : 'Investisseur'}
                              </Badge>
                            </TableCell>

                            {/* Statut */}
                            <TableCell>
                              {user.status === 'ACTIVE' && (
                                <Badge className="bg-green-100 text-green-700 border-green-200">
                                  <UserCheck className="w-3 h-3 mr-1" />
                                  Actif
                                </Badge>
                              )}
                              {user.status === 'PENDING_ACTIVATION' && (
                                <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                                  <Clock className="w-3 h-3 mr-1" />
                                  En attente
                                </Badge>
                              )}
                              {user.status === 'SUSPENDED' && (
                                <Badge variant="destructive">
                                  <UserX className="w-3 h-3 mr-1" />
                                  Suspendu
                                </Badge>
                              )}
                            </TableCell>

                            {/* Vérification */}
                            <TableCell>
                              {user.profile?.verification_status === 'VERIFIED' ? (
                                <Badge className="bg-green-100 text-green-700 border-green-200">
                                  <ShieldCheck className="w-3 h-3 mr-1" />
                                  Vérifié
                                </Badge>
                              ) : user.profile?.verification_status === 'PENDING' ? (
                                <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                                  <ShieldAlert className="w-3 h-3 mr-1" />
                                  En cours
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-muted-foreground">
                                  <ShieldAlert className="w-3 h-3 mr-1" />
                                  Non vérifié
                                </Badge>
                              )}
                            </TableCell>

                            {/* Inscrit le */}
                            <TableCell>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                {formatDate(user.created_at)}
                              </div>
                            </TableCell>

                            {/* Dernière connexion */}
                            <TableCell>
                              {user.last_login_at ? (
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(user.last_login_at)}
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground/50">Jamais</span>
                              )}
                            </TableCell>

                            {/* Action */}
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant={isActive ? 'destructive' : 'default'}
                                disabled={isToggling}
                                onClick={() => openConfirm(user.id, displayName, isActive)}
                              >
                                {isToggling ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : isActive ? (
                                  <UserX className="w-4 h-4" />
                                ) : (
                                  <UserCheck className="w-4 h-4" />
                                )}
                                {isActive ? 'Suspendre' : 'Activer'}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Vue Mobile : Cards */}
                <div className="md:hidden space-y-3">
                  {filtered.map((user) => {
                    const isActive = user.status === 'ACTIVE';
                    const isToggling = togglingId === user.id;
                    const displayName = user.display_name || user.email.split('@')[0];

                    return (
                      <div
                        key={user.id}
                        className="border rounded-lg p-4 space-y-3"
                      >
                        {/* Top: avatar + nom + badges */}
                        <div className="flex items-start gap-3">
                          <Avatar className="size-10">
                            <AvatarFallback
                              className={
                                user.role === 'business'
                                  ? 'bg-galsen-gold/10 text-galsen-gold text-sm font-semibold'
                                  : 'bg-galsen-green/10 text-galsen-green text-sm font-semibold'
                              }
                            >
                              {user.role === 'business' ? (
                                <Building2 className="w-5 h-5" />
                              ) : (
                                getInitials(user.display_name, user.email)
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{displayName}</p>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              <Badge
                                variant="secondary"
                                className={
                                  user.role === 'business'
                                    ? 'bg-galsen-gold/10 text-galsen-gold text-[10px]'
                                    : 'bg-galsen-green/10 text-galsen-green text-[10px]'
                                }
                              >
                                {user.role === 'business' ? 'Entreprise' : 'Investisseur'}
                              </Badge>
                              {user.status === 'ACTIVE' && (
                                <Badge className="bg-green-100 text-green-700 text-[10px]">Actif</Badge>
                              )}
                              {user.status === 'PENDING_ACTIVATION' && (
                                <Badge className="bg-yellow-100 text-yellow-700 text-[10px]">En attente</Badge>
                              )}
                              {user.status === 'SUSPENDED' && (
                                <Badge variant="destructive" className="text-[10px]">Suspendu</Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Infos */}
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3" />
                            <span className="truncate">{user.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3" />
                            {user.phone}
                          </div>
                          {user.profile?.city && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3 h-3" />
                              {user.profile.city}
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            Inscrit le {formatDate(user.created_at)}
                          </div>
                        </div>

                        {/* Action */}
                        <Button
                          size="sm"
                          variant={isActive ? 'destructive' : 'default'}
                          disabled={isToggling}
                          className="w-full"
                          onClick={() => openConfirm(user.id, displayName, isActive)}
                        >
                          {isToggling ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : isActive ? (
                            <UserX className="w-4 h-4" />
                          ) : (
                            <UserCheck className="w-4 h-4" />
                          )}
                          {isActive ? 'Suspendre' : 'Activer'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="w-4 h-4" />
              Précédent
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              Suivant
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Dialog de confirmation */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmTarget?.isActive ? 'Suspendre' : 'Activer'} l'utilisateur
            </DialogTitle>
            <DialogDescription>
              Voulez-vous vraiment{' '}
              {confirmTarget?.isActive ? 'suspendre' : 'activer'}{' '}
              <strong>{confirmTarget?.name}</strong> ?
              {confirmTarget?.isActive &&
                ' Il ne pourra plus se connecter à la plateforme.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Annuler
            </Button>
            <Button
              variant={confirmTarget?.isActive ? 'destructive' : 'default'}
              onClick={handleConfirmToggle}
              disabled={!!togglingId}
            >
              {togglingId ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : confirmTarget?.isActive ? (
                'Suspendre'
              ) : (
                'Activer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
