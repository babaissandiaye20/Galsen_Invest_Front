import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store';
import { apiGet } from '../services/httpClient';
import logoGalsen from '../images/logogalsen_invest.png';

export function RegisterInvestor() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [localError, setLocalError] = useState('');
  
  // Détecter si on est en mode business ou investor
  const isBusiness = location.pathname.includes('/business');

  const [formData, setFormData] = useState({
    // Champs communs
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    
    // Champs Investor
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: 'SN',
    countryIsoCode: 'SN',
    city: '',
    address: '',
    occupation: '',
    incomeBracket: 'MID',
    
    // Champs Business
    companyName: '',
    tradeName: '',
    legalForm: 'SARL',
    sectorId: '',
    registrationNumber: '',
    taxId: '',
    foundedDate: '',
    representativeName: '',
    representativeTitle: '',
    websiteUrl: '',
    description: '',
    employeeCount: '',
    annualRevenue: ''
  });

  // Stores réactivés
  const registerInvestor = useAuthStore((s) => s.registerInvestor);
  const registerBusiness = useAuthStore((s) => s.registerBusiness);
  const authLoading = useAuthStore((s) => s.loading);
  const authError = useAuthStore((s) => s.error);
  const clearAuthError = useAuthStore((s) => s.clearError);

  const [countries, setCountries] = useState<any[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [refLoading, setRefLoading] = useState(false);

  // Récupération des pays et secteurs depuis l'API publique
  useEffect(() => {
    const fetchData = async () => {
      setRefLoading(true);
      try {
        // Charger les pays en utilisant httpClient qui gère les headers correctement
        const countriesResult = await apiGet<any>('/auth-service/api/pays');
        if (countriesResult.success && countriesResult.data && countriesResult.data.content) {
          setCountries(countriesResult.data.content);
          console.log('Pays chargés:', countriesResult.data.content.length, 'pays');
        }

        // Charger les secteurs
        const sectorsResult = await apiGet<any>('/auth-service/api/sectors');
        if (sectorsResult.success && sectorsResult.data && sectorsResult.data.content) {
          setSectors(sectorsResult.data.content);
          console.log('Secteurs chargés:', sectorsResult.data.content.length, 'secteurs');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        // Fallback sur des valeurs par défaut en cas d'erreur
        setCountries([
          { id: '1', codeIso: 'SN', libelle: 'Sénégal', indicatifTel: '+221' }
        ]);
      } finally {
        setRefLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Empêcher la touche Entrée de soumettre le formulaire avant l'étape 4
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter' && currentStep < 4) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Validation par étape
  const validateStep = (step: number): string | null => {
    switch (step) {
      case 1:
        if (isBusiness) {
          if (!formData.companyName.trim()) return "Le nom de l'entreprise est requis";
          if (!formData.legalForm) return "La forme juridique est requise";
          if (!formData.sectorId) return "Le secteur d'activité est requis";
        } else {
          if (!formData.firstName.trim()) return "Le prénom est requis";
          if (!formData.lastName.trim()) return "Le nom est requis";
          if (!formData.dateOfBirth) return "La date de naissance est requise";
        }
        return null;
      case 2:
        if (!formData.email.trim()) return "L'email est requis";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return "L'email n'est pas valide";
        if (!formData.phone.trim()) return "Le téléphone est requis";
        if (!formData.password) return "Le mot de passe est requis";
        if (formData.password.length < 8) return "Le mot de passe doit contenir au moins 8 caractères";
        if (formData.password !== formData.confirmPassword) return "Les mots de passe ne correspondent pas";
        return null;
      case 3:
        if (!formData.countryIsoCode) return "Le pays est requis";
        if (!formData.city.trim()) return "La ville est requise";
        if (!formData.address.trim()) return "L'adresse est requise";
        return null;
      case 4:
        // Étape 4 : pas de champs obligatoires bloquants pour Business
        // Pour Investor, occupation et incomeBracket sont pré-remplis
        return null;
      default:
        return null;
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setLocalError('');
      const error = validateStep(currentStep);
      if (error) {
        setLocalError(error);
        return;
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setLocalError('');
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // IMPORTANT: Bloquer la soumission si on n'est pas à l'étape 4
    if (currentStep < 4) {
      return;
    }

    clearAuthError();
    setLocalError('');

    // Validation de TOUTES les étapes avant soumission
    for (let step = 1; step <= 4; step++) {
      const error = validateStep(step);
      if (error) {
        setLocalError(error);
        setCurrentStep(step);
        return;
      }
    }

    try {
      if (isBusiness) {
        // Inscription Business
        await registerBusiness({
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          companyName: formData.companyName,
          tradeName: formData.tradeName || undefined,
          legalForm: formData.legalForm as 'SARL' | 'SA' | 'SAS' | 'SUARL' | 'SNC' | 'GIE' | 'ASSOCIATION' | 'OTHER',
          sectorId: formData.sectorId,
          registrationNumber: formData.registrationNumber || undefined,
          taxId: formData.taxId || undefined,
          foundedDate: formData.foundedDate || undefined,
          representativeName: formData.representativeName || undefined,
          representativeTitle: formData.representativeTitle || undefined,
          countryIsoCode: formData.countryIsoCode || undefined,
          address: formData.address || undefined,
          city: formData.city || undefined,
          websiteUrl: formData.websiteUrl || undefined,
          description: formData.description || undefined,
          employeeCount: formData.employeeCount ? parseInt(formData.employeeCount) : undefined,
          annualRevenue: formData.annualRevenue ? parseFloat(formData.annualRevenue) : undefined,
        });
      } else {
        // Inscription Investor
        await registerInvestor({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          birthDate: formData.dateOfBirth,
          nationalityIsoCode: formData.nationality,
          residenceCountryIsoCode: formData.countryIsoCode,
          city: formData.city,
          address: formData.address,
          occupation: formData.occupation,
          incomeBracket: formData.incomeBracket as 'LOW' | 'MID' | 'HIGH' | 'VERY_HIGH',
        });
      }
      // Redirection vers la page OTP après inscription réussie
      navigate('/verify-otp', { state: { email: formData.email } });
    } catch (err: unknown) {
      // L'erreur est déjà gérée dans le store, on log le détail pour debug
      const fetchErr = err as { data?: { detail?: string; message?: string; status?: number }; status?: number; message?: string };
      console.error('Erreur inscription:', fetchErr?.data || fetchErr?.message || err);
    }
  };

  const loading = authLoading || refLoading;

  return (
    <div className="min-h-screen bg-galsen-white flex">
      {/* Partie gauche - Background Image (masquée sur mobile) */}
      <div
        className="hidden md:block md:w-1/2 bg-gradient-to-br from-galsen-green to-galsen-blue relative"
        style={{
          backgroundImage: `url(${logoGalsen})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-galsen-green/80 to-galsen-blue/80"></div>

        {/* Contenu */}
        <div className="relative h-full flex items-end p-8 md:p-12">
          <div className="text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Devenez investisseur
            </h2>
            <p className="text-lg md:text-xl text-white/90">
              Participez au développement économique du Sénégal en investissant dans des projets innovants
            </p>
          </div>
        </div>
      </div>

      {/* Partie droite - Formulaire */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-2xl">
          {/* Logo mobile */}
          <div className="md:hidden text-center mb-6">
            <img
              src={logoGalsen}
              alt="GALSEN INVEST"
              className="h-16 mx-auto mb-4"
            />
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-galsen-green mb-2">
              {isBusiness ? 'Inscription Entreprise' : 'Inscription Investisseur'}
            </h1>
            <p className="text-galsen-blue/70 text-sm md:text-base">
              {isBusiness 
                ? 'Créez votre compte entreprise pour lever des fonds' 
                : 'Créez votre compte pour commencer à investir'}
            </p>
          </div>

          {/* Stepper */}
          <div className="bg-white rounded-lg shadow-md p-3 md:p-4 mb-4 md:mb-6 border border-galsen-green/10">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((step) => (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-medium text-sm md:text-base ${step <= currentStep ? 'bg-galsen-green text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                      {step}
                    </div>
                    <span className="text-xs mt-1 text-galsen-blue/70 hidden sm:block">
                      {isBusiness ? (
                        <>
                          {step === 1 && 'Entreprise'}
                          {step === 2 && 'Contact'}
                          {step === 3 && 'Localisation'}
                          {step === 4 && 'Détails'}
                        </>
                      ) : (
                        <>
                          {step === 1 && 'Identité'}
                          {step === 2 && 'Contact'}
                          {step === 3 && 'Localisation'}
                          {step === 4 && 'Profil'}
                        </>
                      )}
                    </span>
                  </div>
                  {step < 4 && (
                    <div className={`flex-1 h-1 mx-1 md:mx-2 ${step < currentStep ? 'bg-galsen-green' : 'bg-gray-200'
                      }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Formulaire */}
          <div className="bg-white rounded-2xl shadow-xl p-4 md:p-8 border border-galsen-green/10 max-h-[calc(100vh-280px)] md:max-h-[calc(100vh-240px)] overflow-y-auto">
            {/* Affichage erreur */}
            {(authError || localError) && (
              <div className="mb-4 p-3 bg-galsen-red/10 border border-galsen-red/30 text-galsen-red text-sm rounded-lg">
                {authError || localError}
              </div>
            )}

            <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
              {/* Étape 1: Identité ou Entreprise */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h2 className="text-lg md:text-xl font-bold text-galsen-blue mb-4">
                    {isBusiness ? "Informations de l'entreprise" : "Informations d'identité"}
                  </h2>

                  {isBusiness ? (
                    // Champs Business
                    <>
                      <div>
                        <label className="block text-sm font-medium text-galsen-blue mb-2">
                          Nom de l'entreprise <span className="text-galsen-red">*</span>
                        </label>
                        <input
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-galsen-green/30 rounded-lg focus:ring-2 focus:ring-galsen-green focus:border-galsen-green"
                          placeholder="Galsen Tech SARL"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-galsen-blue mb-2">
                          Nom commercial
                        </label>
                        <input
                          type="text"
                          name="tradeName"
                          value={formData.tradeName}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-galsen-green/30 rounded-lg focus:ring-2 focus:ring-galsen-green focus:border-galsen-green"
                          placeholder="GalsenTech"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-galsen-blue mb-2">
                            Forme juridique <span className="text-galsen-red">*</span>
                          </label>
                          <select
                            name="legalForm"
                            value={formData.legalForm}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-galsen-green/30 rounded-lg focus:ring-2 focus:ring-galsen-green focus:border-galsen-green"
                            required
                          >
                            <option value="SARL">SARL</option>
                            <option value="SA">SA</option>
                            <option value="SAS">SAS</option>
                            <option value="SUARL">SUARL</option>
                            <option value="SNC">SNC</option>
                            <option value="GIE">GIE</option>
                            <option value="ASSOCIATION">Association</option>
                            <option value="OTHER">Autre</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-galsen-blue mb-2">
                            Secteur d'activité <span className="text-galsen-red">*</span>
                          </label>
                          <select
                            name="sectorId"
                            value={formData.sectorId}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-galsen-green/30 rounded-lg focus:ring-2 focus:ring-galsen-green focus:border-galsen-green"
                            required
                          >
                            <option value="">Sélectionnez</option>
                            {sectors?.map(sector => (
                              <option key={sector.id} value={sector.id}>{sector.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </>
                  ) : (
                    // Champs Investor
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-galsen-blue mb-2">
                            Prénom <span className="text-galsen-red">*</span>
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-galsen-green/30 rounded-lg focus:ring-2 focus:ring-galsen-green focus:border-galsen-green"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-galsen-blue mb-2">
                            Nom <span className="text-galsen-red">*</span>
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-galsen-green/30 rounded-lg focus:ring-2 focus:ring-galsen-green focus:border-galsen-green"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-galsen-blue mb-2">
                          Date de naissance <span className="text-galsen-red">*</span>
                        </label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-galsen-green/30 rounded-lg focus:ring-2 focus:ring-galsen-green focus:border-galsen-green"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-galsen-blue mb-2">
                          Nationalité <span className="text-galsen-red">*</span>
                        </label>
                        <select
                          name="nationality"
                          value={formData.nationality}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-galsen-green/30 rounded-lg focus:ring-2 focus:ring-galsen-green focus:border-galsen-green"
                          required
                        >
                          <option value="SN">Sénégal</option>
                          {countries?.map(country => (
                            <option key={country.id} value={country.codeIso}>{country.libelle}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Étape 2: Contact */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h2 className="text-lg md:text-xl font-bold text-galsen-blue mb-4">Informations de contact</h2>

                  <div>
                    <label className="block text-sm font-medium text-galsen-blue mb-2">
                      Email <span className="text-galsen-red">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-galsen-green/30 rounded-lg focus:ring-2 focus:ring-galsen-green focus:border-galsen-green"
                      placeholder="votre.email@exemple.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-galsen-blue mb-2">
                      Téléphone <span className="text-galsen-red">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-galsen-green/30 rounded-lg focus:ring-2 focus:ring-galsen-green focus:border-galsen-green"
                      placeholder="+221771234567"
                      required
                    />
                    <p className="text-xs text-galsen-blue/60 mt-1">Format international avec indicatif pays</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-galsen-blue mb-2">
                      Mot de passe <span className="text-galsen-red">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-galsen-green/30 rounded-lg focus:ring-2 focus:ring-galsen-green focus:border-galsen-green"
                      placeholder="Min. 8 caractères"
                      required
                      minLength={8}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-galsen-blue mb-2">
                      Confirmer le mot de passe <span className="text-galsen-red">*</span>
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-galsen-green/30 rounded-lg focus:ring-2 focus:ring-galsen-green focus:border-galsen-green"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Étape 3: Localisation */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h2 className="text-lg md:text-xl font-bold text-galsen-blue mb-4">Localisation</h2>

                  <div>
                    <label className="block text-sm font-medium text-galsen-blue mb-2">
                      Pays <span className="text-galsen-red">*</span>
                    </label>
                    <select
                      name="countryIsoCode"
                      value={formData.countryIsoCode}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-galsen-green/30 rounded-lg focus:ring-2 focus:ring-galsen-green focus:border-galsen-green"
                      required
                    >
                      <option value="SN">Sénégal</option>
                      {countries?.map(country => (
                        <option key={country.id} value={country.codeIso}>{country.libelle}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-galsen-blue mb-2">
                      Ville <span className="text-galsen-red">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-galsen-green/30 rounded-lg focus:ring-2 focus:ring-galsen-green focus:border-galsen-green"
                      placeholder="Dakar"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-galsen-blue mb-2">
                      Adresse <span className="text-galsen-red">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-galsen-green/30 rounded-lg focus:ring-2 focus:ring-galsen-green focus:border-galsen-green"
                      placeholder="Rue 10, Plateau"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Étape 4: Profil financier ou Détails Business */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <h2 className="text-lg md:text-xl font-bold text-galsen-blue mb-4">
                    {isBusiness ? 'Détails supplémentaires' : 'Profil financier'}
                  </h2>

                  {isBusiness ? (
                    // Champs Business supplémentaires
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-galsen-blue mb-2">
                            N° d'enregistrement
                          </label>
                          <input
                            type="text"
                            name="registrationNumber"
                            value={formData.registrationNumber}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-galsen-green/30 rounded-lg focus:ring-2 focus:ring-galsen-green focus:border-galsen-green"
                            placeholder="SN-DKR-2020-B-12345"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-galsen-blue mb-2">
                            N° fiscal (NINEA)
                          </label>
                          <input
                            type="text"
                            name="taxId"
                            value={formData.taxId}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-galsen-green/30 rounded-lg focus:ring-2 focus:ring-galsen-green focus:border-galsen-green"
                            placeholder="12345678901234"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-galsen-blue mb-2">
                            Date de création
                          </label>
                          <input
                            type="date"
                            name="foundedDate"
                            value={formData.foundedDate}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-galsen-green/30 rounded-lg focus:ring-2 focus:ring-galsen-green focus:border-galsen-green"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-galsen-blue mb-2">
                            Site web
                          </label>
                          <input
                            type="url"
                            name="websiteUrl"
                            value={formData.websiteUrl}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-galsen-green/30 rounded-lg focus:ring-2 focus:ring-galsen-green focus:border-galsen-green"
                            placeholder="https://www.exemple.sn"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-galsen-blue mb-2">
                            Nom du représentant
                          </label>
                          <input
                            type="text"
                            name="representativeName"
                            value={formData.representativeName}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-galsen-green/30 rounded-lg focus:ring-2 focus:ring-galsen-green focus:border-galsen-green"
                            placeholder="Abdoulaye Diop"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-galsen-blue mb-2">
                            Fonction du représentant
                          </label>
                          <input
                            type="text"
                            name="representativeTitle"
                            value={formData.representativeTitle}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-galsen-green/30 rounded-lg focus:ring-2 focus:ring-galsen-green focus:border-galsen-green"
                            placeholder="Gérant"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-galsen-blue mb-2">
                            Nombre d'employés
                          </label>
                          <input
                            type="number"
                            name="employeeCount"
                            value={formData.employeeCount}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-galsen-green/30 rounded-lg focus:ring-2 focus:ring-galsen-green focus:border-galsen-green"
                            placeholder="15"
                            min="0"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-galsen-blue mb-2">
                            Chiffre d'affaires annuel (FCFA)
                          </label>
                          <input
                            type="number"
                            name="annualRevenue"
                            value={formData.annualRevenue}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-galsen-green/30 rounded-lg focus:ring-2 focus:ring-galsen-green focus:border-galsen-green"
                            placeholder="50000000"
                            min="0"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-galsen-blue mb-2">
                          Description de l'entreprise
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full px-4 py-3 border border-galsen-green/30 rounded-lg focus:ring-2 focus:ring-galsen-green focus:border-galsen-green"
                          placeholder="Entreprise spécialisée dans les solutions fintech..."
                          rows={4}
                        />
                      </div>
                    </>
                  ) : (
                    // Champs Investor
                    <>
                      <div>
                        <label className="block text-sm font-medium text-galsen-blue mb-2">
                          Secteur d'activité <span className="text-galsen-red">*</span>
                        </label>
                        <select
                          name="occupation"
                          value={formData.occupation}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-galsen-green/30 rounded-lg focus:ring-2 focus:ring-galsen-green focus:border-galsen-green"
                          required
                        >
                          <option value="">Sélectionnez un secteur</option>
                          {sectors?.map(sector => (
                            <option key={sector.id} value={sector.slug}>{sector.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-galsen-blue mb-2">
                          Tranche de revenus annuels <span className="text-galsen-red">*</span>
                        </label>
                        <select
                          name="incomeBracket"
                          value={formData.incomeBracket}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-galsen-green/30 rounded-lg focus:ring-2 focus:ring-galsen-green focus:border-galsen-green"
                          required
                        >
                          <option value="LOW">Moins de 2 000 000 FCFA</option>
                          <option value="MID">2 000 000 - 10 000 000 FCFA</option>
                          <option value="HIGH">Plus de 10 000 000 FCFA</option>
                        </select>
                      </div>

                      <div className="bg-galsen-green/5 border border-galsen-green/20 rounded-lg p-4 mt-6">
                        <h3 className="font-medium text-galsen-green mb-2 text-sm md:text-base">Niveau KYC initial : L0</h3>
                        <p className="text-xs md:text-sm text-galsen-blue">
                          Après inscription, vous devrez compléter votre vérification KYC pour investir :
                        </p>
                        <ul className="text-xs md:text-sm text-galsen-blue mt-2 space-y-1">
                          <li>• <strong>L1</strong> : CNI ou Passeport → Limite 500 000 FCFA/mois</li>
                          <li>• <strong>L2</strong> : Documents supplémentaires → Limite 5 000 000 FCFA/mois</li>
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Boutons de navigation */}
              <div className="flex items-center justify-between mt-6 md:mt-8 pt-4 border-t border-galsen-green/10">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 border border-galsen-green/30 text-galsen-blue rounded-lg hover:bg-galsen-white transition-colors text-sm md:text-base"
                    disabled={loading}
                  >
                    <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="hidden sm:inline">Précédent</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className="text-galsen-blue hover:text-galsen-green text-sm md:text-base"
                  >
                    ← Retour
                  </button>
                )}

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-galsen-gold hover:bg-galsen-gold/90 text-galsen-blue font-medium rounded-lg transition-colors text-sm md:text-base"
                  >
                    <span className="hidden sm:inline">Suivant</span>
                    <span className="sm:hidden">Suite</span>
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 md:px-6 py-2 md:py-3 bg-galsen-green hover:bg-galsen-green/90 text-white font-medium rounded-lg transition-colors shadow-lg shadow-galsen-green/20 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Inscription...
                      </span>
                    ) : (
                      'Créer mon compte'
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
