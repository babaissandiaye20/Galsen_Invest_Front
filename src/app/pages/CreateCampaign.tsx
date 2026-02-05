import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { mockCategories } from '../data/mockData';
import { ArrowLeft, ArrowRight, Upload, Image as ImageIcon, CheckCircle } from 'lucide-react';

export function CreateCampaign() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    shortDescription: '',
    description: '',
    goalAmount: '',
    minInvestment: '',
    maxInvestment: '',
    startDate: '',
    endDate: ''
  });
  
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [additionalPhotos, setAdditionalPhotos] = useState<string[]>([]);
  
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
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleAdditionalPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdditionalPhotos(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };
  
  const handleSaveDraft = () => {
    alert('Campagne enregistrée comme brouillon !');
    navigate('/business/dashboard');
  };
  
  const handleSubmit = () => {
    alert('Campagne soumise pour validation !');
    navigate('/business/dashboard');
  };
  
  return (
    <Layout userType="business">
      <div>
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/business/dashboard')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Créer une campagne</h1>
          <p className="text-gray-600">Remplissez les informations de votre campagne de financement</p>
        </div>
        
        {/* Stepper */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((step) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                    step <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  <span className="text-xs mt-1 text-gray-600 hidden md:block">
                    {step === 1 && 'Informations'}
                    {step === 2 && 'Objectifs'}
                    {step === 3 && 'Images'}
                    {step === 4 && 'Documents'}
                    {step === 5 && 'Révision'}
                  </span>
                </div>
                {step < 5 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        {/* Formulaire */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Étape 1: Informations de base */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Informations de base</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre de la campagne <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  maxLength={200}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Financement ferme bio au Sénégal"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">{formData.title.length}/200 caractères</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie <span className="text-red-500">*</span>
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Sélectionnez une catégorie</option>
                  {mockCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description courte <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  maxLength={500}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Résumé de votre projet en quelques lignes..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">{formData.shortDescription.length}/500 caractères</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description détaillée <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Décrivez en détail votre projet, vos objectifs, l'impact attendu..."
                  required
                />
              </div>
            </div>
          )}
          
          {/* Étape 2: Objectifs financiers */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Objectifs financiers</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant objectif (FCFA) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="goalAmount"
                  value={formData.goalAmount}
                  onChange={handleChange}
                  min="100000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="10000000"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Investissement minimum (FCFA) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="minInvestment"
                    value={formData.minInvestment}
                    onChange={handleChange}
                    min="1000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="50000"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Investissement maximum (FCFA)
                  </label>
                  <input
                    type="number"
                    name="maxInvestment"
                    value={formData.maxInvestment}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="500000"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de début <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de fin <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              {formData.startDate && formData.endDate && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    Durée de la campagne : {Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24))} jours
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Étape 3: Images */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Images de la campagne</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image de couverture <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                  {coverImage ? (
                    <div className="relative">
                      <img src={coverImage} alt="Couverture" className="max-h-64 mx-auto rounded-lg" />
                      <button
                        onClick={() => setCoverImage(null)}
                        className="absolute top-2 right-2 px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                      >
                        Supprimer
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-700 mb-2">Image de couverture</p>
                      <p className="text-sm text-gray-500 mb-4">Recommandé : 1200x600px, JPG/PNG, max 5MB</p>
                      <label className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg cursor-pointer transition-colors">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photos additionnelles (max 10)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors">
                  <div className="grid grid-cols-5 gap-4 mb-4">
                    {additionalPhotos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                        <button
                          onClick={() => setAdditionalPhotos(additionalPhotos.filter((_, i) => i !== index))}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white text-xs rounded-full hover:bg-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  {additionalPhotos.length < 10 && (
                    <label className="flex flex-col items-center gap-2 cursor-pointer">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-600">Ajouter des photos</span>
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
              <h2 className="text-xl font-bold text-gray-900 mb-4">Documents légaux (optionnel)</h2>
              <p className="text-gray-600 mb-4">Uploadez vos documents légaux pour renforcer la crédibilité de votre campagne</p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-700 mb-4">Business plan, états financiers, licences...</p>
                <label className="inline-block px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg cursor-pointer transition-colors">
                  Choisir des fichiers
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    multiple
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-4">Formats acceptés : PDF, DOC, DOCX</p>
              </div>
            </div>
          )}
          
          {/* Étape 5: Révision */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Révision de la campagne</h2>
              
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Titre</h3>
                  <p className="text-gray-900">{formData.title || 'Non renseigné'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Catégorie</h3>
                  <p className="text-gray-900">
                    {mockCategories.find(c => c.id === formData.categoryId)?.name || 'Non renseignée'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Objectif financier</h3>
                  <p className="text-gray-900">
                    {formData.goalAmount ? `${new Intl.NumberFormat('fr-FR').format(Number(formData.goalAmount))} FCFA` : 'Non renseigné'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Période</h3>
                  <p className="text-gray-900">
                    {formData.startDate && formData.endDate
                      ? `Du ${new Date(formData.startDate).toLocaleDateString('fr-FR')} au ${new Date(formData.endDate).toLocaleDateString('fr-FR')}`
                      : 'Non renseignée'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Image de couverture</h3>
                  {coverImage ? (
                    <img src={coverImage} alt="Aperçu" className="max-h-32 rounded-lg" />
                  ) : (
                    <p className="text-gray-500">Aucune image</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <input type="checkbox" id="certify" className="mt-1" required />
                <label htmlFor="certify" className="text-sm text-blue-900">
                  Je certifie que toutes les informations fournies sont exactes et conformes à la réalité. 
                  Je comprends que toute fausse déclaration peut entraîner le rejet de ma campagne.
                </label>
              </div>
            </div>
          )}
          
          {/* Boutons de navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            {currentStep > 1 && (
              <button
                onClick={handlePrev}
                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Précédent
              </button>
            )}
            
            <div className="flex gap-3 ml-auto">
              <button
                onClick={handleSaveDraft}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Enregistrer comme brouillon
              </button>
              
              {currentStep < 5 ? (
                <button
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Suivant
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <CheckCircle className="w-5 h-5" />
                  Soumettre pour validation
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
