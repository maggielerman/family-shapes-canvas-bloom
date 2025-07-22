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

interface CreateFamilyTreeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name: string;
    description: string;
    visibility: 'private' | 'shared' | 'public';
  }) => void;
}

export function CreateFamilyTreeDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateFamilyTreeDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<'private' | 'shared' | 'public'>('private');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        visibility,
      });
      
      // Reset form
      setName("");
      setDescription("");
      setVisibility('private');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Family Tree</DialogTitle>
          <DialogDescription>
            Create a new family tree to start mapping your family relationships.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Smith Family Tree"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description of your family tree"
                rows={3}
                className="resize-none"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="visibility">Visibility</Label>
              <Select value={visibility} onValueChange={(value: 'private' | 'shared' | 'public') => setVisibility(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">
                    <div className="text-left">
                      <div className="font-medium">Private</div>
                      <div className="text-xs text-muted-foreground">Only you can see this tree</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="shared">
                    <div className="text-left">
                      <div className="font-medium">Shared</div>
                      <div className="text-xs text-muted-foreground">People you invite can see this tree</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="public">
                    <div className="text-left">
                      <div className="font-medium">Public</div>
                      <div className="text-xs text-muted-foreground">Anyone can view this tree</div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
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
              {isSubmitting ? "Creating..." : "Create Tree"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}