import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Heart, 
  Dna,
  Save,
  User,
  UserCircle,
  Loader2
} from "lucide-react";

interface Person {
  id: string;
  name: string;
  date_of_birth?: string | null;
  birth_place?: string | null;
  gender?: string | null;
  profile_photo_url?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  preferred_contact_method?: string | null;
  status: string;
  notes?: string | null;
  donor?: boolean;
  used_ivf?: boolean;
  used_iui?: boolean;
  fertility_treatments?: any;
}

interface EditPersonDialogProps {
  person: Person;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPersonUpdated: () => void;
}

export function EditPersonDialog({ person, open, onOpenChange, onPersonUpdated }: EditPersonDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: person.name,
    date_of_birth: person.date_of_birth || "",
    birth_place: person.birth_place || "",
    gender: person.gender || "",
    status: person.status,
    email: person.email || "",
    phone: person.phone || "",
    address: person.address || "",
    preferred_contact_method: person.preferred_contact_method || "email",
    notes: person.notes || "",
    profile_photo_url: person.profile_photo_url || "",
    donor: person.donor || false,
    used_ivf: person.used_ivf || false,
    used_iui: person.used_iui || false
  });

  // Reset form data when person changes
  useEffect(() => {
    setFormData({
      name: person.name,
      date_of_birth: person.date_of_birth || "",
      birth_place: person.birth_place || "",
      gender: person.gender || "",
      status: person.status,
      email: person.email || "",
      phone: person.phone || "",
      address: person.address || "",
      preferred_contact_method: person.preferred_contact_method || "email",
      notes: person.notes || "",
      profile_photo_url: person.profile_photo_url || "",
      donor: person.donor || false,
      used_ivf: person.used_ivf || false,
      used_iui: person.used_iui || false
    });
  }, [person]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const updateData = {
        name: formData.name,
        date_of_birth: formData.date_of_birth || null,
        birth_place: formData.birth_place || null,
        gender: formData.gender || null,
        status: formData.status,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        preferred_contact_method: formData.preferred_contact_method,
        notes: formData.notes || null,
        profile_photo_url: formData.profile_photo_url || null,
        donor: formData.donor,
        used_ivf: formData.used_ivf,
        used_iui: formData.used_iui
      };

      const { error } = await supabase
        .from('persons')
        .update(updateData)
        .eq('id', person.id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Person Updated",
        description: `${formData.name}'s information has been updated successfully`
      });

      onPersonUpdated();
      onOpenChange(false);

    } catch (error) {
      console.error('Error updating person:', error);
      toast({
        title: "Error",
        description: "Failed to update person",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={formData.profile_photo_url || undefined} alt={formData.name} />
              <AvatarFallback className="text-lg font-semibold">
                {getInitials(formData.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-2xl">Edit Person Details</DialogTitle>
              <DialogDescription>
                Update information for {person.name}
              </DialogDescription>
              <div className="flex items-center gap-2 mt-2">
                {formData.gender && (
                  <Badge variant="secondary">
                    {formData.gender}
                  </Badge>
                )}
                <Badge variant={formData.status === 'living' ? 'default' : 'secondary'}>
                  {formData.status}
                </Badge>
                {formData.donor && (
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    <Dna className="h-3 w-3 mr-1" />
                    Donor
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="medical">Medical</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    <User className="h-4 w-4 inline mr-2" />
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gender">
                    <UserCircle className="h-4 w-4 inline mr-2" />
                    Gender
                  </Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non-binary">Non-Binary</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">
                    <Calendar className="h-4 w-4 inline mr-2" />
                    Date of Birth
                  </Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="birth_place">
                    <MapPin className="h-4 w-4 inline mr-2" />
                    Birth Place
                  </Label>
                  <Input
                    id="birth_place"
                    value={formData.birth_place}
                    onChange={(e) => setFormData({ ...formData, birth_place: e.target.value })}
                    placeholder="Enter birth place"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="living">Living</SelectItem>
                      <SelectItem value="deceased">Deceased</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile_photo_url">Profile Photo URL</Label>
                  <Input
                    id="profile_photo_url"
                    value={formData.profile_photo_url}
                    onChange={(e) => setFormData({ ...formData, profile_photo_url: e.target.value })}
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes about this person"
                  rows={3}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="contact" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail className="h-4 w-4 inline mr-2" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    <Phone className="h-4 w-4 inline mr-2" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">
                    <MapPin className="h-4 w-4 inline mr-2" />
                    Address
                  </Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter full address"
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="preferred_contact_method">Preferred Contact Method</Label>
                  <Select value={formData.preferred_contact_method} onValueChange={(value) => setFormData({ ...formData, preferred_contact_method: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="text">Text Message</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="medical" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3 flex items-center">
                    <Heart className="h-4 w-4 mr-2" />
                    Fertility Treatments
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="used_ivf"
                        checked={formData.used_ivf}
                        onCheckedChange={(checked) => setFormData({ ...formData, used_ivf: checked })}
                      />
                      <Label htmlFor="used_ivf">Used IVF (In Vitro Fertilization)</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="used_iui"
                        checked={formData.used_iui}
                        onCheckedChange={(checked) => setFormData({ ...formData, used_iui: checked })}
                      />
                      <Label htmlFor="used_iui">Used IUI (Intrauterine Insemination)</Label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3 flex items-center">
                    <Dna className="h-4 w-4 mr-2" />
                    Donor Information
                  </h4>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="donor"
                      checked={formData.donor}
                      onCheckedChange={(checked) => setFormData({ ...formData, donor: checked })}
                    />
                    <Label htmlFor="donor">This person is a donor</Label>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}