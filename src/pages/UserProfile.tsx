
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Mail, Phone, MapPin, Calendar, UserPlus } from "lucide-react";


const UserProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    memberSince: ""
  });
  const { toast } = useToast();

  // Load profile data on mount
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Load from user_profiles table
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (profile) {
        setProfileData({
          firstName: profile.full_name?.split(' ')[0] || '',
          lastName: profile.full_name?.split(' ').slice(1).join(' ') || '',
          email: user.email || '',
          phone: profile.phone || '',
          location: profile.location || '',
          bio: profile.bio || '',
          memberSince: new Date(user.created_at).toLocaleDateString()
        });
      } else {
        // Set default values from auth user
        setProfileData(prev => ({
          ...prev,
          email: user.email || '',
          memberSince: new Date(user.created_at).toLocaleDateString()
        }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Check if profile is empty
  const isProfileEmpty = !profileData.firstName && !profileData.lastName;

  const handleSave = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      const fullName = `${profileData.firstName} ${profileData.lastName}`.trim();
      
      // Upsert profile data
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          phone: profileData.phone,
          location: profileData.location,
          bio: profileData.bio,
        });

      if (error) throw error;

      setIsEditing(false);
      toast({
        title: "Profile updated!",
        description: "Your profile information has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile data",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reload profile data to reset any unsaved changes
    loadProfile();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (loading) {
    return (
      <div className="px-6 lg:px-12 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading profile...</div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state when no profile data
  if (isProfileEmpty && !isEditing) {
    return (
      <div className="px-6 lg:px-12 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="text-center py-16">
            <CardContent>
              <div className="flex flex-col items-center space-y-6">
                <div className="w-24 h-24 bg-coral-100 rounded-full flex items-center justify-center">
                  <UserPlus className="w-12 h-12 text-coral-600" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-light text-navy-800">Complete Your Profile</h2>
                  <p className="text-navy-600 max-w-md">
                    Set up your profile to get started with Family Shapes. Add your personal information to connect with your family network.
                  </p>
                </div>
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="bg-coral-600 hover:bg-coral-700 text-white"
                >
                  Create Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 lg:px-12 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl p-8 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src="/placeholder.svg" alt="Profile picture" />
                <AvatarFallback className="bg-coral-100 text-coral-600 text-2xl">
                  {profileData.firstName?.charAt(0) || "U"}{profileData.lastName?.charAt(0) || ""}
                </AvatarFallback>
              </Avatar>
              <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-coral-600 rounded-full flex items-center justify-center text-white hover:bg-coral-700 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-light text-navy-800 mb-2">
                {profileData.firstName || "Your"} {profileData.lastName || "Name"}
              </h1>
              <p className="text-navy-600 mb-4">{profileData.bio || "Add a bio to tell others about yourself"}</p>
              <div className="flex items-center text-sm text-navy-500">
                <Calendar className="w-4 h-4 mr-2" />
                Member since {profileData.memberSince || "Today"}
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
                    disabled={saving}
                    className="bg-coral-600 hover:bg-coral-700 text-white"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button 
                    onClick={handleCancel}
                    variant="outline"
                    className="border-gray-300"
                    disabled={saving}
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
                      placeholder="Enter your first name"
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-navy-800">{profileData.firstName || "Not provided"}</p>
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
                      placeholder="Enter your last name"
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-navy-800">{profileData.lastName || "Not provided"}</p>
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
                    placeholder="Enter your email address"
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 text-navy-800">{profileData.email || "Not provided"}</p>
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
                    placeholder="Enter your phone number"
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 text-navy-800">{profileData.phone || "Not provided"}</p>
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
                    placeholder="Enter your location"
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 text-navy-800">{profileData.location || "Not provided"}</p>
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
                  placeholder="Tell us about yourself..."
                  rows={6}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-coral-500 focus:border-coral-500"
                />
              ) : (
                <p className="mt-1 text-navy-800 leading-relaxed">{profileData.bio || "No biography provided yet."}</p>
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
  );
};

export default UserProfile;
