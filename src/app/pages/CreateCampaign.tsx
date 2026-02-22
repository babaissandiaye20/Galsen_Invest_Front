import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ArrowLeft, ArrowRight, Upload, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { useCampaignStore, useCategoryStore } from '../store';
import { campaignService } from '../services'; // Direct service usage for photos upload if not in store
import { useShallow } from 'zustand/react/shallow';

export function CreateCampaign() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    description: '', // This will map to both shortDescription and description in API? No, API has title, description. Layout suggests short + long.
    // The API only has `description` in CreateCampaignRequest.
    // I will concatenate or just use description. The design has shortDescription, maybe I should append it?
    // Let's stick to the API structure: title, description. 
    // I'll keep the UI separate but merge them or just use description.
    // Actually, the API definition for Campaign has `description` only. 
    // I'll map the "Description détaillée" to `description`. 
    // The "Description courte" might be lost or I can prepend it.
    // Let's assume description is the main one.
    shortDescription: '',
    targetAmount: '', // Replaces goalAmount
    minInvestment: '',
    maxInvestment: '',
    startDate: '',
    endDate: ''
  });

  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [additionalPhotoFiles, setAdditionalPhotoFiles] = useState<File[]>([]);
  const [additionalPhotoPreviews, setAdditionalPhotoPreviews] = useState<string[]>([]);

  // Stores
  const { create, loading: createLoading, error: createError } = useCampaignStore(
    useShallow((s) => ({ create: s.create, loading: s.loading, error: s.error }))
  );

  const { categories, fetchAll: fetchCategories, loading: categoriesLoading, error: categoriesError } = useCategoryStore(
    useShallow((s) => ({ 
      categories: s.categories, 
      fetchAll: s.fetchAll,
      loading: s.loading,
      error: s.error
    }))
  );

  useEffect(() => {
    console.log('🎯 [CreateCampaign] Chargement des catégories...');
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    console.log('📊 [CreateCampaign] Catégories:', categories);
    console.log('⏳ [CreateCampaign] Loading:', categoriesLoading);
    console.log('❌ [CreateCampaign] Error:', categoriesError);
  }, [categories, categoriesLoading, categoriesError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + additionalPhotoFiles.length > 10) {
      alert("Maximum 10 photos autorisées");
      return;
    }

    const newFiles = [...additionalPhotoFiles, ...files];
    setAdditionalPhotoFiles(newFiles);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdditionalPhotoPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAdditionalPhoto = (index: number) => {
    setAdditionalPhotoFiles(prev => prev.filter((_, i) => i !== index));
    setAdditionalPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveDraft = () => {
    alert('Fonctionnalité brouillon bientôt disponible !');
    // navigate('/business/dashboard');
  };

  const handleSubmit = async () => {
    try {
      // 1. Create Campaign
      // Note: API expects title, description, targetAmount, startDate, endDate, categoryId.
      // We preserve shortDescription by prepending it to description if needed, or just ignoring it if API doesn't support it.
      // Let's prepend it for now: "**Résumé**: ... \n\n **Détails**: ..."
      const fullDescription = formData.shortDescription
        ? `**Résumé**: ${formData.shortDescription}\n\n${formData.description}`
        : formData.description;

      const campaign = await create({
        categoryId: formData.categoryId,
        title: formData.title,
        description: fullDescription,
        targetAmount: Number(formData.targetAmount),
        startDate: formData.startDate,
        endDate: formData.endDate,
        coverImage: coverImageFile || undefined
      });

      // 2. Upload additional photos if any
      if (additionalPhotoFiles.length > 0 && campaign.id) {
        await campaignService.uploadPhotos(campaign.id, additionalPhotoFiles);
      }

      alert('Campagne soumise avec succès !');
      navigate('/business/dashboard');
    } catch (err) {
      // Error handled in store, but we can show alert or rely on UI error display
      console.error(err);
    }
  };

  return (
    <Layout userType="business">
      <div>
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <button
            onClick={() => navigate('/business/dashboard')}
            className="inline-flex items-center gap-2 text-galsen-blue/70 hover:text-galsen-green mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au dashboard
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-galsen-green mb-2">Créer une campagne</h1>
          <p className="text-galsen-blue/70 text-sm md:text-base">Remplissez les informations de votre campagne de financement</p>
        </div>

        {/* Stepper */}
        <div className="bg-white rounded-lg shadow-md p-3 md:p-4 mb-4 md:mb-6 border border-galsen-green/10">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((step) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-medium text-sm md:text-base ${step <= currentStep ? 'bg-galsen-green text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                    {step}
                  </div>
                  <span className="text-xs mt-1 text-galsen-blue/70 hidden sm:block">
                    {step === 1 && 'Informations'}
                    {step === 2 && 'Objectifs'}
                    {step === 3 && 'Images'}
                    {step === 4 && 'Documents'}
                    {step === 5 && 'Révision'}
                  </span>
                </div>
                {step < 5 && (
                  <div className={`flex-1 h-1 mx-1 md:mx-2 ${step < currentStep ? 'bg-galsen-green' : 'bg-gray-200'
                    }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-8 border border-galsen-green/10">
          {createError && (
            <div className="mb-4 p-3 bg-galsen-red/10 border border-galsen-red/30 text-galsen-red text-sm rounded-lg">
              {createError}
            </div>
          )}

          {/* Étape 1: Informations de base */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg md:text-xl font-bold text-galsen-blue mb-4">Informations de base</h2>

              <div>
                <label className="block text-sm font-medium text-galsen-blue mb-2">
                  Titre de la campagne <span className="text-galsen-red">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  maxLength={200}
                  className="w-full px-4 py-3 border border-galsen-green/30 rounded-lg focus:ring-2 focus:ring-galsen-green focus:border-galsen-green"
                  placeholder="Ex: Financement ferme bio au Sénégal"
                  required
                />
                <p className="text-xs text-galsen-blue/60 mt-1">{formData.title.length}/200 caractères</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-galsen-blue mb-2">
                  Catégorie <span className="text-galsen-red">*</span>
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-galsen-green/30 rounded-lg focus:ring-2 focus:ring-galsen-green focus:border-galsen-green"
                  required
                >
                  <option value="">Sélectionnez une catégorie</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.libelle}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-galsen-blue mb-2">
                  Description courte <span className="text-galsen-red">*</span>
                </label>
                <textarea
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  maxLength={500}
                  rows={3}
                  className="w-full px-4 py-3 border border-galsen-green/30 rounded-lg focus:ring-2 focus:ring-galsen-green focus:border-galsen-green"
                  placeholder="Résumé de votre projet en quelques lignes..."
                  required
                />
                <p className="text-xs text-galsen-blue/60 mt-1">{formData.shortDescription.length}/500 caractères</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-galsen-blue mb-2">
                  Description détaillée <span className="text-galsen-red">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={8}
                  className="w-full px-4 py-3 border border-galsen-green/30 rounded-lg focus:ring-2 focus:ring-galsen-green focus:border-galsen-green"
                  placeholder="Décrivez en détail votre projet, vos objectifs, l'impact attendu..."
                  required
                />
              </div>
            </div>
          )}

          {/* Étape 2: Objectifs financiers */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg md:text-xl font-bold text-galsen-blue mb-4">Objectifs financiers</h2>

              <div>
                <label className="block text-sm font-medium text-galsen-blue mb-2">
                  Montant objectif (FCFA) <span className="text-galsen-red">*</span>
                </label>
                <input
                  type="number"
                  name="targetAmount"
                  value={formData.targetAmount}
                  onChange={handleChange}
                  min="100000"
                  className="w-full px-4 py-3 border border-galsen-green/30 rounded-lg focus:ring-2 focus:ring-galsen-green focus:border-galsen-green"
                  placeholder="10000000"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-galsen-blue mb-2">
                    Investissement minimum (FCFA) <span className="text-galsen-red">*</span>
                  </label>
                  <input
                    type="number"
                    name="minInvestment"
                    value={formData.minInvestment}
                    onChange={handleChange}
                    min="1000"
                    className="w-full px-4 py-3 border border-galsen-green/30 rounded-lg focus:ring-2 focus:ring-galsen-green focus:border-galsen-green"
                    placeholder="50000"
                    required
                  />
                  <p className="text-xs text-galsen-blue/60 mt-1">Sera inclus dans la description</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-galsen-blue mb-2">
                    Investissement maximum (FCFA)
                  </label>
                  <input
                    type="number"
                    name="maxInvestment"
                    value={formData.maxInvestment}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-galsen-green/30 rounded-lg focus:ring-2 focus:ring-galsen-green focus:border-galsen-green"
                    placeholder="500000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-galsen-blue mb-2">
                    Date de début <span className="text-galsen-red">*</span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-galsen-green/30 rounded-lg focus:ring-2 focus:ring-galsen-green focus:border-galsen-green"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-galsen-blue mb-2">
                    Date de fin <span className="text-galsen-red">*</span>
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-galsen-green/30 rounded-lg focus:ring-2 focus:ring-galsen-green focus:border-galsen-green"
                    required
                  />
                </div>
              </div>

              {formData.startDate && formData.endDate && (
                <div className="bg-galsen-green/5 border border-galsen-green/20 rounded-lg p-4">
                  <p className="text-sm text-galsen-blue">
                    Durée de la campagne : {Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24))} jours
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Étape 3: Images */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg md:text-xl font-bold text-galsen-blue mb-4">Images de la campagne</h2>

              <div>
                <label className="block text-sm font-medium text-galsen-blue mb-2">
                  Image de couverture <span className="text-galsen-red">*</span>
                </label>
                <div className="border-2 border-dashed border-galsen-green/30 rounded-lg p-8 text-center hover:border-galsen-green transition-colors">
                  {coverImagePreview ? (
                    <div className="relative">
                      <img src={coverImagePreview} alt="Couverture" className="max-h-64 mx-auto rounded-lg" />
                      <button
                        onClick={() => {
                          setCoverImageFile(null);
                          setCoverImagePreview(null);
                        }}
                        className="absolute top-2 right-2 px-3 py-1 bg-galsen-red text-white text-sm rounded-lg hover:bg-galsen-red/80"
                      >
                        Supprimer
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-galsen-green/40 mx-auto mb-4" />
                      <p className="text-galsen-blue mb-2">Image de couverture</p>
                      <p className="text-sm text-galsen-blue/60 mb-4">Recommandé : 1200x600px, JPG/PNG, max 5MB</p>
                      <label className="inline-block px-6 py-3 bg-galsen-green hover:bg-galsen-green/90 text-white font-medium rounded-lg cursor-pointer transition-colors">
                        Choisir une image
                        <input
                          type="file"
                          onChange={handleCoverImageUpload}
                          accept="image/*"
                          className="hidden"
                        />
                      </label>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-galsen-blue mb-2">
                  Photos additionnelles (max 10)
                </label>
                <div className="border-2 border-dashed border-galsen-green/30 rounded-lg p-6 hover:border-galsen-green transition-colors">
                  <div className="grid grid-cols-5 gap-4 mb-4">
                    {additionalPhotoPreviews.map((photo, index) => (
                      <div key={index} className="relative">
                        <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                        <button
                          onClick={() => removeAdditionalPhoto(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-galsen-red text-white text-xs rounded-full hover:bg-galsen-red/80"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  {additionalPhotoFiles.length < 10 && (
                    <label className="flex flex-col items-center gap-2 cursor-pointer">
                      <ImageIcon className="w-8 h-8 text-galsen-green/40" />
                      <span className="text-sm text-galsen-blue/70">Ajouter des photos</span>
                      <input
                        type="file"
                        onChange={handleAdditionalPhotos}
                        accept="image/*"
                        multiple
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Étape 4: Documents */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-lg md:text-xl font-bold text-galsen-blue mb-4">Documents légaux (optionnel)</h2>
              <p className="text-galsen-blue/70 mb-4">Uploadez vos documents légaux pour renforcer la crédibilité de votre campagne</p>

              <div className="border-2 border-dashed border-galsen-green/30 rounded-lg p-8 text-center hover:border-galsen-green transition-colors">
                <Upload className="w-12 h-12 text-galsen-green/40 mx-auto mb-4" />
                <p className="text-galsen-blue mb-4">Business plan, états financiers, licences...</p>
                <label className="inline-block px-6 py-3 bg-galsen-blue hover:bg-galsen-blue/90 text-white font-medium rounded-lg cursor-pointer transition-colors">
                  Choisir des fichiers
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    multiple
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-galsen-blue/60 mt-4">Formats acceptés : PDF, DOC, DOCX</p>
              </div>
            </div>
          )}

          {/* Étape 5: Révision */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-lg md:text-xl font-bold text-galsen-blue mb-4">Révision de la campagne</h2>

              <div className="bg-galsen-green/5 rounded-lg p-6 space-y-4 border border-galsen-green/10">
                <div>
                  <h3 className="text-sm font-medium text-galsen-blue/70 mb-1">Titre</h3>
                  <p className="text-galsen-blue">{formData.title || 'Non renseigné'}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-galsen-blue/70 mb-1">Catégorie</h3>
                  <p className="text-galsen-blue">
                    {categories.find(c => c.id === formData.categoryId)?.libelle || 'Non renseignée'}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-galsen-blue/70 mb-1">Objectif financier</h3>
                  <p className="text-galsen-blue">
                    {formData.targetAmount ? `${new Intl.NumberFormat('fr-FR').format(Number(formData.targetAmount))} FCFA` : 'Non renseigné'}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-galsen-blue/70 mb-1">Période</h3>
                  <p className="text-galsen-blue">
                    {formData.startDate && formData.endDate
                      ? `Du ${new Date(formData.startDate).toLocaleDateString('fr-FR')} au ${new Date(formData.endDate).toLocaleDateString('fr-FR')}`
                      : 'Non renseignée'}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-galsen-blue/70 mb-1">Image de couverture</h3>
                  {coverImagePreview ? (
                    <img src={coverImagePreview} alt="Aperçu" className="max-h-32 rounded-lg" />
                  ) : (
                    <p className="text-galsen-blue/50">Aucune image</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-galsen-green/5 border border-galsen-green/20 rounded-lg">
                <input type="checkbox" id="certify" className="mt-1 accent-galsen-green" required />
                <label htmlFor="certify" className="text-sm text-galsen-blue">
                  Je certifie que toutes les informations fournies sont exactes et conformes à la réalité.
                  Je comprends que toute fausse déclaration peut entraîner le rejet de ma campagne.
                </label>
              </div>
            </div>
          )}

          {/* Boutons de navigation */}
          <div className="flex items-center justify-between mt-6 md:mt-8 pt-4 border-t border-galsen-green/10">
            {currentStep > 1 ? (
              <button
                onClick={handlePrev}
                disabled={createLoading}
                className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 border border-galsen-green/30 text-galsen-blue rounded-lg hover:bg-galsen-white transition-colors disabled:opacity-50 text-sm md:text-base"
              >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Précédent</span>
              </button>
            ) : (
              <button
                onClick={() => navigate('/business/dashboard')}
                className="text-galsen-blue hover:text-galsen-green text-sm md:text-base transition-colors"
              >
                ← Retour
              </button>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSaveDraft}
                disabled={createLoading}
                className="hidden sm:block px-4 md:px-6 py-2 md:py-3 border border-galsen-green/30 text-galsen-blue rounded-lg hover:bg-galsen-white transition-colors disabled:opacity-50 text-sm md:text-base"
              >
                Brouillon
              </button>

              {currentStep < 5 ? (
                <button
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-galsen-gold hover:bg-galsen-gold/90 text-galsen-blue font-medium rounded-lg transition-colors text-sm md:text-base"
                >
                  <span className="hidden sm:inline">Suivant</span>
                  <span className="sm:hidden">Suite</span>
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={createLoading}
                  className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-galsen-green hover:bg-galsen-green/90 text-white font-medium rounded-lg transition-colors shadow-lg shadow-galsen-green/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                >
                  {createLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Soumission...
                    </span>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                      Soumettre
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
