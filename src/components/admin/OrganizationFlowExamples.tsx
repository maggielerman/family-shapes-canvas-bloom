import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  Users, 
  UserPlus,
  ArrowRight,
  Heart,
  TreePine,
  MessageCircle,
  Calendar,
  Mail,
  CheckCircle,
  Shield
} from "lucide-react";

export function OrganizationFlowExamples() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Real-World Usage Examples</CardTitle>
          <CardDescription>
            See how different types of organizations use the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sperm-bank" className="space-y-4">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-4 h-auto">
              <TabsTrigger value="sperm-bank" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Sperm Bank
              </TabsTrigger>
              <TabsTrigger value="fertility-clinic" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Fertility Clinic
              </TabsTrigger>
              <TabsTrigger value="donor-community" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Donor Community
              </TabsTrigger>
              <TabsTrigger value="research" className="flex items-center gap-2">
                <TreePine className="h-4 w-4" />
                Research Institution
              </TabsTrigger>
            </TabsList>

            {/* Sperm Bank Flow */}
            <TabsContent value="sperm-bank" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">California Cryobank Example</h3>
                
                {/* Step 1 */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Create Organization</h4>
                    <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                      <p className="text-sm">Admin creates "California Cryobank" organization</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Type: <Badge variant="outline">Sperm Bank</Badge></li>
                        <li>• Subdomain: <code>california-cryobank.familyshapes.com</code></li>
                        <li>• Plan: <Badge>Enterprise</Badge></li>
                        <li>• Settings: Enable donor database, sibling groups</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Create Donor Groups</h4>
                    <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                      <p className="text-sm">Create groups for each donor number</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="border rounded p-2">
                          <p className="text-sm font-medium">Group: "Donor 12345 Families"</p>
                          <p className="text-xs text-muted-foreground">Type: Donor Siblings, Private</p>
                        </div>
                        <div className="border rounded p-2">
                          <p className="text-sm font-medium">Group: "Donor 67890 Families"</p>
                          <p className="text-xs text-muted-foreground">Type: Donor Siblings, Private</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Families Join Groups</h4>
                    <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                      <p className="text-sm">Families request to join their donor's group</p>
                      <div className="flex items-center gap-2 text-sm">
                        <UserPlus className="h-4 w-4" />
                        <span>Admin verifies donor number and approves membership</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Families can now connect with half-siblings</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                    4
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Group Activities</h4>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="flex items-center gap-2 text-sm">
                          <MessageCircle className="h-4 w-4" />
                          <span>Message other families</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <TreePine className="h-4 w-4" />
                          <span>Build family trees</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4" />
                          <span>Plan meetups</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Fertility Clinic Flow */}
            <TabsContent value="fertility-clinic" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Reproductive Health Center Example</h3>
                
                {/* Step 1 */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Create Clinic Organization</h4>
                    <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                      <p className="text-sm">Clinic creates their organization</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Type: <Badge variant="outline">Fertility Clinic</Badge></li>
                        <li>• Custom domain: <code>portal.reprohealth.com</code></li>
                        <li>• Settings: Enable support groups, forums</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Create Support Groups</h4>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="border rounded p-2">
                          <p className="text-sm font-medium">"IVF Journey 2024"</p>
                          <p className="text-xs text-muted-foreground">Current IVF patients</p>
                        </div>
                        <div className="border rounded p-2">
                          <p className="text-sm font-medium">"IUI Support Circle"</p>
                          <p className="text-xs text-muted-foreground">IUI treatment group</p>
                        </div>
                        <div className="border rounded p-2">
                          <p className="text-sm font-medium">"Success Stories"</p>
                          <p className="text-xs text-muted-foreground">Alumni group</p>
                        </div>
                        <div className="border rounded p-2">
                          <p className="text-sm font-medium">"Male Factor Support"</p>
                          <p className="text-xs text-muted-foreground">Specialized support</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Patient Engagement</h4>
                    <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                      <p className="text-sm">Patients join relevant groups</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Share experiences and tips</li>
                        <li>• Ask questions in forums</li>
                        <li>• Connect with cycle buddies</li>
                        <li>• Access educational resources</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Donor Community Flow */}
            <TabsContent value="donor-community" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Donor Sibling Registry Example</h3>
                
                {/* Step 1 */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Community Setup</h4>
                    <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                      <p className="text-sm">Create donor community organization</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Type: <Badge variant="outline">Donor Community</Badge></li>
                        <li>• Visibility: <Badge>Public</Badge></li>
                        <li>• Enable: Donor database, sibling matching</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Donor Registration</h4>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm">Donors and families register</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="text-sm">
                          <span className="font-medium">500+</span> Donors
                        </div>
                        <ArrowRight className="h-4 w-4" />
                        <div className="text-sm">
                          <span className="font-medium">2,000+</span> Families
                        </div>
                        <ArrowRight className="h-4 w-4" />
                        <div className="text-sm">
                          <span className="font-medium">150+</span> Sibling Groups
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Automatic Matching</h4>
                    <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                      <p className="text-sm">System creates sibling groups automatically</p>
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>Families matched by donor number</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>Privacy controls respected</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Research Institution Flow */}
            <TabsContent value="research" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">University Research Study Example</h3>
                
                {/* Step 1 */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Research Organization</h4>
                    <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                      <p className="text-sm">University creates research organization</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Type: <Badge variant="outline">Research Institution</Badge></li>
                        <li>• Multiple studies as groups</li>
                        <li>• Strict privacy controls</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Study Groups</h4>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="space-y-2">
                        <div className="border rounded p-2">
                          <p className="text-sm font-medium">"Donor Conception Outcomes Study"</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">200 participants</Badge>
                            <Badge variant="outline" className="text-xs">Active</Badge>
                          </div>
                        </div>
                        <div className="border rounded p-2">
                          <p className="text-sm font-medium">"Sibling Relationship Study"</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">75 families</Badge>
                            <Badge variant="outline" className="text-xs">Recruiting</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Data Collection</h4>
                    <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                      <p className="text-sm">Researchers use platform features</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Surveys through group forums</li>
                        <li>• Anonymous data collection</li>
                        <li>• Participant communication</li>
                        <li>• Progress tracking</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Common Workflows */}
      <Card>
        <CardHeader>
          <CardTitle>Common Workflows</CardTitle>
          <CardDescription>
            Typical actions users perform in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Journey */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                New User Journey
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">1</div>
                  <div>
                    <p>User receives invitation email</p>
                    <p className="text-xs text-muted-foreground">Click link with token</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">2</div>
                  <div>
                    <p>Create account or sign in</p>
                    <p className="text-xs text-muted-foreground">Complete profile</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">3</div>
                  <div>
                    <p>Auto-join organization/group</p>
                    <p className="text-xs text-muted-foreground">Based on invitation</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">4</div>
                  <div>
                    <p>Access group resources</p>
                    <p className="text-xs text-muted-foreground">View members, media, etc.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Journey */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Admin Management Flow
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">1</div>
                  <div>
                    <p>Create organization</p>
                    <p className="text-xs text-muted-foreground">Configure settings</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">2</div>
                  <div>
                    <p>Create groups by category</p>
                    <p className="text-xs text-muted-foreground">Donors, years, types</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">3</div>
                  <div>
                    <p>Invite members</p>
                    <p className="text-xs text-muted-foreground">Bulk or individual</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">4</div>
                  <div>
                    <p>Monitor & moderate</p>
                    <p className="text-xs text-muted-foreground">Review activity, content</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}