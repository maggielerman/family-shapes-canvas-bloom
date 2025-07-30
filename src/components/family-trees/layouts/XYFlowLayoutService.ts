import dagre from 'dagre';
import ELK from 'elkjs/lib/elk.bundled.js';
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
    console.log('XYFlowLayoutService.applyLayout called:', {
      layoutType,
      nodesCount: nodes.length,
      edgesCount: edges.length,
      containerWidth,
      containerHeight
    });

    try {
      switch (layoutType) {
        case 'dagre':
          return this.applyDagreLayout(nodes, edges, containerWidth, containerHeight);
        
        case 'elk':
          return this.applyELKLayout(nodes, edges, containerWidth, containerHeight);
        
        default:
          console.warn('Unknown layout type:', layoutType, 'using default positioning');
          return { nodes, edges };
      }
    } catch (error) {
      console.error('Layout application failed:', error);
      // Return nodes with fallback positioning
      const fallbackNodes = nodes.map((node, index) => ({
        ...node,
        position: {
          x: 100 + (index * 200),
          y: 100 + (index * 100)
        }
      }));
      return { nodes: fallbackNodes, edges };
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
    console.log('Applying Dagre layout to', nodes.length, 'nodes and', edges.length, 'edges');
    
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
      if (!nodeWithPosition) {
        console.warn('No position found for node:', node.id, 'using fallback');
        return {
          ...node,
          position: {
            x: 100 + (Math.random() * 400),
            y: 100 + (Math.random() * 300)
          },
        };
      }
      
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - nodeWithPosition.width / 2,
          y: nodeWithPosition.y - nodeWithPosition.height / 2,
        },
      };
    });

    console.log('Dagre layout completed, positioned', updatedNodes.length, 'nodes');
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
    console.log('Applying ELK layout to', nodes.length, 'nodes and', edges.length, 'edges');
    
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
        if (!elkNode) {
          console.warn('No ELK position found for node:', node.id, 'using fallback');
          return {
            ...node,
            position: {
              x: 100 + (Math.random() * 400),
              y: 100 + (Math.random() * 300)
            },
          };
        }
        
        return {
          ...node,
          position: {
            x: elkNode.x || 0,
            y: elkNode.y || 0,
          },
        };
      });

      console.log('ELK layout completed, positioned', updatedNodes.length, 'nodes');
      return { nodes: updatedNodes, edges };
    } catch (error) {
      console.error('ELK layout error:', error instanceof Error ? error.message : String(error));
      // Return nodes with fallback positioning
      const fallbackNodes = nodes.map((node, index) => ({
        ...node,
        position: {
          x: 100 + (index * 200),
          y: 100 + (index * 100)
        }
      }));
      return { nodes: fallbackNodes, edges };
    }
  }
} 