import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { submitContactForm } from "@/services/contactService";

const ContactHero = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    emailList: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await submitContactForm(formData);

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Message sent!",
          description: "Thank you for contacting us. We'll get back to you soon.",
        });
        setFormData({ name: "", email: "", subject: "", message: "", emailList: false });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <section className="w-full min-h-screen">
      <div className="grid lg:grid-cols-2">
        {/* Left Column - Hero Copy with Coral Background */}
        <div className="bg-coral-600 px-6 lg:px-12 py-16 lg:py-24 flex items-center justify-center">
          <div className="max-w-lg text-center lg:text-left">
            <div className="mb-6">
              <span className="text-xxs uppercase tracking-widest text-white/80 font-medium">
                Get in Touch
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extralight text-white mb-6 leading-none tracking-tighter">
             We'd love to 
              <br />
              <span className="text-white/90">hear from you.</span>
            </h1>
            
            <div className="mb-8">
            
              <p className="text-lg text-white/90 leading-relaxed font-light">
                Send us a message and we'll respond as soon as possible. We're here to help 
                you connect with your family and answer any questions you might have.
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <Mail className="w-5 h-5 text-white/80" />
              <a 
                href="mailto:hello@familyshapes.com" 
                className="text-white/90 hover:text-white transition-colors"
              >
                hello@familyshapes.com
              </a>
            </div>
          </div>
        </div>

        {/* Right Column - Contact Form with White Background */}
        <div className="bg-white px-6 lg:px-12 py-16 lg:py-24 flex items-center">
          <div className="w-full max-w-md mx-auto">
            <h2 className="text-2xl font-light text-navy-800 mb-8">Send us a Message</h2>
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                  className="mt-1"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="emailList"
                  checked={formData.emailList}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, emailList: checked as boolean }))
                  }
                  disabled={isSubmitting}
                  className="rounded border-coral-700 data-[state=checked]:bg-coral-600 data-[state=checked]:border-coral-600 data-[state=checked]:text-white"
                />
                <Label 
                  htmlFor="emailList" 
                  className="text-sm text-navy-700 cursor-pointer"
                >
                  Subscribe to our email list for updates and news
                </Label>
              </div>
              
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-coral-600 hover:bg-coral-700 text-white py-3"
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactHero; 