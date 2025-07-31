
import { Link } from "react-router-dom";
import { Logo } from "@/components/logo";

const Footer = () => {
  return (
    <footer className="w-full px-4 py-6 bg-navy-900 text-warm-100">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <Logo size="sm" className="text-white" linkTo="/" showIcon={true} showText={false} variant="dark" />
          <p className="text-sm text-warm-300">
            Nurturing family connections
          </p>
        </div>
        
        <p className="text-xs text-warm-500">
          © {new Date().getFullYear()} Family Shapes
        </p>
      </div>
    </footer>
  );
};

export default Footer;
