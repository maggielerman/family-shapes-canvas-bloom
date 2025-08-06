import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Users, 
  UserPlus, 
  Database,
  Heart,
  Image,
  TreePine,
  Settings,
  Globe,
  Shield,
  Link2,
  ArrowDown,
  ArrowRight
} from "lucide-react";

export function OrganizationStructureViewer() {
  return (
    <div className="space-y-8">
      {/* Visual Structure Diagram */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Organization Structure Hierarchy
          </CardTitle>
          <CardDescription>
            Visual representation of how organizations, groups, and users are connected
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* Organization Level */}
            <div className="border-2 border-primary/20 rounded-lg p-6 bg-primary/5">
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">Organization</h3>
                  <p className="text-sm text-muted-foreground">Top-level entity (e.g., "California Cryobank")</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Core Properties:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Name, Type, Description</li>
                    <li>• Subdomain & Custom Domain</li>
                    <li>• Plan (Free/Basic/Premium/Enterprise)</li>
                    <li>• Visibility Settings</li>
                    <li>• Owner & Settings</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Organization Types:</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Sperm Bank</Badge>
                    <Badge variant="outline">Egg Bank</Badge>
                    <Badge variant="outline">Fertility Clinic</Badge>
                    <Badge variant="outline">Donor Community</Badge>
                    <Badge variant="outline">Support Group</Badge>
                    <Badge variant="outline">Research Institution</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Arrow Down */}
            <div className="flex justify-center">
              <ArrowDown className="h-8 w-8 text-muted-foreground" />
            </div>

            {/* Organization Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-dashed">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Organization Memberships
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Users with roles: Owner, Admin, Editor, Viewer
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-dashed">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Organization Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Donor Database, Media Library, Sibling Groups
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-dashed">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Organization Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Privacy, Features, Communication, Branding
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Arrow Down */}
            <div className="flex justify-center">
              <ArrowDown className="h-8 w-8 text-muted-foreground" />
            </div>

            {/* Groups Level */}
            <div className="border-2 border-blue-500/20 rounded-lg p-6 bg-blue-500/5">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold">Groups</h3>
                  <p className="text-sm text-muted-foreground">Sub-divisions within organization (e.g., "Donor 12345 Families")</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Group Properties:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Label, Type, Description</li>
                    <li>• Parent Organization ID</li>
                    <li>• Own Settings & Features</li>
                    <li>• Visibility Controls</li>
                    <li>• Enhanced with Org Features</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Group Types:</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Family</Badge>
                    <Badge variant="secondary">Donor Siblings</Badge>
                    <Badge variant="secondary">Support</Badge>
                    <Badge variant="secondary">Research</Badge>
                    <Badge variant="secondary">Community</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Arrow Down */}
            <div className="flex justify-center">
              <ArrowDown className="h-8 w-8 text-muted-foreground" />
            </div>

            {/* Group Features */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-dashed border-blue-500/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Group Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Users/Persons with roles
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-dashed border-blue-500/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TreePine className="h-4 w-4" />
                    Family Trees
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Group family connections
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-dashed border-blue-500/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Group Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Media, Donors, Siblings
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-dashed border-blue-500/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Group Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Independent configuration
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Schema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Relationships
          </CardTitle>
          <CardDescription>
            Key tables and their relationships in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Organizations Table */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                organizations
              </h4>
              <div className="ml-6 text-sm space-y-1">
                <p className="text-muted-foreground">Primary Fields:</p>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  id, name, type, owner_id, subdomain, plan, settings, visibility
                </code>
              </div>
            </div>

            {/* Groups Table */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                groups
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">belongs to organization</span>
              </h4>
              <div className="ml-6 text-sm space-y-1">
                <p className="text-muted-foreground">Primary Fields:</p>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  id, label, type, organization_id, owner_id, settings, subdomain, plan
                </code>
              </div>
            </div>

            {/* Membership Tables */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Membership Tables
              </h4>
              <div className="ml-6 space-y-2">
                <div>
                  <p className="text-sm font-medium">organization_memberships</p>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    user_id → organization_id (role: owner/admin/editor/viewer)
                  </code>
                </div>
                <div>
                  <p className="text-sm font-medium">group_memberships</p>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    user_id/person_id → group_id (role: owner/admin/editor/viewer/member)
                  </code>
                </div>
              </div>
            </div>

            {/* Resource Tables */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Database className="h-4 w-4" />
                Resource Tables (Organization & Group variants)
              </h4>
              <div className="ml-6 text-sm space-y-1 text-muted-foreground">
                <p>• organization_donor_database & group_donor_database</p>
                <p>• organization_sibling_groups & group_sibling_groups</p>
                <p>• organization_media & group_media</p>
                <p>• organization_invitations & group_invitations</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permission Model */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Permission Model
          </CardTitle>
          <CardDescription>
            How access control works across the hierarchy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Organization Roles</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">Owner</Badge>
                    <span className="text-muted-foreground">Full control, can delete</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>Admin</Badge>
                    <span className="text-muted-foreground">Manage all settings & members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Editor</Badge>
                    <span className="text-muted-foreground">Add/edit content</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Viewer</Badge>
                    <span className="text-muted-foreground">Read-only access</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Group Roles</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">Owner</Badge>
                    <span className="text-muted-foreground">Created the group</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>Admin</Badge>
                    <span className="text-muted-foreground">Manage group settings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Editor</Badge>
                    <span className="text-muted-foreground">Add content to group</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Member</Badge>
                    <span className="text-muted-foreground">Basic member access</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm">
                <strong>Note:</strong> Organization admins automatically have admin access to all groups within their organization.
                Group permissions are independent but respect the organization hierarchy.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}