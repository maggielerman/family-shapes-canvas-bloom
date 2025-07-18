
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthContext";
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Organizations from "./pages/Organizations";
import OrganizationDetails from "./pages/OrganizationDetails";
import InvitationPage from "./pages/InvitationPage";
import UserProfile from "./pages/UserProfile";
import FamilyTrees from "./pages/FamilyTrees";
import FamilyTreeDetail from "./pages/FamilyTreeDetail";
import OrganizationInvitePage from "./pages/OrganizationInvitePage";
import PublicFamilyTree from "./pages/PublicFamilyTree";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/organizations" element={<Organizations />} />
            <Route path="/organizations/:id" element={<OrganizationDetails />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/family-trees" element={<FamilyTrees />} />
            <Route path="/family-trees/:id" element={<FamilyTreeDetail />} />
            <Route path="/connections" element={<FamilyTrees />} />
            <Route path="/public/tree/:id" element={<PublicFamilyTree />} />
            <Route path="/shared/tree/:id" element={<PublicFamilyTree />} />
            <Route path="/invite/:action/:token" element={<OrganizationInvitePage />} />
            <Route path="/invitation/:action/:token" element={<InvitationPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
