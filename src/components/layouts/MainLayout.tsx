import Header from "@/components/navigation/Header";
import Footer from "@/components/navigation/Footer";

interface MainLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

const MainLayout = ({ children, showFooter = true }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default MainLayout;