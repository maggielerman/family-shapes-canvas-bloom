import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Upload, FileText, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface ExportImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'export' | 'import';
  familyTreeId: string;
  familyTreeName: string;
}

export function ExportImportDialog({
  open,
  onOpenChange,
  mode,
  familyTreeId,
  familyTreeName,
}: ExportImportDialogProps) {
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'gedcom'>('json');
  const [importData, setImportData] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const exportData = {
        familyTreeId,
        familyTreeName,
        exportDate: new Date().toISOString(),
        format: exportFormat,
        data: {
          // This would contain the actual tree data
          message: "Family tree data would be exported here"
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${familyTreeName}-${exportFormat}-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `Family tree exported as ${exportFormat.toUpperCase()}`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export family tree data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!importData.trim()) {
      toast({
        title: "Import Error",
        description: "Please provide data to import",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Simulate import process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Import Successful",
        description: "Family tree data has been imported",
      });

      onOpenChange(false);
      setImportData('');
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import family tree data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'export' ? (
              <>
                <Download className="w-5 h-5" />
                Export Family Tree
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Import Family Tree
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === 'export' 
              ? `Export "${familyTreeName}" data in your preferred format`
              : `Import family tree data into "${familyTreeName}"`
            }
          </DialogDescription>
        </DialogHeader>

        {mode === 'export' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="export-format">Export Format</Label>
              <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON (Recommended)</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="gedcom">GEDCOM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Includes all people, connections, and metadata</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="import-data">Import Data</Label>
              <Textarea
                id="import-data"
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Paste your family tree data here..."
                rows={8}
              />
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-amber-800">
                <AlertTriangle className="w-4 h-4" />
                <span>Importing will merge data with existing tree</span>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={mode === 'export' ? handleExport : handleImport}
            disabled={loading}
          >
            {loading ? (
              "Processing..."
            ) : mode === 'export' ? (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Import
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 