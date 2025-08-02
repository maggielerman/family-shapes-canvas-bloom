import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link, Copy, ExternalLink, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SharedLink {
  id: string;
  tree_id: string;
  tree_name: string;
  url: string;
  created_at: string;
  expires_at?: string;
  access_count: number;
  is_active: boolean;
}

interface FamilyTree {
  id: string;
  name: string;
  visibility: string;
}

interface SharedLinksWidgetProps {
  sharedLinks: SharedLink[];
  familyTrees: FamilyTree[];
}

export function SharedLinksWidget({ sharedLinks, familyTrees }: SharedLinksWidgetProps) {
  const { toast } = useToast();

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = (now.getTime() - time.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Link copied",
        description: "Shared link copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="w-5 h-5" />
          Shared Links
        </CardTitle>
        <CardDescription>
          Links you've shared for public and shared trees
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sharedLinks.length > 0 ? (
          <div className="space-y-3">
            {sharedLinks.map((link) => (
              <div key={link.id} className="p-3 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{link.tree_name}</h4>
                  <Badge variant={link.is_active ? "default" : "secondary"}>
                    {link.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={link.url}
                    readOnly
                    className="text-xs h-8"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(link.url)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(link.url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{link.access_count} views</span>
                  <span>Created {formatTimeAgo(link.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Link className="w-12 h-12 mx-auto mb-4" />
            <p>No shared links yet</p>
            <p className="text-xs mt-1">Share your family trees to generate links</p>
          </div>
        )}
        {familyTrees.filter(t => t.visibility === 'private').length > 0 && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Info className="w-4 h-4" />
              <span>You have {familyTrees.filter(t => t.visibility === 'private').length} private trees</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Change visibility to "shared" or "public" to generate shareable links
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 