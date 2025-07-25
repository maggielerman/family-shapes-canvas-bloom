import React from 'react';
import { UnionDagreLayoutDemo } from '@/components/family-trees/layouts/UnionDagreLayoutDemo';

export default function UnionDemo() {
  return (
    <div className="w-full h-screen bg-gray-50">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Union Nodes Demo</h1>
        <p className="text-gray-600 mb-4">
          Test the new union nodes system that eliminates crossing parent-child connections.
          Toggle the controls to see the difference between standard and union-based layouts.
        </p>
      </div>
      
      <div className="w-full h-[calc(100vh-120px)]">
        <UnionDagreLayoutDemo width={1200} height={800} />
      </div>
    </div>
  );
} 