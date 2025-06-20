
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Heart } from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message sent!",
      description: "Thank you for contacting us. We'll get back to you soon.",
    });
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="w-full px-6 lg:px-12 py-8 flex items-center justify-between bg-white border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coral-400 to-dusty-500 flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <span className="text-2xl font-light tracking-wide text-navy-800">Family Shapes</span>
        </div>
        
        <nav className="flex items-center space-x-8">
          <a href="/" className="text-sm text-navy-600 hover:text-coral-600 transition-colors">
            Home
          </a>
          <a href="/about" className="text-sm text-navy-600 hover:text-coral-600 transition-colors">
            About
          </a>
          <a href="/contact" className="text-sm text-coral-600 font-medium">
            Contact
          </a>
          <a href="/signin" className="text-sm text-navy-600 hover:text-coral-600 transition-colors">
            Sign In
          </a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="px-6 lg:px-12 py-20 text-center">
        <h1 className="text-5xl lg:text-6xl font-light text-navy-800 mb-6">
          Get in <span className="text-coral-600">Touch</span>
        </h1>
        <p className="text-lg text-navy-600 max-w-2xl mx-auto leading-relaxed">
          We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>
      </section>

      {/* Contact Section */}
      <section className="px-6 lg:px-12 py-16">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div className="space-y-12">
            <div>
              <h2 className="text-3xl font-light text-navy-800 mb-8">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-coral-100 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-coral-600" />
                  </div>
                  <div>
                    <p className="font-medium text-navy-800">Email</p>
                    <p className="text-navy-600">hello@familyshapes.com</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-coral-100 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-coral-600" />
                  </div>
                  <div>
                    <p className="font-medium text-navy-800">Phone</p>
                    <p className="text-navy-600">+1 (555) 123-4567</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-coral-100 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-coral-600" />
                  </div>
                  <div>
                    <p className="font-medium text-navy-800">Address</p>
                    <p className="text-navy-600">123 Family Street<br />San Francisco, CA 94102</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-50 p-8 rounded-2xl">
            <h3 className="text-2xl font-light text-navy-800 mb-6">Send us a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-navy-700">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-navy-700">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="subject" className="text-navy-700">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="message" className="text-navy-700">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="mt-1"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-coral-600 hover:bg-coral-700 text-white py-3"
              >
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
