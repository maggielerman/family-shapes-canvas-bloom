import { describe, it, expect } from 'vitest';
import { XYFlowLayoutService } from './XYFlowLayoutService';
import { Node, Edge } from '@xyflow/react';
import { LayoutType } from '../XYFlowLayoutSelector';

describe('XYFlowLayoutService', () => {
  const mockNodes: Node[] = [
    {
      id: '1',
      type: 'personNode',
      position: { x: 0, y: 0 },
      data: { person: { id: '1', name: 'John' } },
    },
    {
      id: '2',
      type: 'personNode',
      position: { x: 100, y: 100 },
      data: { person: { id: '2', name: 'Jane' } },
    },
    {
      id: '3',
      type: 'personNode',
      position: { x: 200, y: 200 },
      data: { person: { id: '3', name: 'Bob' } },
    },
  ];

  const mockEdges: Edge[] = [
    {
      id: 'edge-1',
      source: '1',
      target: '2',
      type: 'smoothstep',
    },
    {
      id: 'edge-2',
      source: '2',
      target: '3',
      type: 'smoothstep',
    },
  ];

  it('should return original nodes and edges for manual layout', async () => {
    const result = await XYFlowLayoutService.applyLayout(
      mockNodes,
      mockEdges,
      'manual',
      800,
      600
    );

    expect(result.nodes).toEqual(mockNodes);
    expect(result.edges).toEqual(mockEdges);
  });

  it('should apply dagre layout and update node positions', async () => {
    const result = await XYFlowLayoutService.applyLayout(
      mockNodes,
      mockEdges,
      'dagre',
      800,
      600
    );

    expect(result.nodes).toHaveLength(mockNodes.length);
    expect(result.edges).toEqual(mockEdges);
    
    // Check that node positions have been updated
    result.nodes.forEach((node, index) => {
      expect(node.position.x).not.toBe(mockNodes[index].position.x);
      expect(node.position.y).not.toBe(mockNodes[index].position.y);
    });
  });

  it('should apply d3-force layout and update node positions', async () => {
    const result = await XYFlowLayoutService.applyLayout(
      mockNodes,
      mockEdges,
      'd3-force',
      800,
      600
    );

    expect(result.nodes).toHaveLength(mockNodes.length);
    expect(result.edges).toEqual(mockEdges);
    
    // Check that node positions have been updated
    result.nodes.forEach((node, index) => {
      expect(node.position.x).not.toBe(mockNodes[index].position.x);
      expect(node.position.y).not.toBe(mockNodes[index].position.y);
    });
  });

  it('should handle empty nodes array', async () => {
    const result = await XYFlowLayoutService.applyLayout(
      [],
      [],
      'dagre',
      800,
      600
    );

    expect(result.nodes).toEqual([]);
    expect(result.edges).toEqual([]);
  });

  it('should handle nodes without edges', async () => {
    const result = await XYFlowLayoutService.applyLayout(
      mockNodes,
      [],
      'd3-force',
      800,
      600
    );

    expect(result.nodes).toHaveLength(mockNodes.length);
    expect(result.edges).toEqual([]);
  });
}); 