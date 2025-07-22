import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Search,
  Plus,
  Filter,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Users,
  UserPlus,
  MoreHorizontal,
  Download,
  Upload
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Donor, DonorUtils } from "@/types/donor";
import { Person } from "@/types/person";
import { OrganizationDonorDatabase } from "@/types/organization";

interface DonorDatabaseProps {
  organizationId: string;
  canManage: boolean;
}

interface DonorWithDatabase extends Donor {
  database_entry?: OrganizationDonorDatabase;
  person?: Person;
  sibling_count?: number;
}

export function DonorDatabase({ organizationId, canManage }: DonorDatabaseProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [donors, setDonors] = useState<DonorWithDatabase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<DonorWithDatabase | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  useEffect(() => {
    fetchDonors();
  }, [organizationId]);

  const fetchDonors = async () => {
    try {
      setLoading(true);

      // Fetch donors that are in this organization's database
      const { data: orgDonors, error: orgError } = await supabase
        .from('organization_donor_database')
        .select(`
          *,
          donors (
            *,
            persons (*)
          )
        `)
        .eq('organization_id', organizationId);

      if (orgError) throw orgError;

      // Process the data to match our interface
      const processedDonors: DonorWithDatabase[] = (orgDonors || []).map(entry => ({
        ...entry.donors,
        database_entry: entry,
        person: entry.donors?.persons || undefined,
        sibling_count: 0 // We'll fetch this separately if needed
      }));

      setDonors(processedDonors);
    } catch (error) {
      console.error('Error fetching donors:', error);
      toast({
        title: "Error",
        description: "Failed to load donor database",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addDonorToDatabase = async (donorId: string, visibility: string = 'members_only') => {
    if (!canManage) return;

    try {
      const { error } = await supabase
        .from('organization_donor_database')
        .insert({
          organization_id: organizationId,
          donor_id: donorId,
          visibility,
          verification_status: 'unverified'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Donor added to organization database"
      });

      fetchDonors();
    } catch (error) {
      console.error('Error adding donor:', error);
      toast({
        title: "Error",
        description: "Failed to add donor to database",
        variant: "destructive"
      });
    }
  };

  const updateVerificationStatus = async (entryId: string, status: string) => {
    if (!canManage) return;

    try {
      const { error } = await supabase
        .from('organization_donor_database')
        .update({
          verification_status: status,
          verified_by: user?.id,
          verified_at: new Date().toISOString()
        })
        .eq('id', entryId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Verification status updated to ${status}`
      });

      fetchDonors();
    } catch (error) {
      console.error('Error updating verification:', error);
      toast({
        title: "Error",
        description: "Failed to update verification status",
        variant: "destructive"
      });
    }
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-yellow-300 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">Unverified</Badge>;
    }
  };

  const getVisibilityBadge = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return <Badge variant="outline">Public</Badge>;
      case 'admin_only':
        return <Badge variant="secondary"><Shield className="w-3 h-3 mr-1" />Admin Only</Badge>;
      default:
        return <Badge variant="default">Members Only</Badge>;
    }
  };

  const filteredDonors = donors.filter(donor => {
    const matchesSearch = !searchTerm || 
      donor.donor_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donor.sperm_bank?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donor.person?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || donor.database_entry?.verification_status === filterStatus;
    const matchesType = filterType === 'all' || donor.donor_type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Donor Database</h2>
          <p className="text-muted-foreground">
            Manage and search your organization's donor database
          </p>
        </div>
        
        {canManage && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setShowAddDialog(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Donor
            </Button>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by donor number, bank, or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="sperm">Sperm</SelectItem>
                  <SelectItem value="egg">Egg</SelectItem>
                  <SelectItem value="embryo">Embryo</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Donor Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredDonors.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">No donors found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                ? "Try adjusting your search or filters"
                : "Add your first donor to get started"
              }
            </p>
            {canManage && (
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Donor
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDonors.map((donor) => (
            <Card key={donor.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback>
                        {donor.donor_number ? `#${donor.donor_number}` : '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {donor.person?.name || `Donor ${donor.donor_number || 'Unknown'}`}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        {donor.donor_type && (
                          <Badge variant="outline" className="text-xs">
                            {DonorUtils.getDonorTypeLabel(donor.donor_type)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        setSelectedDonor(donor);
                        setShowDetailsDialog(true);
                      }}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      {canManage && (
                        <>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Entry
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {donor.database_entry?.verification_status !== 'verified' && (
                            <DropdownMenuItem 
                              onClick={() => updateVerificationStatus(donor.database_entry!.id, 'verified')}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark Verified
                            </DropdownMenuItem>
                          )}
                          {donor.database_entry?.verification_status !== 'rejected' && (
                            <DropdownMenuItem 
                              onClick={() => updateVerificationStatus(donor.database_entry!.id, 'rejected')}
                              className="text-destructive"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Mark Rejected
                            </DropdownMenuItem>
                          )}
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Verification</span>
                    {getVerificationBadge(donor.database_entry?.verification_status || 'unverified')}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Visibility</span>
                    {getVisibilityBadge(donor.database_entry?.visibility || 'members_only')}
                  </div>

                  {donor.sperm_bank && (
                    <div>
                      <span className="text-sm text-muted-foreground">Bank: </span>
                      <span className="text-sm font-medium">{donor.sperm_bank}</span>
                    </div>
                  )}

                  {donor.donor_number && (
                    <div>
                      <span className="text-sm text-muted-foreground">Number: </span>
                      <span className="text-sm font-medium">#{donor.donor_number}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {donor.sibling_count || 0} known siblings
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Donor Dialog */}
      <AddDonorDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        organizationId={organizationId}
        onDonorAdded={fetchDonors}
      />

      {/* Donor Details Dialog */}
      <DonorDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        donor={selectedDonor}
        canManage={canManage}
        onUpdate={fetchDonors}
      />
    </div>
  );
}

interface AddDonorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  onDonorAdded: () => void;
}

function AddDonorDialog({ open, onOpenChange, organizationId, onDonorAdded }: AddDonorDialogProps) {
  // Implementation for adding donors to the database
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Donor to Database</DialogTitle>
        </DialogHeader>
        <div className="text-center py-8">
          <UserPlus className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Add donor functionality coming soon</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface DonorDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  donor: DonorWithDatabase | null;
  canManage: boolean;
  onUpdate: () => void;
}

function DonorDetailsDialog({ open, onOpenChange, donor, canManage, onUpdate }: DonorDetailsDialogProps) {
  // Implementation for viewing donor details
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {donor?.person?.name || `Donor ${donor?.donor_number || 'Details'}`}
          </DialogTitle>
        </DialogHeader>
        <div className="text-center py-8">
          <Eye className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Detailed donor view coming soon</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DonorDatabase;