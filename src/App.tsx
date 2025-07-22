
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthContext";
import SidebarLayout from "@/components/layouts/SidebarLayout";
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Organizations from "./pages/Organizations";
import OrganizationDashboard from "./pages/OrganizationDashboard";
import InvitationPage from "./pages/InvitationPage";
import UserProfile from "./pages/UserProfile";
import FamilyTrees from "./pages/FamilyTrees";
import People from "./pages/People";
import FamilyTreeDetail from "./pages/FamilyTreeDetail";
import OrganizationInvitePage from "./pages/OrganizationInvitePage";
import PublicFamilyTree from "./pages/PublicFamilyTree";
import Media from "./pages/Media";
import Share from "./pages/Share";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/public/tree/:id" element={<PublicFamilyTree />} />
            <Route path="/shared/tree/:id" element={<PublicFamilyTree />} />
            <Route path="/invite/:action/:token" element={<OrganizationInvitePage />} />
            <Route path="/invitation/:action/:token" element={<InvitationPage />} />
            
            {/* Admin routes */}
            <Route path="/admin" element={<Admin />} />
            
            {/* Protected routes with sidebar layout */}
            <Route path="/dashboard" element={<SidebarLayout><Dashboard /></SidebarLayout>} />
            <Route path="/profile" element={<SidebarLayout><UserProfile /></SidebarLayout>} />
            <Route path="/people" element={<SidebarLayout><People /></SidebarLayout>} />
            <Route path="/family-trees" element={<SidebarLayout><FamilyTrees /></SidebarLayout>} />
            <Route path="/family-trees/:id" element={<SidebarLayout><FamilyTreeDetail /></SidebarLayout>} />
            <Route path="/media" element={<SidebarLayout><Media /></SidebarLayout>} />
            <Route path="/share" element={<SidebarLayout><Share /></SidebarLayout>} />
            <Route path="/organizations" element={<SidebarLayout><Organizations /></SidebarLayout>} />
            <Route path="/organizations/:id" element={<SidebarLayout><OrganizationDashboard /></SidebarLayout>} />
            <Route path="/settings" element={<SidebarLayout><Settings /></SidebarLayout>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
