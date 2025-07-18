import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface MainLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

const MainLayout = ({ children, showFooter = true }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 lg:px-8">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default MainLayout;