
import { Heart, Mail, Twitter, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full px-6 lg:px-12 py-16 bg-navy-900 text-warm-100">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coral-500 to-dusty-600 flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="text-2xl font-light tracking-wide text-white">Family Shapes</span>
            </div>
            <p className="text-sm text-warm-300 leading-relaxed font-light max-w-md">
              Thoughtfully designed to nurture family connections and celebrate 
              the unique shapes that love creates within every family.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-medium mb-4 tracking-wide text-white">Product</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-xxs uppercase tracking-wider text-warm-400 hover:text-coral-400 transition-colors">Features</a></li>
              <li><a href="#" className="text-xxs uppercase tracking-wider text-warm-400 hover:text-coral-400 transition-colors">Privacy</a></li>
              <li><a href="#" className="text-xxs uppercase tracking-wider text-warm-400 hover:text-coral-400 transition-colors">Security</a></li>
              <li><a href="#" className="text-xxs uppercase tracking-wider text-warm-400 hover:text-coral-400 transition-colors">Support</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-medium mb-4 tracking-wide text-white">Connect</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-xxs uppercase tracking-wider text-warm-400 hover:text-coral-400 transition-colors">About Us</a></li>
              <li><a href="#" className="text-xxs uppercase tracking-wider text-warm-400 hover:text-coral-400 transition-colors">Blog</a></li>
              <li><a href="#" className="text-xxs uppercase tracking-wider text-warm-400 hover:text-coral-400 transition-colors">Contact</a></li>
              <li><a href="#" className="text-xxs uppercase tracking-wider text-warm-400 hover:text-coral-400 transition-colors">Careers</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-navy-800 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-xxs uppercase tracking-wider text-warm-500 mb-4 md:mb-0">
            © 2024 Family Shapes. Crafted with care.
          </p>
          
          <div className="flex items-center space-x-6">
            <a href="#" className="text-warm-500 hover:text-coral-400 transition-colors">
              <Mail className="w-4 h-4" />
            </a>
            <a href="#" className="text-warm-500 hover:text-coral-400 transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="text-warm-500 hover:text-coral-400 transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
