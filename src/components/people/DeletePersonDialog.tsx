import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Trash2 } from "lucide-react";

interface Person {
  id: string;
  name: string;
  _count?: {
    family_trees: number;
    connections: number;
  };
}

interface DeletePersonDialogProps {
  person: Person;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
}

export function DeletePersonDialog({ person, open, onOpenChange, onConfirmDelete }: DeletePersonDialogProps) {
  const hasConnections = (person._count?.connections || 0) > 0;
  const inTrees = (person._count?.family_trees || 0) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Delete Person
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to permanently delete <strong>{person.name}</strong>?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>This action cannot be undone.</strong> This will permanently delete:
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>The person's profile and all information</li>
                {hasConnections && (
                  <li>{person._count?.connections} family relationship{(person._count?.connections || 0) > 1 ? 's' : ''}</li>
                )}
                {inTrees && (
                  <li>Their presence in {person._count?.family_trees} family tree{(person._count?.family_trees || 0) > 1 ? 's' : ''}</li>
                )}
              </ul>
            </AlertDescription>
          </Alert>

          {(hasConnections || inTrees) && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Alternative:</strong> If you only want to remove this person from a specific family tree 
                without deleting them entirely, use the "Remove from Tree" option in the tree view instead.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirmDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Permanently
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}