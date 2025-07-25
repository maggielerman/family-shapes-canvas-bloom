import React from 'react';
import { UnionNode } from '@/types/unionTypes';

interface UnionNodeSVGProps {
  union: UnionNode;
  onClick?: (union: UnionNode) => void;
  x?: number;
  y?: number;
  scale?: number;
}

export function UnionNodeSVG({ 
  union, 
  onClick, 
  x = 0, 
  y = 0, 
  scale = 1 
}: UnionNodeSVGProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(union);
    }
  };

  const nodeSize = 12 * scale;
  const strokeWidth = 2 * scale;

  // Get union type styling
  const getUnionStyling = () => {
    switch (union.unionType) {
      case 'marriage':
        return {
          fill: '#dc2626', // Red
          stroke: '#991b1b',
          symbol: '♥'
        };
      case 'partnership':
        return {
          fill: '#2563eb', // Blue
          stroke: '#1d4ed8',
          symbol: '◊'
        };
      case 'donor_relationship':
        return {
          fill: '#f59e0b', // Orange
          stroke: '#d97706',
          symbol: 'D'
        };
      default:
        return {
          fill: '#6b7280', // Gray
          stroke: '#4b5563',
          symbol: '●'
        };
    }
  };

  const styling = getUnionStyling();

  return (
    <g 
      transform={`translate(${x}, ${y})`}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      onClick={handleClick}
    >
      {/* Union node background */}
      <circle
        cx={0}
        cy={0}
        r={nodeSize}
        fill={styling.fill}
        stroke={styling.stroke}
        strokeWidth={strokeWidth}
        opacity={0.9}
      />

      {/* Union type symbol */}
      <text
        x={0}
        y={0}
        textAnchor="middle"
        dy="0.35em"
        fill="white"
        fontSize={nodeSize * 0.8}
        fontWeight="bold"
        pointerEvents="none"
      >
        {styling.symbol}
      </text>

      {/* Union connection line for multiple parents */}
      {union.parents.length === 2 && (
        <line
          x1={-nodeSize * 2}
          y1={0}
          x2={nodeSize * 2}
          y2={0}
          stroke={styling.stroke}
          strokeWidth={strokeWidth}
          opacity={0.6}
        />
      )}

      {/* Tooltip information (optional - can be enhanced with a proper tooltip library) */}
      <title>
        {`${union.unionType.replace('_', ' ').toUpperCase()}: ${union.parents.map(p => p.name).join(' & ')}`}
        {union.startDate && ` (${union.startDate}${union.endDate ? ` - ${union.endDate}` : ''})`}
        {union.notes && ` - ${union.notes}`}
      </title>
    </g>
  );
}

/**
 * Component for rendering multiple union nodes
 */
interface UnionNodeGroupProps {
  unions: UnionNode[];
  onUnionClick?: (union: UnionNode) => void;
  scale?: number;
}

export function UnionNodeGroup({ unions, onUnionClick, scale = 1 }: UnionNodeGroupProps) {
  return (
    <g className="union-nodes">
      {unions.map(union => (
        <UnionNodeSVG
          key={union.id}
          union={union}
          x={union.x || 0}
          y={union.y || 0}
          scale={scale}
          onClick={onUnionClick}
        />
      ))}
    </g>
  );
}

/**
 * Component for rendering a connection line from union to child
 */
interface UnionConnectionLineProps {
  unionX: number;
  unionY: number;
  childX: number;
  childY: number;
  connectionType: string;
  scale?: number;
}

export function UnionConnectionLine({ 
  unionX, 
  unionY, 
  childX, 
  childY, 
  connectionType, 
  scale = 1 
}: UnionConnectionLineProps) {
  // Different line styles for different connection types
  const getLineStyle = () => {
    switch (connectionType) {
      case 'child':
        return {
          stroke: '#4b5563',
          strokeWidth: 2 * scale,
          strokeDasharray: 'none'
        };
      case 'adopted_child':
        return {
          stroke: '#059669',
          strokeWidth: 2 * scale,
          strokeDasharray: '5,5'
        };
      case 'donor_child':
        return {
          stroke: '#f59e0b',
          strokeWidth: 2 * scale,
          strokeDasharray: '3,3'
        };
      default:
        return {
          stroke: '#6b7280',
          strokeWidth: 1 * scale,
          strokeDasharray: '2,2'
        };
    }
  };

  const lineStyle = getLineStyle();

  return (
    <line
      x1={unionX}
      y1={unionY}
      x2={childX}
      y2={childY}
      stroke={lineStyle.stroke}
      strokeWidth={lineStyle.strokeWidth}
      strokeDasharray={lineStyle.strokeDasharray}
      fill="none"
      className="union-connection-line"
    />
  );
}

/**
 * Component for rendering parent-to-union connection lines
 */
interface ParentUnionConnectionProps {
  parentX: number;
  parentY: number;
  unionX: number;
  unionY: number;
  relationshipType: string;
  scale?: number;
}

export function ParentUnionConnection({ 
  parentX, 
  parentY, 
  unionX, 
  unionY, 
  relationshipType, 
  scale = 1 
}: ParentUnionConnectionProps) {
  const lineStyle = {
    stroke: '#6b7280',
    strokeWidth: 1.5 * scale,
    strokeDasharray: 'none'
  };

  return (
    <line
      x1={parentX}
      y1={parentY}
      x2={unionX}
      y2={unionY}
      stroke={lineStyle.stroke}
      strokeWidth={lineStyle.strokeWidth}
      strokeDasharray={lineStyle.strokeDasharray}
      fill="none"
      className="parent-union-connection"
      opacity={0.6}
    />
  );
} 