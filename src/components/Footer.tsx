
import { Heart, Mail, Twitter, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full px-4 sm:px-6 lg:px-12 py-12 sm:py-14 lg:py-16 bg-navy-900 text-warm-100">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 mb-8 sm:mb-10 lg:mb-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4 sm:mb-6">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-coral-500 to-dusty-600 flex items-center justify-center">
                <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-light tracking-wide text-white">Family Shapes</span>
            </div>
            <p className="text-sm text-warm-300 leading-relaxed font-light max-w-md">
              Thoughtfully designed to nurture family connections and celebrate 
              the unique shapes that love creates within every family.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-medium mb-3 sm:mb-4 tracking-wide text-white">Product</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li><a href="#" className="text-xs sm:text-xxs uppercase tracking-wider text-warm-400 hover:text-coral-400 transition-colors">Features</a></li>
              <li><a href="#" className="text-xs sm:text-xxs uppercase tracking-wider text-warm-400 hover:text-coral-400 transition-colors">Privacy</a></li>
              <li><a href="#" className="text-xs sm:text-xxs uppercase tracking-wider text-warm-400 hover:text-coral-400 transition-colors">Security</a></li>
              <li><a href="#" className="text-xs sm:text-xxs uppercase tracking-wider text-warm-400 hover:text-coral-400 transition-colors">Support</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-medium mb-3 sm:mb-4 tracking-wide text-white">Connect</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li><a href="#" className="text-xs sm:text-xxs uppercase tracking-wider text-warm-400 hover:text-coral-400 transition-colors">About Us</a></li>
              <li><a href="#" className="text-xs sm:text-xxs uppercase tracking-wider text-warm-400 hover:text-coral-400 transition-colors">Blog</a></li>
              <li><a href="#" className="text-xs sm:text-xxs uppercase tracking-wider text-warm-400 hover:text-coral-400 transition-colors">Contact</a></li>
              <li><a href="#" className="text-xs sm:text-xxs uppercase tracking-wider text-warm-400 hover:text-coral-400 transition-colors">Careers</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-navy-800 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <p className="text-xs sm:text-xxs uppercase tracking-wider text-warm-500 text-center sm:text-left">
            © 2024 Family Shapes. Crafted with care.
          </p>
          
          <div className="flex items-center space-x-4 sm:space-x-6">
            <a href="#" className="text-warm-500 hover:text-coral-400 transition-colors p-2 -m-2">
              <Mail className="w-4 h-4" />
            </a>
            <a href="#" className="text-warm-500 hover:text-coral-400 transition-colors p-2 -m-2">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="text-warm-500 hover:text-coral-400 transition-colors p-2 -m-2">
              <Instagram className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
