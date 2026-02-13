import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { ChooseUserType } from './pages/ChooseUserType';
import { RegisterInvestor } from './pages/RegisterInvestor';
import { VerifyOTP } from './pages/VerifyOTP';
import { InvestorDashboard } from './pages/InvestorDashboard';
import { InvestorProfile } from './pages/InvestorProfile';
import { InvestorWallet } from './pages/InvestorWallet';
import { CampaignsList } from './pages/CampaignsList';
import { CampaignDetail } from './pages/CampaignDetail';
import { BusinessDashboard } from './pages/BusinessDashboard';
import { BusinessProfile } from './pages/BusinessProfile';
import { BusinessCampaigns } from './pages/BusinessCampaigns';
import { CreateCampaign } from './pages/CreateCampaign';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminValidateCampaigns } from './pages/AdminValidateCampaigns';
import { AdminValidateKYC } from './pages/AdminValidateKYC';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<ChooseUserType />} />
        <Route path="/register/investor" element={<RegisterInvestor />} />
        <Route path="/register/business" element={<RegisterInvestor />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<Login />} />

        {/* Campagnes — accessibles à tous les authentifiés */}
        <Route path="/campaigns" element={<ProtectedRoute><CampaignsList /></ProtectedRoute>} />
        <Route path="/campaigns/:id" element={<ProtectedRoute><CampaignDetail /></ProtectedRoute>} />

        {/* Routes Investisseur */}
        <Route path="/investor/dashboard" element={<ProtectedRoute allowedRoles={['investor']}><InvestorDashboard /></ProtectedRoute>} />
        <Route path="/investor/wallet" element={<ProtectedRoute allowedRoles={['investor']}><InvestorWallet /></ProtectedRoute>} />
        <Route path="/investor/profile" element={<ProtectedRoute allowedRoles={['investor']}><InvestorProfile /></ProtectedRoute>} />
        <Route path="/investor/investments" element={<ProtectedRoute allowedRoles={['investor']}><InvestorDashboard /></ProtectedRoute>} />

        {/* Routes Entreprise */}
        <Route path="/business/dashboard" element={<ProtectedRoute allowedRoles={['business']}><BusinessDashboard /></ProtectedRoute>} />
        <Route path="/business/campaigns" element={<ProtectedRoute allowedRoles={['business']}><BusinessCampaigns /></ProtectedRoute>} />
        <Route path="/business/campaigns/new" element={<ProtectedRoute allowedRoles={['business']}><CreateCampaign /></ProtectedRoute>} />
        <Route path="/business/campaigns/:id" element={<ProtectedRoute allowedRoles={['business']}><BusinessDashboard /></ProtectedRoute>} />
        <Route path="/business/profile" element={<ProtectedRoute allowedRoles={['business']}><BusinessProfile /></ProtectedRoute>} />

        {/* Routes Admin */}
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/campaigns" element={<ProtectedRoute allowedRoles={['admin']}><AdminValidateCampaigns /></ProtectedRoute>} />
        <Route path="/admin/campaigns/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminValidateCampaigns /></ProtectedRoute>} />
        <Route path="/admin/kyc" element={<ProtectedRoute allowedRoles={['admin']}><AdminValidateKYC /></ProtectedRoute>} />
        <Route path="/admin/kyc/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminValidateKYC /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
