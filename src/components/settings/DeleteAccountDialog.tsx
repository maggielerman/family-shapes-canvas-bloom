import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DeleteAccountDialogProps {
  children: React.ReactNode;
  userEmail?: string;
}

export function DeleteAccountDialog({ children, userEmail }: DeleteAccountDialogProps) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const expectedText = "DELETE MY ACCOUNT";
  const isConfirmValid = confirmText === expectedText;

  const handleDelete = async () => {
    if (!isConfirmValid) return;

    setIsDeleting(true);
    try {
      // TODO: Implement actual account deletion logic
      // This would typically involve:
      // 1. Deleting all user data
      // 2. Removing user from organizations
      // 3. Deleting the user account
      
      toast({
        title: "Account Deletion Requested",
        description: "Your account deletion request has been submitted. You will receive an email confirmation.",
      });
      
      setOpen(false);
      setConfirmText("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Delete Account
          </DialogTitle>
          <DialogDescription className="text-left">
            This action cannot be undone. This will permanently delete your account,
            all your family trees, connections, and remove you from all organizations.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
            <h4 className="font-semibold text-destructive mb-2">What will be deleted:</h4>
            <ul className="text-sm text-destructive space-y-1">
              <li>• All your family trees and connections</li>
              <li>• Your profile and personal information</li>
              <li>• All uploaded media files</li>
              <li>• Organization memberships</li>
              <li>• Account settings and preferences</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-delete">
              Type <code className="bg-muted px-1 rounded">{expectedText}</code> to confirm:
            </Label>
            <Input
              id="confirm-delete"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type confirmation text"
              className="font-mono"
            />
          </div>

          {userEmail && (
            <div className="text-sm text-muted-foreground">
              Account: {userEmail}
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              setConfirmText("");
            }}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmValid || isDeleting}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? "Deleting..." : "Delete Account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}