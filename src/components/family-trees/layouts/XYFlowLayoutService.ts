import dagre from 'dagre';
import ELK from 'elkjs/lib/elk.bundled.js';
import * as d3 from 'd3';
import { LayoutType } from '../XYFlowLayoutSelector';
import { Node, Edge } from '@xyflow/react';

const elk = new ELK();

export interface LayoutResult {
  nodes: Node[];
  edges: Edge[];
}

export class XYFlowLayoutService {
  /**
   * Apply layout algorithm to nodes and edges
   */
  static async applyLayout(
    nodes: Node[],
    edges: Edge[],
    layoutType: LayoutType,
    containerWidth: number = 800,
    containerHeight: number = 600
  ): Promise<LayoutResult> {
    switch (layoutType) {
      case 'manual':
        return { nodes, edges };
      
      case 'dagre':
        return this.applyDagreLayout(nodes, edges, containerWidth, containerHeight);
      
      case 'elk':
        return this.applyELKLayout(nodes, edges, containerWidth, containerHeight);
      
      case 'd3-hierarchy':
        return this.applyD3HierarchyLayout(nodes, edges, containerWidth, containerHeight);
      
      case 'd3-force':
        return this.applyD3ForceLayout(nodes, edges, containerWidth, containerHeight);
      
      case 'd3-cluster':
        return this.applyD3ClusterLayout(nodes, edges, containerWidth, containerHeight);
      
      case 'd3-tree':
        return this.applyD3TreeLayout(nodes, edges, containerWidth, containerHeight);
      
      default:
        return { nodes, edges };
    }
  }

  /**
   * Apply Dagre layout (hierarchical directed graph)
   */
  private static applyDagreLayout(
    nodes: Node[],
    edges: Edge[],
    containerWidth: number,
    containerHeight: number
  ): LayoutResult {
    const g = new dagre.graphlib.Graph();
    g.setGraph({
      rankdir: 'TB', // Top to bottom
      nodesep: 50,
      ranksep: 100,
      marginx: 50,
      marginy: 50,
    });
    g.setDefaultEdgeLabel(() => ({}));

    // Add nodes to the graph
    nodes.forEach((node) => {
      g.setNode(node.id, {
        width: 150,
        height: 80,
      });
    });

    // Add edges to the graph
    edges.forEach((edge) => {
      g.setEdge(edge.source, edge.target);
    });

    // Calculate the layout
    dagre.layout(g);

    // Update node positions
    const updatedNodes = nodes.map((node) => {
      const nodeWithPosition = g.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - nodeWithPosition.width / 2,
          y: nodeWithPosition.y - nodeWithPosition.height / 2,
        },
      };
    });

    return { nodes: updatedNodes, edges };
  }

  /**
   * Apply ELK layout (advanced layout engine)
   */
  private static async applyELKLayout(
    nodes: Node[],
    edges: Edge[],
    containerWidth: number,
    containerHeight: number
  ): Promise<LayoutResult> {
    const graph = {
      id: 'root',
      layoutOptions: {
        'elk.algorithm': 'layered',
        'elk.direction': 'DOWN',
        'elk.spacing.nodeNode': '50',
        'elk.layered.spacing.nodeNodeBetweenLayers': '100',
        'elk.padding': '[top=50, left=50, bottom=50, right=50]',
      },
      children: nodes.map((node) => ({
        id: node.id,
        width: 150,
        height: 80,
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        sources: [edge.source],
        targets: [edge.target],
      })),
    };

    try {
      const result = await elk.layout(graph);
      
      const updatedNodes = nodes.map((node) => {
        const elkNode = result.children?.find((n) => n.id === node.id);
        return {
          ...node,
          position: {
            x: elkNode?.x || 0,
            y: elkNode?.y || 0,
          },
        };
      });

      return { nodes: updatedNodes, edges };
    } catch (error) {
      console.error('ELK layout error:', error instanceof Error ? error.message : String(error));
      return { nodes, edges };
    }
  }

  /**
   * Apply D3 Hierarchy layout
   */
  private static applyD3HierarchyLayout(
    nodes: Node[],
    edges: Edge[],
    containerWidth: number,
    containerHeight: number
  ): LayoutResult {
    // Create hierarchical data structure
    const hierarchyData = this.createHierarchyData(nodes, edges);
    if (!hierarchyData) {
      return { nodes, edges };
    }

    const root = d3.hierarchy(hierarchyData);
    const tree = d3.tree<{ id: string; data: Node }>()
      .size([containerWidth - 100, containerHeight - 100]);

    tree(root);

    const updatedNodes = nodes.map((node) => {
      const hierarchyNode = root.descendants().find((d) => d.data.id === node.id);
      return {
        ...node,
        position: {
          x: hierarchyNode?.x || 0,
          y: hierarchyNode?.y || 0,
        },
      };
    });

    return { nodes: updatedNodes, edges };
  }

  /**
   * Apply D3 Force layout
   */
  private static applyD3ForceLayout(
    nodes: Node[],
    edges: Edge[],
    containerWidth: number,
    containerHeight: number
  ): LayoutResult {
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(edges).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(containerWidth / 2, containerHeight / 2))
      .force('collision', d3.forceCollide().radius(50));

    // Run simulation for a reduced number of ticks to prevent blocking
    for (let i = 0; i < 100; ++i) {
      simulation.tick();
    }

    const updatedNodes = nodes.map((node: any) => ({
      ...node,
      position: {
        x: node.x,
        y: node.y,
      },
    }));

    return { nodes: updatedNodes, edges };
  }

  /**
   * Apply D3 Cluster layout
   */
  private static applyD3ClusterLayout(
    nodes: Node[],
    edges: Edge[],
    containerWidth: number,
    containerHeight: number
  ): LayoutResult {
    const hierarchyData = this.createHierarchyData(nodes, edges);
    if (!hierarchyData) {
      return { nodes, edges };
    }

    const root = d3.hierarchy(hierarchyData);
    const cluster = d3.cluster<{ id: string; data: Node }>()
      .size([containerWidth - 100, containerHeight - 100]);

    cluster(root);

    const updatedNodes = nodes.map((node) => {
      const clusterNode = root.descendants().find((d) => d.data.id === node.id);
      return {
        ...node,
        position: {
          x: clusterNode?.x || 0,
          y: clusterNode?.y || 0,
        },
      };
    });

    return { nodes: updatedNodes, edges };
  }

  /**
   * Apply D3 Tree layout
   */
  private static applyD3TreeLayout(
    nodes: Node[],
    edges: Edge[],
    containerWidth: number,
    containerHeight: number
  ): LayoutResult {
    const hierarchyData = this.createHierarchyData(nodes, edges);
    if (!hierarchyData) {
      return { nodes, edges };
    }

    const root = d3.hierarchy(hierarchyData);
    const tree = d3.tree<{ id: string; data: Node }>()
      .size([containerWidth - 100, containerHeight - 100]);

    tree(root);

    const updatedNodes = nodes.map((node) => {
      const treeNode = root.descendants().find((d) => d.data.id === node.id);
      return {
        ...node,
        position: {
          x: treeNode?.x || 0,
          y: treeNode?.y || 0,
        },
      };
    });

    return { nodes: updatedNodes, edges };
  }

  /**
   * Create hierarchical data structure from nodes and edges
   */
  private static createHierarchyData(nodes: Node[], edges: Edge[]) {
    if (nodes.length === 0) return null;

    // Find root nodes (nodes with no incoming edges)
    const targetIds = new Set(edges.map(edge => edge.target));
    const rootNodes = nodes.filter(node => !targetIds.has(node.id));

    if (rootNodes.length === 0) {
      // If no root found, use the first node
      return {
        id: nodes[0].id,
        data: nodes[0],
        children: this.buildHierarchy(nodes[0].id, nodes, edges),
      };
    }

    // Use the first root node
    return {
      id: rootNodes[0].id,
      data: rootNodes[0],
      children: this.buildHierarchy(rootNodes[0].id, nodes, edges),
    };
  }

  /**
   * Build hierarchy recursively
   */
  private static buildHierarchy(parentId: string, nodes: Node[], edges: Edge[]) {
    const childrenEdges = edges.filter(edge => edge.source === parentId);
    return childrenEdges.map(edge => {
      const childNode = nodes.find(node => node.id === edge.target);
      if (!childNode) return null;

      return {
        id: childNode.id,
        data: childNode,
        children: this.buildHierarchy(childNode.id, nodes, edges),
      };
    }).filter(Boolean);
  }
} 