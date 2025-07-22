import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/image-upload";
import { supabase } from "@/integrations/supabase/client";
import { CreatePersonData } from "@/types/person";
import { AddDonorDialog } from "./AddDonorDialog";
import { CreateDonorData } from "@/types/donor";

interface AddPersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreatePersonData) => void;
  onDonorSubmit?: (personData: CreatePersonData, donorData: CreateDonorData) => void;
}

export function AddPersonDialog({
  open,
  onOpenChange,
  onSubmit,
  onDonorSubmit,
}: AddPersonDialogProps) {
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("living");
  const [uploadedPhoto, setUploadedPhoto] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDonor, setIsDonor] = useState(false);
  const [donorDialogOpen, setDonorDialogOpen] = useState(false);
  const [pendingPersonData, setPendingPersonData] = useState<CreatePersonData | null>(null);

  const handleImageUploaded = (uploadedFile: any) => {
    setUploadedPhoto(uploadedFile);
  };

  const getPhotoUrl = () => {
    if (!uploadedPhoto) return undefined;
    const { data } = supabase.storage
      .from(uploadedPhoto.bucket_name)
      .getPublicUrl(uploadedPhoto.file_path);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const personData: CreatePersonData = {
      name: name.trim(),
      date_of_birth: dateOfBirth || undefined,
      gender: gender || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      notes: notes.trim() || undefined,
      status,
      profile_photo_url: getPhotoUrl(),
    };

    if (isDonor && onDonorSubmit) {
      // Store person data and open donor dialog
      setPendingPersonData(personData);
      setDonorDialogOpen(true);
    } else {
      setIsSubmitting(true);
      try {
        await onSubmit(personData);
        
        // Reset form
        resetForm();
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const resetForm = () => {
    setName("");
    setDateOfBirth("");
    setGender("");
    setEmail("");
    setPhone("");
    setNotes("");
    setStatus("living");
    setUploadedPhoto(null);
    setIsDonor(false);
  };

  const handleDonorSubmit = async (donorData: CreateDonorData) => {
    if (!pendingPersonData || !onDonorSubmit) return;

    setIsSubmitting(true);
    try {
      await onDonorSubmit(pendingPersonData, donorData);
      setDonorDialogOpen(false);
      setPendingPersonData(null);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Family Member</DialogTitle>
          <DialogDescription>
            Add a new person to your family tree.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Profile Photo</Label>
              <ImageUpload
                onImageUploaded={handleImageUploaded}
                disabled={isSubmitting}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., John Smith"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="living">Living</SelectItem>
                  <SelectItem value="deceased">Deceased</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes about this person"
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Donor Checkbox */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_donor"
                checked={isDonor}
                onChange={(e) => setIsDonor(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="is_donor">This person is a donor</Label>
            </div>
          </div>
          
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()} className="w-full sm:w-auto">
              {isSubmitting ? "Adding..." : "Add Person"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* Donor Dialog */}
      <AddDonorDialog
        open={donorDialogOpen}
        onOpenChange={setDonorDialogOpen}
        onSubmit={handleDonorSubmit}
        isSubmitting={isSubmitting}
      />
    </Dialog>
  );
}