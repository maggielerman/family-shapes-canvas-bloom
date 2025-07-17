import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Heart, Baby, Dna } from "lucide-react";
import { AddPersonDialog } from "./AddPersonDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Person {
  id: string;
  name: string;
  date_of_birth?: string | null;
  gender?: string | null;
  profile_photo_url?: string | null;
  status: string;
  family_tree_id?: string | null;
}

interface Connection {
  id: string;
  from_person_id: string;
  to_person_id: string;
  relationship_type: string;
  family_tree_id?: string | null;
}

interface D3Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  gender?: string | null;
  status: string;
  profile_photo_url?: string | null;
  date_of_birth?: string | null;
}

interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  id: string;
  relationship_type: string;
  source: D3Node;
  target: D3Node;
}

interface FamilyTreeVisualizationProps {
  familyTreeId: string;
  persons: Person[];
  onPersonAdded: () => void;
}

export function FamilyTreeVisualization({ familyTreeId, persons, onPersonAdded }: FamilyTreeVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [addPersonDialogOpen, setAddPersonDialogOpen] = useState(false);
  const [selectedPersonIds, setSelectedPersonIds] = useState<string[]>([]);
  const [connectionType, setConnectionType] = useState<string>("");
  const { toast } = useToast();

  const relationshipTypes = [
    { value: "parent", label: "Parent", icon: Users, color: "bg-blue-100 text-blue-800" },
    { value: "child", label: "Child", icon: Baby, color: "bg-green-100 text-green-800" },
    { value: "partner", label: "Partner", icon: Heart, color: "bg-pink-100 text-pink-800" },
    { value: "sibling", label: "Sibling", icon: Users, color: "bg-purple-100 text-purple-800" },
    { value: "donor", label: "Donor", icon: Dna, color: "bg-orange-100 text-orange-800" },
    { value: "half_sibling", label: "Half Sibling", icon: Users, color: "bg-indigo-100 text-indigo-800" },
  ];

  useEffect(() => {
    fetchConnections();
  }, [familyTreeId]);

  useEffect(() => {
    if (persons.length > 0) {
      renderVisualization();
    }
  }, [persons, connections]);

  const fetchConnections = async () => {
    try {
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .eq('family_tree_id', familyTreeId);

      if (error) throw error;
      setConnections(data || []);
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const renderVisualization = () => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    if (persons.length === 0) return;

    const width = 800;
    const height = 600;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    svg.attr("width", width).attr("height", height);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Create nodes and links data
    const nodes: D3Node[] = persons.map(person => ({
      id: person.id,
      name: person.name,
      gender: person.gender,
      status: person.status,
      profile_photo_url: person.profile_photo_url,
      date_of_birth: person.date_of_birth,
    }));

    const links: D3Link[] = connections.map(connection => ({
      id: connection.id,
      relationship_type: connection.relationship_type,
      source: nodes.find(n => n.id === connection.from_person_id)!,
      target: nodes.find(n => n.id === connection.to_person_id)!,
    })).filter(link => link.source && link.target);

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink<D3Node, D3Link>(links).id(d => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-800))
      .force("center", d3.forceCenter((width - margin.left - margin.right) / 2, (height - margin.top - margin.bottom) / 2))
      .force("collision", d3.forceCollide().radius(60));

    // Create arrow markers for different relationship types
    const defs = svg.append("defs");
    
    relationshipTypes.forEach(type => {
      defs.append("marker")
        .attr("id", `arrow-${type.value}`)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 25)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("class", "fill-current")
        .style("fill", getRelationshipColor(type.value));
    });

    // Create links
    const link = g.append("g")
      .attr("class", "links")
      .selectAll("path")
      .data(links)
      .enter()
      .append("path")
      .attr("class", "link")
      .style("stroke", d => getRelationshipColor(d.relationship_type))
      .style("stroke-width", 3)
      .style("fill", "none")
      .style("stroke-linecap", "round")
      .attr("marker-end", d => `url(#arrow-${d.relationship_type})`);

    // Create link labels
    const linkLabels = g.append("g")
      .attr("class", "link-labels")
      .selectAll("text")
      .data(links)
      .enter()
      .append("text")
      .attr("class", "link-label")
      .style("font-size", "12px")
      .style("font-weight", "500")
      .style("fill", "hsl(var(--muted-foreground))")
      .style("text-anchor", "middle")
      .style("pointer-events", "none")
      .text(d => relationshipTypes.find(rt => rt.value === d.relationship_type)?.label || d.relationship_type);

    // Create node groups
    const node = g.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .style("cursor", "pointer")
      .call(d3.drag<SVGGElement, D3Node>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Add circles for nodes
    node.append("circle")
      .attr("r", 30)
      .style("fill", d => getNodeColor(d.gender))
      .style("stroke", d => selectedPersonIds.includes(d.id) ? "hsl(var(--primary))" : "hsl(var(--border))")
      .style("stroke-width", d => selectedPersonIds.includes(d.id) ? 3 : 2)
      .style("filter", "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))")
      .on("click", handleNodeClick);

    // Add profile images or initials
    node.each(function(d) {
      const nodeGroup = d3.select(this);
      
      if (d.profile_photo_url) {
        nodeGroup.append("image")
          .attr("href", d.profile_photo_url)
          .attr("x", -25)
          .attr("y", -25)
          .attr("width", 50)
          .attr("height", 50)
          .attr("clip-path", "circle(25px at center)")
          .style("pointer-events", "none");
      } else {
        nodeGroup.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", "0.35em")
          .style("font-size", "14px")
          .style("font-weight", "600")
          .style("fill", "white")
          .style("pointer-events", "none")
          .text(getInitials(d.name));
      }
    });

    // Add name labels below nodes
    node.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "3.5em")
      .style("font-size", "12px")
      .style("font-weight", "500")
      .style("fill", "hsl(var(--foreground))")
      .style("pointer-events", "none")
      .text(d => d.name);

    // Add birth year labels
    node.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "5em")
      .style("font-size", "10px")
      .style("fill", "hsl(var(--muted-foreground))")
      .style("pointer-events", "none")
      .text(d => d.date_of_birth ? new Date(d.date_of_birth).getFullYear() : "");

    // Update positions on simulation tick
    simulation.on("tick", () => {
      link.attr("d", d => {
        const dx = d.target.x! - d.source.x!;
        const dy = d.target.y! - d.source.y!;
        const dr = Math.sqrt(dx * dx + dy * dy) * 0.3;
        return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
      });

      linkLabels
        .attr("x", d => ((d.source.x! + d.target.x!) / 2))
        .attr("y", d => ((d.source.y! + d.target.y!) / 2) - 5);

      node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    function handleNodeClick(event: MouseEvent, d: D3Node) {
      event.stopPropagation();
      if (selectedPersonIds.includes(d.id)) {
        setSelectedPersonIds(prev => prev.filter(id => id !== d.id));
      } else if (selectedPersonIds.length < 2) {
        setSelectedPersonIds(prev => [...prev, d.id]);
      } else {
        setSelectedPersonIds([d.id]);
      }
    }
  };

  const getNodeColor = (gender?: string | null) => {
    switch (gender?.toLowerCase()) {
      case 'male': return "hsl(var(--primary))";
      case 'female': return "hsl(var(--secondary))";
      default: return "hsl(var(--muted))";
    }
  };

  const getRelationshipColor = (type: string) => {
    const relationshipType = relationshipTypes.find(rt => rt.value === type);
    if (!relationshipType) return "hsl(var(--muted-foreground))";
    
    switch (type) {
      case 'parent': return "#3b82f6";
      case 'child': return "#10b981";
      case 'partner': return "#ec4899";
      case 'sibling': return "#8b5cf6";
      case 'donor': return "#f59e0b";
      case 'half_sibling': return "#6366f1";
      default: return "#6b7280";
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleAddConnection = async () => {
    if (selectedPersonIds.length !== 2 || !connectionType) {
      toast({
        title: "Error",
        description: "Please select exactly 2 people and a relationship type",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('No user found');

      const { error } = await supabase
        .from('connections')
        .insert({
          from_person_id: selectedPersonIds[0],
          to_person_id: selectedPersonIds[1],
          relationship_type: connectionType,
          family_tree_id: familyTreeId,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Connection added successfully",
      });

      setSelectedPersonIds([]);
      setConnectionType("");
      fetchConnections();
    } catch (error) {
      console.error('Error adding connection:', error);
      toast({
        title: "Error",
        description: "Failed to add connection",
        variant: "destructive",
      });
    }
  };

  const handleAddPerson = async (personData: any) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('No user found');

      const { error } = await supabase
        .from('persons')
        .insert({
          ...personData,
          family_tree_id: familyTreeId,
          user_id: userData.user.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Person added successfully",
      });

      setAddPersonDialogOpen(false);
      onPersonAdded();
    } catch (error) {
      console.error('Error adding person:', error);
      toast({
        title: "Error",
        description: "Failed to add person",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <Button onClick={() => setAddPersonDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Person
          </Button>
          
          {selectedPersonIds.length === 2 && (
            <div className="flex gap-2 items-center">
              <select
                value={connectionType}
                onChange={(e) => setConnectionType(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select relationship...</option>
                {relationshipTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <Button 
                onClick={handleAddConnection}
                disabled={!connectionType}
                size="sm"
              >
                Connect
              </Button>
            </div>
          )}
        </div>

        {selectedPersonIds.length > 0 && (
          <Badge variant="secondary">
            {selectedPersonIds.length} person{selectedPersonIds.length > 1 ? 's' : ''} selected
          </Badge>
        )}
      </div>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Relationship Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {relationshipTypes.map(type => {
              const Icon = type.icon;
              return (
                <Badge key={type.value} variant="outline" className={type.color}>
                  <Icon className="w-3 h-3 mr-1" />
                  {type.label}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Visualization */}
      <div className="border rounded-lg overflow-hidden bg-card">
        {persons.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <Users className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No family members yet</h3>
            <p className="text-muted-foreground mb-4">
              Start building your family tree by adding family members.
            </p>
            <Button onClick={() => setAddPersonDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Person
            </Button>
          </div>
        ) : (
          <svg ref={svgRef} className="w-full h-[600px]" />
        )}
      </div>

      <AddPersonDialog
        open={addPersonDialogOpen}
        onOpenChange={setAddPersonDialogOpen}
        onSubmit={handleAddPerson}
      />
    </div>
  );
}