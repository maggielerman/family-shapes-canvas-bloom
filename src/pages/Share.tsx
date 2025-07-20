
import { useAuth } from "@/components/auth/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Link2, Users, TreePine, Heart } from "lucide-react";

const Share = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Share & Collaborate</h1>
        <p className="text-muted-foreground">
          Share your family trees and collaborate with others to build your family story together.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Share Family Trees */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2 mb-2">
              <TreePine className="w-5 h-5 text-coral-600" />
              <CardTitle className="text-lg">Share Family Trees</CardTitle>
            </div>
            <CardDescription>
              Generate shareable links for your family trees that others can view or collaborate on.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Manage Tree Sharing
            </Button>
          </CardContent>
        </Card>

        {/* Collaboration Invites */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-5 h-5 text-coral-600" />
              <CardTitle className="text-lg">Collaboration</CardTitle>
            </div>
            <CardDescription>
              Invite family members to contribute to your trees and manage collaboration permissions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Invite Collaborators
            </Button>
          </CardContent>
        </Card>

        {/* Public Links */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2 mb-2">
              <Link2 className="w-5 h-5 text-coral-600" />
              <CardTitle className="text-lg">Public Links</CardTitle>
            </div>
            <CardDescription>
              Create public view-only links to share specific parts of your family history.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Link2 className="w-4 h-4 mr-2" />
              Generate Public Links
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sharing Activity */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6 flex items-center">
          <Heart className="w-6 h-6 mr-2 text-coral-600" />
          Recent Sharing Activity
        </h2>
        
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Share2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No sharing activity yet</p>
            <p className="text-sm">
              Start sharing your family trees to see your collaboration history here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Share;
