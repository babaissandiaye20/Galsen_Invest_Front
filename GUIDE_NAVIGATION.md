# 🚀 Guide de Navigation - Plateforme CrowdFund

## 📱 Vue d'ensemble

Plateforme complète de financement participatif avec 3 types d'utilisateurs :
- **👤 Investisseurs** : Découvrent et investissent dans des campagnes
- **🏢 Entreprises** : Créent et gèrent leurs campagnes de financement
- **👨‍💼 Administrateurs** : Valident les campnes et documents KYC

---

## 🔐 Authentification

### Page de connexion (`/login`)
- **Demo rapide** :
  - Email normal → Redirige vers dashboard Investisseur
  - Email avec "business" → Redirige vers dashboard Entreprise  
  - Email avec "admin" → Redirige vers dashboard Admin

### Inscription Investisseur (`/register/investor`)
Formulaire en 4 étapes :
1. **Identité** : Prénom, nom, date de naissance, nationalité
2. **Contact** : Email, téléphone, mot de passe
3. **Localisation** : Pays, ville, adresse
4. **Profil financier** : Profession, tranche de revenus

### Vérification OTP (`/verify-otp`)
- Code à 6 chiffres
- 3 méthodes d'envoi : Email, SMS, WhatsApp
- Timer de 60 secondes
- **Code démo** : `123456`

---

## 👤 Espace Investisseur

### Dashboard (`/investor/dashboard`)
**Statistiques** :
- Total investi
- Nombre d'investissements
- Plafond disponible (avec barre de progression)
- Solde portefeuille

**Sections** :
- Campagnes recommandées (3 cards)
- Investissements récents (tableau)
- Alerte KYC si niveau L0

### Liste des campagnes (`/campaigns`)
**Fonctionnalités** :
- Filtres : Recherche, catégorie, statut
- Tri : Plus récentes, bientôt terminées, plus financées
- Grille responsive de cards

### Détail campagne (`/campaigns/:id`)
**Contenu** :
- Hero avec image de couverture
- Sidebar d'investissement (progression, stats, formulaire)
- Onglets : Description, Photos, Investissements, Mises à jour
- Campagnes similaires

**Formulaire d'investissement** :
- Saisie montant
- Validation plafond KYC
- Bouton "Investir maintenant"

### Mon profil (`/investor/profile`)
**3 onglets** :

1. **Informations personnelles**
   - Formulaire éditable (prénom, nom, téléphone, ville, adresse, profession)
   - Email non modifiable

2. **Vérification KYC**
   - Niveau actuel + badge (L0, L1, L2)
   - Plafond mensuel et utilisation
   - Description des 3 niveaux
   - Zone d'upload de documents (drag & drop)
   - Tableau des documents soumis avec statuts

3. **Sécurité**
   - Changer mot de passe
   - Déconnexion de tous les appareils

### Mon portefeuille (`/investor/wallet`)
**Card de solde** :
- Solde disponible (grand format)
- Total crédits / Total débits
- Boutons : Recharger, Retirer

**Historique des transactions** :
- Filtres : Type, date de début, date de fin
- Tableau : Date, type, description, montant, statut
- Export CSV

---

## 🏢 Espace Entreprise

### Dashboard (`/business/dashboard`)
**Statistiques** :
- Campagnes actives
- Total collecté
- Nombre d'investisseurs
- Taux de réussite

**Mes campagnes** :
- Bouton "+ Nouvelle campagne"
- Filtres par statut (Toutes, Brouillon, En révision, Actif, Terminé)
- Tableau avec progression et actions

### Créer une campagne (`/business/campaigns/new`)
Formulaire en 5 étapes :

1. **Informations de base**
   - Titre (max 200 caractères)
   - Catégorie
   - Description courte (max 500 caractères)
   - Description détaillée

2. **Objectifs financiers**
   - Montant objectif
   - Investissement min/max
   - Dates début/fin
   - Calcul automatique de la durée

3. **Images**
   - Image de couverture (drag & drop)
   - Photos additionnelles (max 10)
   - Prévisualisation

4. **Documents légaux** (optionnel)
   - Business plan, états financiers, licences

5. **Révision**
   - Récapitulatif complet
   - Checkbox de certification
   - Actions : Enregistrer brouillon / Soumettre

---

## 👨‍💼 Espace Admin

### Dashboard (`/admin/dashboard`)
**Statistiques globales** :
- Utilisateurs totaux
- Campagnes en révision
- Documents KYC en attente
- Total investi sur la plateforme

**Actions rapides** :
- Liste des campagnes en révision (cards cliquables)
- Liste des documents KYC en attente (cards cliquables)
- Vue d'ensemble des campagnes (actives, terminées, en révision)

### Validation campagnes (`/admin/campaigns`)
**Interface en 2 colonnes** :
- **Gauche** : Liste des campagnes en révision
- **Droite** : Détails de la campagne sélectionnée

**Checklist de validation** :
- Informations complètes
- Documents fournis
- Description claire
- Objectif réaliste
- Période appropriée
- Entreprise vérifiée

**Actions** :
- Approuver (bouton vert)
- Rejeter (bouton rouge + modal pour motif)

### Validation KYC (`/admin/kyc`)
**Tableau des documents** :
- Colonnes : Utilisateur, Type, Date, Statut, Actions

**Modal de vérification** :
- Aperçu du document
- Informations utilisateur
- Checklist de vérification (lisibilité, validité, etc.)
- Zone pour motif de rejet
- Actions : Approuver / Rejeter

---

## 🎨 Composants Réutilisables

### `StatusBadge`
Badges colorés pour tous les statuts :
- DRAFT (gris), REVIEW (bleu), APPROVED (vert clair)
- ACTIVE (vert foncé), REJECTED (rouge), CLOSED (gris foncé)
- PENDING (jaune), COMPLETED (vert), FAILED (rouge)

### `KYCBadge`
Badge de niveau KYC avec icône :
- L0 (gris + ⚠️) : Non vérifié
- L1 (jaune + ✓) : Basique
- L2 (vert + ✓✓) : Complet

### `ProgressBar`
Barre de progression personnalisable :
- Props : current, goal, color, showPercentage, showLabels

### `CampaignCard`
Card de campagne avec :
- Image de couverture + badge catégorie
- Titre et description (tronqués)
- Barre de progression
- Stats (investisseurs, jours restants)
- Logo entreprise + bouton CTA

### `Layout`
Layout avec sidebar de navigation :
- Navigation adaptée au type d'utilisateur
- Logo et titre
- Menu de navigation
- Bouton de déconnexion

---

## 📊 Données Mock

### Campagnes
6 campagnes complètes avec :
- Catégories variées (Agriculture, Éducation, Tech, Santé, etc.)
- Statuts différents (ACTIVE, CLOSED)
- Progression réaliste
- Images Unsplash

### Profils
- **Investisseur** : Amadou Diallo (L1)
- **Entreprise** : Galsen Tech SARL
- Statistiques complètes pour chaque profil

### Transactions
5 transactions wallet avec types variés :
- INVESTMENT (débits)
- DEPOSIT (crédits)
- Statuts COMPLETED et PENDING

---

## 🎯 Niveaux KYC

### L0 - Non vérifié
- **Limite** : 0 FCFA/mois
- **Documents** : Aucun
- **Statut** : Inscription complétée

### L1 - Basique
- **Limite** : 500 000 FCFA/mois
- **Documents requis** : CNI OU Passeport
- **Graduation** : Automatique après validation admin

### L2 - Complet
- **Limite** : 5 000 000 FCFA/mois
- **Documents requis** :
  - CNI ou Passeport (déjà validé en L1)
  - Justificatif de domicile
  - Justificatif de revenus
  - Selfie avec CNI
- **Graduation** : Automatique après validation admin

---

## 🔄 Flux Utilisateur Complets

### Flux Investisseur
1. Inscription → Vérification OTP → Dashboard (L0)
2. Alerte KYC visible
3. Upload document CNI → Attente validation
4. Admin approuve → Passage L1 automatique
5. Peut maintenant investir (limite 500K/mois)
6. Visite campagne → Saisie montant → Investir
7. Consulte wallet et transactions

### Flux Entreprise
1. Inscription entreprise → Dashboard
2. Clic "+ Nouvelle campagne"
3. Formulaire 5 étapes → Enregistrer brouillon
4. Modifications possibles
5. Soumettre pour validation → Statut REVIEW
6. Admin approuve → Statut APPROVED
7. À la startDate → Statut ACTIVE
8. Consulte investissements reçus

### Flux Admin
1. Dashboard → Voir statistiques
2. Clic "Valider campagnes"
3. Sélectionne campagne → Vérifie checklist
4. Approuve → Entreprise notifiée
5. Clic "Valider KYC"
6. Visualise document → Checklist
7. Approuve → Niveau KYC upgradé automatiquement

---

## 🎨 Design System

### Couleurs
- **Primaire** : Bleu (#2563EB) - Boutons, liens
- **Succès** : Vert (#10B981) - Validations, L2
- **Avertissement** : Jaune (#F59E0B) - L1, en attente
- **Erreur** : Rouge (#EF4444) - Rejets, échecs
- **Secondaire** : Orange (#F97316) - CTAs investissement
- **Neutre** : Gris (#6B7280) - Textes secondaires

### Typographie
- Titres : Bold, 24-32px
- Corps : Regular, 14-16px
- Labels : Medium, 12-14px

### Espacements
Système 8px (8, 16, 24, 32, 48, 64...)

---

## 📝 Notes Techniques

### Technologies
- React 18.3.1
- React Router DOM 7.13.0
- Tailwind CSS 4.1.12
- Lucide React (icônes)

### Structure
```
/src
  /app
    /components     # Composants réutilisables
    /data          # Données mock
    /pages         # Pages de l'application
    App.tsx        # Routing principal
  /styles          # Fichiers CSS globaux
```

### Navigation
Toutes les routes sont définies dans `App.tsx` avec React Router.

---

## 🚀 Prochaines Étapes

Pour une vraie application production :
1. Intégrer Supabase pour le backend
2. Ajouter l'authentification Keycloak
3. Intégrer Stripe pour les paiements
4. Uploader réel via Cloudinary
5. Système de notifications email
6. Webhooks Stripe pour mise à jour automatique
7. Gestion des rôles et permissions
8. Tests unitaires et d'intégration

---

Fait avec ❤️ pour la démo de CrowdFund Platform
