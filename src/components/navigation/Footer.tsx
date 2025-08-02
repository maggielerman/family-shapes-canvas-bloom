
import { Link } from "react-router-dom";
import { Logo } from "@/components/logo";

const Footer = () => {
  return (
    <footer className="w-full px-4 sm:px-6 lg:px-12 py-6 bg-navy-900 text-warm-100">
      <div className=" mx-auto flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center">
          <Logo size="sm" className="text-white" linkTo="/" showIcon={true} showText={true} variant="dark" />
        </div>
        
        <p className="text-xs text-white">
          © {new Date().getFullYear()} Family Shapes
        </p>
      </div>
    </footer>
  );
};

export default Footer;
