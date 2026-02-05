import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { mockCountries } from '../data/mockData';
import logoGalsen from '../images/logogalsen_invest.png';

export function RegisterInvestor() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Étape 1: Identité
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: 'SN',

    // Étape 2: Contact
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',

    // Étape 3: Localisation
    countryIsoCode: 'SN',
    city: '',
    address: '',

    // Étape 4: Profil financier
    occupation: '',
    incomeBracket: 'MEDIUM'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Inscription investisseur:', formData);
    navigate('/verify-otp');
  };

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
              Inscription Investisseur
            </h1>
            <p className="text-galsen-blue/70 text-sm md:text-base">
              Créez votre compte pour commencer à investir
            </p>
          </div>

          {/* Stepper */}
          <div className="bg-white rounded-lg shadow-md p-3 md:p-4 mb-4 md:mb-6 border border-galsen-green/10">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((step) => (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-medium text-sm md:text-base ${
                      step <= currentStep ? 'bg-galsen-green text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {step}
                    </div>
                    <span className="text-xs mt-1 text-galsen-blue/70 hidden sm:block">
                      {step === 1 && 'Identité'}
                      {step === 2 && 'Contact'}
                      {step === 3 && 'Localisation'}
                      {step === 4 && 'Profil'}
                    </span>
                  </div>
                  {step < 4 && (
                    <div className={`flex-1 h-1 mx-1 md:mx-2 ${
                      step < currentStep ? 'bg-galsen-green' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Formulaire */}
          <div className="bg-white rounded-2xl shadow-xl p-4 md:p-8 border border-galsen-green/10 max-h-[calc(100vh-280px)] md:max-h-[calc(100vh-240px)] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              {/* Étape 1: Identité */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h2 className="text-lg md:text-xl font-bold text-galsen-blue mb-4">Informations d'identité</h2>

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
                      {mockCountries.map(country => (
                        <option key={country.code} value={country.code}>{country.name}</option>
                      ))}
                    </select>
                  </div>
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
                      {mockCountries.map(country => (
                        <option key={country.code} value={country.code}>{country.name}</option>
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

              {/* Étape 4: Profil financier */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <h2 className="text-lg md:text-xl font-bold text-galsen-blue mb-4">Profil financier</h2>

                  <div>
                    <label className="block text-sm font-medium text-galsen-blue mb-2">
                      Profession <span className="text-galsen-red">*</span>
                    </label>
                    <input
                      type="text"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-galsen-green/30 rounded-lg focus:ring-2 focus:ring-galsen-green focus:border-galsen-green"
                      placeholder="Ex: Ingénieur, Commerçant..."
                      required
                    />
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
                      <option value="MEDIUM">2 000 000 - 10 000 000 FCFA</option>
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
                </div>
              )}

              {/* Boutons de navigation */}
              <div className="flex items-center justify-between mt-6 md:mt-8 pt-4 border-t border-galsen-green/10">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 border border-galsen-green/30 text-galsen-blue rounded-lg hover:bg-galsen-white transition-colors text-sm md:text-base"
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
                    className="px-4 md:px-6 py-2 md:py-3 bg-galsen-green hover:bg-galsen-green/90 text-white font-medium rounded-lg transition-colors shadow-lg shadow-galsen-green/20 text-sm md:text-base"
                  >
                    Créer mon compte
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
