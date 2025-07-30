import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DonorWaitlistFormData {
  fullName: string;
  email: string;
  phone: string;
  age: string;
  location: string;
  education: string;
  occupation: string;
  donorNumber: string;
  facilityName: string;
  facilityLocation: string;
  donorType: string;
  otherDonorType: string;
  availability: string;
  questions: string;
}

interface DonorWaitlistFormProps {
  onSuccess?: () => void;
}

const donorTypes = [
  "Sperm Donor",
  "Egg Donor",
  "Embryo Donor",
  "Surrogate",
  "Other"
];

const educationLevels = [
  "High School",
  "Some College",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctorate",
  "Other"
];

const previousDonationOptions = [
  "Never donated before",
  "Previously donated sperm",
  "Previously donated eggs",
  "Previously donated embryos",
  "Previously been a surrogate",
  "Other"
];

export default function DonorWaitlistForm({ 
  onSuccess
}: DonorWaitlistFormProps) {
  const [formData, setFormData] = useState<DonorWaitlistFormData>({
    fullName: "",
    email: "",
    phone: "",
    age: "",
    location: "",
    education: "",
    occupation: "",
    donorNumber: "",
    facilityName: "",
    facilityLocation: "",
    donorType: "",
    otherDonorType: "",
    availability: "",
    questions: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const donorTypeDisplay = formData.donorType === "Other" 
        ? formData.otherDonorType 
        : formData.donorType;

      const { error } = await supabase.functions.invoke('send-contact-form', {
        body: {
          name: formData.fullName,
          email: formData.email,
          subject: "Donor Waitlist Request",
          message: `Name: ${formData.fullName}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nAge: ${formData.age}\nLocation: ${formData.location}\nEducation: ${formData.education}\nOccupation: ${formData.occupation}\n\nDonor Number: ${formData.donorNumber}\nFacility Name: ${formData.facilityName}\nFacility Location: ${formData.facilityLocation}\n\nDonor Type: ${donorTypeDisplay}\n\nAvailability: ${formData.availability || 'Not specified'}\n\nQuestions: ${formData.questions || 'None'}`
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Thank you!",
        description: "We've received your donor waitlist request and will contact you when donor features are available.",
      });

      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        age: "",
        location: "",
        education: "",
        occupation: "",
        donorNumber: "",
        facilityName: "",
        facilityLocation: "",
        donorType: "",
        otherDonorType: "",
        availability: "",
        questions: ""
      });

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting donor waitlist form:', error);
      toast({
        title: "Error",
        description: "Failed to submit your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="responsive-text-lg flex items-center gap-2">
          <Clock className="w-5 h-5 text-coral-600" />
          Join the Donor Waitlist
        </CardTitle>
        <CardDescription className="responsive-text-sm">
          Be among the first to access our donor features when they launch.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Required Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-navy-800">Required Information</h3>
            
            {/* Line 1: Full Name and Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Line 2: Donor Number and Facility Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="donorNumber">Donor Number *</Label>
                <Input
                  id="donorNumber"
                  value={formData.donorNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, donorNumber: e.target.value }))}
                  required
                  placeholder="12345"
                />
              </div>
              <div>
                <Label htmlFor="facilityName">Facility Name *</Label>
                <Input
                  id="facilityName"
                  value={formData.facilityName}
                  onChange={(e) => setFormData(prev => ({ ...prev, facilityName: e.target.value }))}
                  required
                  placeholder="United Cryobank"
                />
              </div>
            </div>

            {/* Line 3: Facility Location */}
            <div>
              <Label htmlFor="facilityLocation">Facility Location *</Label>
              <Input
                id="facilityLocation"
                value={formData.facilityLocation}
                onChange={(e) => setFormData(prev => ({ ...prev, facilityLocation: e.target.value }))}
                required
                placeholder="City, State/Province, Country"
              />
            </div>

            {/* Line 4: Donor Type */}
            <div>
              <Label htmlFor="donorType">Donor Type *</Label>
              <Select 
                value={formData.donorType} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, donorType: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your donor type" />
                </SelectTrigger>
                <SelectContent>
                  {donorTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Conditional field for "Other" donor type */}
            {formData.donorType === "Other" && (
              <div>
                <Label htmlFor="otherDonorType">Please specify your donor type *</Label>
                <Input
                  id="otherDonorType"
                  value={formData.otherDonorType}
                  onChange={(e) => setFormData(prev => ({ ...prev, otherDonorType: e.target.value }))}
                  required
                  placeholder="Enter your donor type"
                />
              </div>
            )}
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-navy-800">Additional Information</h3>
            
            {/* Line 1: Phone and Age */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  placeholder="36"
                  min="18"
                  max="100"
                />
              </div>
            </div>

            {/* Line 2: Location and Education */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="City, State/Province, Country"
                />
              </div>
              <div>
                <Label htmlFor="education">Education Level</Label>
                <Select 
                  value={formData.education} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, education: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your education level" />
                  </SelectTrigger>
                  <SelectContent>
                    {educationLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Line 3: Occupation */}
            <div>
              <Label htmlFor="occupation">Occupation</Label>
              <Input
                id="occupation"
                value={formData.occupation}
                onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                placeholder="Enter your occupation"
              />
            </div>

            {/* Line 4: Availability */}
            <div>
              <Label htmlFor="availability">Availability and Timeline</Label>
              <Textarea
                id="availability"
                value={formData.availability}
                onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value }))}
                placeholder="When would you be available to start? Any specific timeline or preferences?"
                rows={2}
              />
            </div>

            {/* Line 5: Questions */}
            <div>
              <Label htmlFor="questions">Questions or Concerns</Label>
              <Textarea
                id="questions"
                value={formData.questions}
                onChange={(e) => setFormData(prev => ({ ...prev, questions: e.target.value }))}
                placeholder="Any questions you have about the donation process, privacy, or other concerns..."
                rows={3}
              />
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Submitting..." : "Join Donor Waitlist"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 