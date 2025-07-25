
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import SidebarLayout from "@/components/layouts/SidebarLayout";

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
const OrganizationInvitePage = lazy(() => import("./pages/OrganizationInvitePage"));
const PublicFamilyTree = lazy(() => import("./pages/PublicFamilyTree"));
const Media = lazy(() => import("./pages/Media"));
const Share = lazy(() => import("./pages/Share"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Admin = lazy(() => import("./pages/Admin"));
const Settings = lazy(() => import("./pages/Settings"));

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
      cacheTime: 10 * 60 * 1000, // 10 minutes
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
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/public/tree/:id" element={<PublicFamilyTree />} />
              <Route path="/shared/tree/:id" element={<PublicFamilyTree />} />
              <Route path="/invite/:action/:token" element={<OrganizationInvitePage />} />
              <Route path="/invite/:action/P/:token" element={<OrganizationInvitePage />} />
              <Route path="/invitation/:action/:token" element={<InvitationPage />} />
              
              {/* Admin routes */}
              <Route path="/admin" element={<Admin />} />
              
              {/* Protected routes with sidebar layout */}
              <Route path="/dashboard" element={<SidebarLayout><Dashboard /></SidebarLayout>} />
              <Route path="/profile" element={<SidebarLayout><UserProfile /></SidebarLayout>} />
              <Route path="/people" element={<SidebarLayout><People /></SidebarLayout>} />
              <Route path="/family-trees" element={<SidebarLayout><FamilyTrees /></SidebarLayout>} />
              <Route path="/family-trees/:id" element={<SidebarLayout><FamilyTreeDetail /></SidebarLayout>} />
              <Route path="/connections" element={<SidebarLayout><Connections /></SidebarLayout>} />
              <Route path="/media" element={<SidebarLayout><Media /></SidebarLayout>} />
              <Route path="/share" element={<SidebarLayout><Share /></SidebarLayout>} />
              <Route path="/organizations" element={<SidebarLayout><Organizations /></SidebarLayout>} />
              <Route path="/organizations/:id/onboarding" element={<SidebarLayout><OrganizationOnboardingPage /></SidebarLayout>} />
              <Route path="/organizations/:id" element={<SidebarLayout><OrganizationDashboard /></SidebarLayout>} />
              <Route path="/settings" element={<SidebarLayout><Settings /></SidebarLayout>} />

              
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
