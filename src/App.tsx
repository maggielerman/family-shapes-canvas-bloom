
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DonorProtectedRoute from "@/components/auth/DonorProtectedRoute";
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";
import SidebarLayout from "@/components/layouts/SidebarLayout";
import MainLayout from "@/components/layouts/MainLayout";

console.log('🎯 App component importing...');

// Lazy load heavy components for better performance
const Index = lazy(() => import("./pages/Index"));
// const About = lazy(() => import("./pages/About")); // Temporarily hidden
const Contact = lazy(() => import("./pages/Contact"));
const Auth = lazy(() => import("./pages/Auth"));
const RecipientDashboard = lazy(() => import("./pages/RecipientDashboard"));
const Organizations = lazy(() => import("./pages/Organizations"));
const OrganizationDashboard = lazy(() => import("./pages/OrganizationDashboard"));
const OrganizationOnboardingPage = lazy(() => import("./pages/OrganizationOnboardingPage"));
const InvitationPage = lazy(() => import("./pages/InvitationPage"));
const GroupDashboard = lazy(() => import("./components/groups/GroupDashboard"));
const Groups = lazy(() => import("./pages/Groups"));
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
const AdminSignIn = lazy(() => import("./pages/AdminSignIn"));
const Settings = lazy(() => import("./pages/Settings"));
const DonorLanding = lazy(() => import("./pages/DonorLanding"));
const RecipientLanding = lazy(() => import("./pages/RecipientLanding"));
const RecipientPrivateBeta = lazy(() => import("./pages/RecipientPrivateBeta"));
const DonorWaitlist = lazy(() => import("./pages/DonorWaitlist"));
const GetStarted = lazy(() => import("./pages/GetStarted"));
const StyleGuide = lazy(() => import("./pages/StyleGuide"));
const DonorAuth = lazy(() => import("./pages/DonorAuth"));
const DonorDashboard = lazy(() => import("./pages/DonorDashboard"));
const DonorProfile = lazy(() => import("./pages/DonorProfile"));
const DonorHealth = lazy(() => import("./pages/DonorHealth"));
const DonorCommunication = lazy(() => import("./pages/DonorCommunicationPlaceholder"));
const DonorPrivacy = lazy(() => import("./pages/DonorPrivacy"));

console.log('🎯 Lazy components loaded...');

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

console.log('🎯 QueryClient created...');

const App = () => {
  console.log('🎯 App component rendering...');
  
  try {
    return (
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
                  {/* <Route path="/about" element={<MainLayout><About /></MainLayout>} /> */}
                  <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/for-donors" element={<MainLayout><DonorLanding /></MainLayout>} />
                  <Route path="/for-recipient-families" element={<MainLayout><RecipientLanding /></MainLayout>} />
                  <Route path="/recipient-private-beta" element={<MainLayout><RecipientPrivateBeta /></MainLayout>} />
                  <Route path="/donor-waitlist" element={<MainLayout><DonorWaitlist /></MainLayout>} />
                  <Route path="/get-started" element={<MainLayout><GetStarted /></MainLayout>} />
                  <Route path="/style-guide" element={<MainLayout><StyleGuide /></MainLayout>} />
                  <Route path="/public/tree/:id" element={<PublicFamilyTree />} />
                  <Route path="/shared/tree/:id" element={<PublicFamilyTree />} />
                  <Route path="/invite/:action/:token" element={<OrganizationInvitePage />} />
                  <Route path="/invite/:action/P/:token" element={<OrganizationInvitePage />} />
                  <Route path="/invitation/:action/:token" element={<InvitationPage />} />
                  <Route path="/donor/auth" element={<DonorAuth />} />
                  
                  {/* Admin routes */}
                  <Route path="/admin/signin" element={<AdminSignIn />} />
                  <Route element={<AdminProtectedRoute />}>
                    <Route path="/admin" element={<Admin />} />
                  </Route>
                  
                  {/* Protected routes with sidebar layout */}
                  <Route path="/dashboard" element={<ProtectedRoute><SidebarLayout><RecipientDashboard /></SidebarLayout></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><SidebarLayout><UserProfile /></SidebarLayout></ProtectedRoute>} />
                  <Route path="/family-trees" element={<ProtectedRoute><SidebarLayout><FamilyTrees /></SidebarLayout></ProtectedRoute>} />
                  <Route path="/family-trees/:id" element={<ProtectedRoute><SidebarLayout><FamilyTreeDetail /></SidebarLayout></ProtectedRoute>} />
                  <Route path="/people" element={<ProtectedRoute><SidebarLayout><People /></SidebarLayout></ProtectedRoute>} />
                  <Route path="/connections" element={<ProtectedRoute><SidebarLayout><Connections /></SidebarLayout></ProtectedRoute>} />
                  <Route path="/media" element={<ProtectedRoute><SidebarLayout><Media /></SidebarLayout></ProtectedRoute>} />
                  <Route path="/share" element={<ProtectedRoute><SidebarLayout><Share /></SidebarLayout></ProtectedRoute>} />
                  <Route path="/organizations" element={<ProtectedRoute><SidebarLayout><Organizations /></SidebarLayout></ProtectedRoute>} />
                  <Route path="/organizations/:id" element={<ProtectedRoute><SidebarLayout><OrganizationDashboard /></SidebarLayout></ProtectedRoute>} />
                  <Route path="/organizations/:id/onboarding" element={<ProtectedRoute><SidebarLayout><OrganizationOnboardingPage /></SidebarLayout></ProtectedRoute>} />
                  <Route path="/organizations/:id/settings" element={<ProtectedRoute><SidebarLayout><OrganizationDashboard /></SidebarLayout></ProtectedRoute>} />
                  <Route path="/groups" element={<ProtectedRoute><SidebarLayout><Groups /></SidebarLayout></ProtectedRoute>} />
                  <Route path="/groups/:id" element={<ProtectedRoute><SidebarLayout><GroupDashboard /></SidebarLayout></ProtectedRoute>} />
                  <Route path="/groups/:id/*" element={<ProtectedRoute><SidebarLayout><GroupDashboard /></SidebarLayout></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><SidebarLayout><Settings /></SidebarLayout></ProtectedRoute>} />

                  {/* Donor portal routes */}
                  <Route path="/donor/dashboard" element={<DonorProtectedRoute><SidebarLayout><DonorDashboard /></SidebarLayout></DonorProtectedRoute>} />
                  <Route path="/donor/profile" element={<DonorProtectedRoute><SidebarLayout><DonorProfile /></SidebarLayout></DonorProtectedRoute>} />
                  <Route path="/donor/health" element={<DonorProtectedRoute><SidebarLayout><DonorHealth /></SidebarLayout></DonorProtectedRoute>} />
                  <Route path="/donor/communication" element={<DonorProtectedRoute><SidebarLayout><DonorCommunication /></SidebarLayout></DonorProtectedRoute>} />
                  <Route path="/donor/privacy" element={<DonorProtectedRoute><SidebarLayout><DonorPrivacy /></SidebarLayout></DonorProtectedRoute>} />
                  
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    );
  } catch (error) {
    console.error('🔥 Error in App component:', error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Application Error</h1>
          <p className="text-gray-600 mb-4">Something went wrong while loading the application.</p>
          <pre className="text-sm text-gray-500 bg-gray-100 p-4 rounded overflow-auto max-w-md">
            {error instanceof Error ? error.message : String(error)}
          </pre>
        </div>
      </div>
    );
  }
};

console.log('🎯 App component defined...');

export default App;
