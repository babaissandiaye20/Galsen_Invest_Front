import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import { CreateCampaign } from './pages/CreateCampaign';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminValidateCampaigns } from './pages/AdminValidateCampaigns';
import { AdminValidateKYC } from './pages/AdminValidateKYC';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Page de connexion par défaut */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        {/* Routes d'inscription */}
        <Route path="/register" element={<ChooseUserType />} />
        <Route path="/register/investor" element={<RegisterInvestor />} />
        <Route path="/register/business" element={<RegisterInvestor />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<Login />} />
        
        {/* Routes Investisseur */}
        <Route path="/investor/dashboard" element={<InvestorDashboard />} />
        <Route path="/investor/wallet" element={<InvestorWallet />} />
        <Route path="/investor/profile" element={<InvestorProfile />} />
        <Route path="/investor/investments" element={<InvestorDashboard />} />
        
        {/* Routes Campagnes */}
        <Route path="/campaigns" element={<CampaignsList />} />
        <Route path="/campaigns/:id" element={<CampaignDetail />} />
        
        {/* Routes Entreprise */}
        <Route path="/business/dashboard" element={<BusinessDashboard />} />
        <Route path="/business/campaigns" element={<BusinessDashboard />} />
        <Route path="/business/campaigns/new" element={<CreateCampaign />} />
        <Route path="/business/campaigns/:id" element={<BusinessDashboard />} />
        <Route path="/business/profile" element={<BusinessDashboard />} />
        
        {/* Routes Admin */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/campaigns" element={<AdminValidateCampaigns />} />
        <Route path="/admin/campaigns/:id" element={<AdminValidateCampaigns />} />
        <Route path="/admin/kyc" element={<AdminValidateKYC />} />
        <Route path="/admin/kyc/:id" element={<AdminValidateKYC />} />
        <Route path="/admin/users" element={<AdminDashboard />} />
        
        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}