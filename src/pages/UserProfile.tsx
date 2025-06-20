
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Heart, Camera, Mail, Phone, MapPin, Calendar } from "lucide-react";

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    bio: "Family-focused professional passionate about creating meaningful connections and building lasting relationships.",
    memberSince: "January 2024"
  });
  const { toast } = useToast();

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "Profile updated!",
      description: "Your profile information has been saved successfully.",
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data if needed
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
          <a href="/contact" className="text-sm text-navy-600 hover:text-coral-600 transition-colors">
            Contact
          </a>
          <a href="/profile" className="text-sm text-coral-600 font-medium">
            Profile
          </a>
        </nav>
      </header>

      <div className="px-6 lg:px-12 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-2xl p-8 mb-8 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src="/placeholder.svg" alt="Profile picture" />
                  <AvatarFallback className="bg-coral-100 text-coral-600 text-2xl">
                    {profileData.firstName.charAt(0)}{profileData.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-coral-600 rounded-full flex items-center justify-center text-white hover:bg-coral-700 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1">
                <h1 className="text-3xl font-light text-navy-800 mb-2">
                  {profileData.firstName} {profileData.lastName}
                </h1>
                <p className="text-navy-600 mb-4">{profileData.bio}</p>
                <div className="flex items-center text-sm text-navy-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  Member since {profileData.memberSince}
                </div>
              </div>
              
              <div className="flex gap-3">
                {!isEditing ? (
                  <Button 
                    onClick={() => setIsEditing(true)}
                    className="bg-coral-600 hover:bg-coral-700 text-white"
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-3">
                    <Button 
                      onClick={handleSave}
                      className="bg-coral-600 hover:bg-coral-700 text-white"
                    >
                      Save Changes
                    </Button>
                    <Button 
                      onClick={handleCancel}
                      variant="outline"
                      className="border-gray-300"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-navy-800">Personal Information</CardTitle>
                <CardDescription>Manage your personal details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-navy-700">First Name</Label>
                    {isEditing ? (
                      <Input
                        id="firstName"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleChange}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-navy-800">{profileData.firstName}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-navy-700">Last Name</Label>
                    {isEditing ? (
                      <Input
                        id="lastName"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleChange}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-navy-800">{profileData.lastName}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email" className="text-navy-700 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleChange}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-navy-800">{profileData.email}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="phone" className="text-navy-700 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleChange}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-navy-800">{profileData.phone}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="location" className="text-navy-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location
                  </Label>
                  {isEditing ? (
                    <Input
                      id="location"
                      name="location"
                      value={profileData.location}
                      onChange={handleChange}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-navy-800">{profileData.location}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* About Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-navy-800">About Me</CardTitle>
                <CardDescription>Share a bit about yourself and your interests</CardDescription>
              </CardHeader>
              <CardContent>
                <Label htmlFor="bio" className="text-navy-700">Biography</Label>
                {isEditing ? (
                  <textarea
                    id="bio"
                    name="bio"
                    value={profileData.bio}
                    onChange={handleChange}
                    rows={6}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-coral-500 focus:border-coral-500"
                  />
                ) : (
                  <p className="mt-1 text-navy-800 leading-relaxed">{profileData.bio}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Account Settings */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-navy-800">Account Settings</CardTitle>
              <CardDescription>Manage your account preferences and security</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <Button variant="outline" className="justify-start">
                  Change Password
                </Button>
                <Button variant="outline" className="justify-start">
                  Privacy Settings
                </Button>
                <Button variant="outline" className="justify-start">
                  Notification Preferences
                </Button>
                <Button variant="outline" className="justify-start text-red-600 border-red-200 hover:bg-red-50">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
