
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import SidebarLayout from "@/components/layouts/SidebarLayout";
import MainLayout from "@/components/layouts/MainLayout";

// Lazy load heavy components for better performance
const Index = lazy(() => import("./pages/Index"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Organizations = lazy(() => import("./pages/Organizations"));
const OrganizationDashboard = lazy(() => import("./pages/OrganizationDashboard"));
const OrganizationOnboardingPage = lazy(() => import("./pages/OrganizationOnboardingPage"));
const InvitationPage = lazy(() => import("./pages/InvitationPage"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const FamilyTrees = lazy(() => import("./pages/FamilyTrees"));
const People = lazy(() => import("./pages/People"));
const FamilyTreeDetail = lazy(() => import("./pages/FamilyTreeDetail"));
const Connections = lazy(() => import("./pages/Connections"));
const OrganizationInvitePage = lazy(() => import("./pages/OrganizationInvitePage"));
const PublicFamilyTree = lazy(() => import("./pages/PublicFamilyTree"));
const Media = lazy(() => import("./pages/Media"));
const Share = lazy(() => import("./pages/Share"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Admin = lazy(() => import("./pages/Admin"));
const Settings = lazy(() => import("./pages/Settings"));
const DonorLanding = lazy(() => import("./pages/DonorLanding"));
const RecipientLanding = lazy(() => import("./pages/RecipientLanding"));
const GetStarted = lazy(() => import("./pages/GetStarted"));

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-coral-600"></div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Optimize query caching for better performance
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<MainLayout><Index /></MainLayout>} />
              <Route path="/about" element={<MainLayout><About /></MainLayout>} />
              <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/for-donors" element={<MainLayout><DonorLanding /></MainLayout>} />
              <Route path="/for-recipient-families" element={<MainLayout><RecipientLanding /></MainLayout>} />
              <Route path="/get-started" element={<MainLayout><GetStarted /></MainLayout>} />
              <Route path="/public/tree/:id" element={<PublicFamilyTree />} />
              <Route path="/shared/tree/:id" element={<PublicFamilyTree />} />
              <Route path="/invite/:action/:token" element={<OrganizationInvitePage />} />
              <Route path="/invite/:action/P/:token" element={<OrganizationInvitePage />} />
              <Route path="/invitation/:action/:token" element={<InvitationPage />} />
              
              {/* Admin routes */}
              <Route path="/admin" element={<Admin />} />
              
              {/* Protected routes with sidebar layout */}
              <Route path="/dashboard" element={<ProtectedRoute><SidebarLayout><Dashboard /></SidebarLayout></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><SidebarLayout><UserProfile /></SidebarLayout></ProtectedRoute>} />
              <Route path="/people" element={<ProtectedRoute><SidebarLayout><People /></SidebarLayout></ProtectedRoute>} />
              <Route path="/family-trees" element={<ProtectedRoute><SidebarLayout><FamilyTrees /></SidebarLayout></ProtectedRoute>} />
              <Route path="/family-trees/:id" element={<ProtectedRoute><SidebarLayout><FamilyTreeDetail /></SidebarLayout></ProtectedRoute>} />
              <Route path="/connections" element={<ProtectedRoute><SidebarLayout><Connections /></SidebarLayout></ProtectedRoute>} />
              <Route path="/media" element={<ProtectedRoute><SidebarLayout><Media /></SidebarLayout></ProtectedRoute>} />
              <Route path="/share" element={<ProtectedRoute><SidebarLayout><Share /></SidebarLayout></ProtectedRoute>} />
              <Route path="/organizations" element={<ProtectedRoute><SidebarLayout><Organizations /></SidebarLayout></ProtectedRoute>} />
              <Route path="/organizations/:id/onboarding" element={<ProtectedRoute><SidebarLayout><OrganizationOnboardingPage /></SidebarLayout></ProtectedRoute>} />
              <Route path="/organizations/:id" element={<ProtectedRoute><SidebarLayout><OrganizationDashboard /></SidebarLayout></ProtectedRoute>} />
              <Route path="/organizations/:id/members" element={<ProtectedRoute><SidebarLayout><OrganizationDashboard /></SidebarLayout></ProtectedRoute>} />
              <Route path="/organizations/:id/donors" element={<ProtectedRoute><SidebarLayout><OrganizationDashboard /></SidebarLayout></ProtectedRoute>} />
              <Route path="/organizations/:id/siblings" element={<ProtectedRoute><SidebarLayout><OrganizationDashboard /></SidebarLayout></ProtectedRoute>} />
              <Route path="/organizations/:id/groups" element={<ProtectedRoute><SidebarLayout><OrganizationDashboard /></SidebarLayout></ProtectedRoute>} />
              <Route path="/organizations/:id/trees" element={<ProtectedRoute><SidebarLayout><OrganizationDashboard /></SidebarLayout></ProtectedRoute>} />
              <Route path="/organizations/:id/analytics" element={<ProtectedRoute><SidebarLayout><OrganizationDashboard /></SidebarLayout></ProtectedRoute>} />
              <Route path="/organizations/:id/settings" element={<ProtectedRoute><SidebarLayout><OrganizationDashboard /></SidebarLayout></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SidebarLayout><Settings /></SidebarLayout></ProtectedRoute>} />

              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
