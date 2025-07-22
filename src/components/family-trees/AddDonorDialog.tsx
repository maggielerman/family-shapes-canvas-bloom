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
import { Checkbox } from "@/components/ui/checkbox";
import { CreateDonorData } from "@/types/donor";

interface AddDonorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateDonorData) => void;
  isSubmitting?: boolean;
}

export function AddDonorDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: AddDonorDialogProps) {
  const [donorData, setDonorData] = useState<CreateDonorData>({
    donor_number: '',
    sperm_bank: '',
    donor_type: 'sperm',
    is_anonymous: true,
    height: '',
    weight: '',
    eye_color: '',
    hair_color: '',
    ethnicity: '',
    blood_type: '',
    education_level: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(donorData);
  };

  const handleReset = () => {
    setDonorData({
      donor_number: '',
      sperm_bank: '',
      donor_type: 'sperm',
      is_anonymous: true,
      height: '',
      weight: '',
      eye_color: '',
      hair_color: '',
      ethnicity: '',
      blood_type: '',
      education_level: '',
      notes: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Donor Information</DialogTitle>
          <DialogDescription>
            Add detailed information about the donor.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="donor_number">Donor Number</Label>
                <Input
                  id="donor_number"
                  value={donorData.donor_number || ''}
                  onChange={(e) => setDonorData(prev => ({ ...prev, donor_number: e.target.value }))}
                  placeholder="e.g., D12345"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="sperm_bank">Sperm Bank</Label>
                <Input
                  id="sperm_bank"
                  value={donorData.sperm_bank || ''}
                  onChange={(e) => setDonorData(prev => ({ ...prev, sperm_bank: e.target.value }))}
                  placeholder="e.g., California Cryobank"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="donor_type">Donor Type</Label>
                <Select 
                  value={donorData.donor_type || 'sperm'} 
                  onValueChange={(value) => setDonorData(prev => ({ ...prev, donor_type: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sperm">Sperm</SelectItem>
                    <SelectItem value="egg">Egg</SelectItem>
                    <SelectItem value="embryo">Embryo</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="blood_type">Blood Type</Label>
                <Select 
                  value={donorData.blood_type || ''} 
                  onValueChange={(value) => setDonorData(prev => ({ ...prev, blood_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Physical Characteristics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  value={donorData.height || ''}
                  onChange={(e) => setDonorData(prev => ({ ...prev, height: e.target.value }))}
                  placeholder="e.g., 6'0&quot;"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="weight">Weight</Label>
                <Input
                  id="weight"
                  value={donorData.weight || ''}
                  onChange={(e) => setDonorData(prev => ({ ...prev, weight: e.target.value }))}
                  placeholder="e.g., 180 lbs"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="ethnicity">Ethnicity</Label>
                <Input
                  id="ethnicity"
                  value={donorData.ethnicity || ''}
                  onChange={(e) => setDonorData(prev => ({ ...prev, ethnicity: e.target.value }))}
                  placeholder="e.g., Caucasian"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="eye_color">Eye Color</Label>
                <Input
                  id="eye_color"
                  value={donorData.eye_color || ''}
                  onChange={(e) => setDonorData(prev => ({ ...prev, eye_color: e.target.value }))}
                  placeholder="e.g., Blue"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="hair_color">Hair Color</Label>
                <Input
                  id="hair_color"
                  value={donorData.hair_color || ''}
                  onChange={(e) => setDonorData(prev => ({ ...prev, hair_color: e.target.value }))}
                  placeholder="e.g., Brown"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="education_level">Education Level</Label>
              <Select 
                value={donorData.education_level || ''} 
                onValueChange={(value) => setDonorData(prev => ({ ...prev, education_level: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select education level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high_school">High School</SelectItem>
                  <SelectItem value="some_college">Some College</SelectItem>
                  <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                  <SelectItem value="masters">Master's Degree</SelectItem>
                  <SelectItem value="doctorate">Doctorate</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Anonymity */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_anonymous"
                checked={donorData.is_anonymous || false}
                onCheckedChange={(checked) => setDonorData(prev => ({ ...prev, is_anonymous: checked as boolean }))}
              />
              <Label htmlFor="is_anonymous">Anonymous Donor</Label>
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={donorData.notes || ''}
                onChange={(e) => setDonorData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about the donor..."
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
          
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Reset
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? "Adding..." : "Add Donor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 