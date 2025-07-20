// Dynamic test file discovery using Vite's import.meta.glob
const testFiles = import.meta.glob('/src/test/**/*.{test,spec}.{ts,tsx}', { eager: false });

export interface TestFileInfo {
  name: string;
  path: string;
  relativePath: string;
  estimatedTests: number;
}

// Estimate number of tests based on file content patterns
const estimateTestCount = async (filePath: string): Promise<number> => {
  try {
    // For now, return a default estimate since we can't easily read file contents
    // In a real implementation, you might parse the files or use a different approach
    const fileName = filePath.split('/').pop() || '';
    
    // Simple heuristics based on file name patterns
    if (fileName.includes('comprehensive')) return 15;
    if (fileName.includes('integration')) return 8;
    if (fileName.includes('component')) return 12;
    if (fileName.includes('debugging')) return 6;
    if (fileName.includes('simple')) return 1;
    
    return 5; // Default estimate
  } catch {
    return 5;
  }
};

export const discoverTestFiles = async (): Promise<TestFileInfo[]> => {
  const discovered: TestFileInfo[] = [];
  
  for (const [filePath] of Object.entries(testFiles)) {
    const relativePath = filePath.replace('/src/', 'src/');
    const pathParts = filePath.split('/');
    const fileName = pathParts[pathParts.length - 1];
    
    const estimatedTests = await estimateTestCount(filePath);
    
    discovered.push({
      name: fileName,
      path: filePath,
      relativePath,
      estimatedTests
    });
  }
  
  // Sort by path for consistent ordering
  return discovered.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
};

export const getTotalEstimatedTests = (testFiles: TestFileInfo[]): number => {
  return testFiles.reduce((total, file) => total + file.estimatedTests, 0);
};