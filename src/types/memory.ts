// File: src/types/memory.ts

export type AllocationTechnique = 
  | 'first-fit' 
  | 'best-fit' 
  | 'worst-fit' 
  | 'next-fit' 
  | 'paging' 
  | 'segmentation';

export interface Process {
  id: string;
  name: string;
  size: number;
  burstTime: number;
  remainingTime: number;
  arrivalTime: number;
  color: string;
  status: 'waiting' | 'running' | 'completed';
}

export interface MemoryBlock {
  id: string;
  start: number;
  size: number;
  processId: string | null;
  processName: string;
  color: string;
  isHole: boolean;
}

export interface Hole {
  start: number;
  size: number;
  isHole: boolean;
}

export interface Segment {
  id: string;
  name: string;
  size: number;
  base: number | null;
  limit: number;
  valid: boolean;
  processId: string;
}

export interface Page {
  id: string;
  pageNumber: number;
  frameNumber: number | null;
  valid: boolean;
  referenced: boolean;
  modified: boolean;
  processId: string;
}

export interface SimulationState {
  memory: MemoryBlock[];
  processes: Process[];
  holes: Hole[];
  segments?: Segment[];
  pageTable?: Page[];
  freeFrames?: boolean[];
  speed: number;
  currentTime: number;
  technique: AllocationTechnique;
  lastFitIndex: number;
}

export interface ComparisonMetrics {
  technique: AllocationTechnique;
  label: string;
  successfulAllocations: number;
  failedAllocations: number;
  avgUtilization: number;
  maxHoles: number;
  avgHoles: number;
  maxExternalFragmentation: number;
  totalTicks: number;
}

export const PROCESS_COLORS = [
  'hsl(185, 100%, 50%)',   // cyan
  'hsl(270, 80%, 60%)',    // purple
  'hsl(320, 100%, 60%)',   // pink
  'hsl(150, 100%, 50%)',   // green
  'hsl(25, 100%, 55%)',    // orange
  'hsl(210, 100%, 60%)',   // blue
  'hsl(45, 100%, 50%)',    // yellow
  'hsl(0, 85%, 60%)',      // red
];

export const TECHNIQUE_LABELS: Record<AllocationTechnique, string> = {
  'first-fit': 'First Fit',
  'best-fit': 'Best Fit',
  'worst-fit': 'Worst Fit',
  'next-fit': 'Next Fit',
  'paging': 'Paging',
  'segmentation': 'Segmentation'
};

export const TECHNIQUE_DESCRIPTIONS: Record<AllocationTechnique, string> = {
  'first-fit': 'Allocates the first sufficient block found from the beginning of memory',
  'best-fit': 'Allocates the smallest sufficient block to minimize wastage',
  'worst-fit': 'Allocates the largest available block to minimize external fragmentation',
  'next-fit': 'Similar to first-fit but starts searching from the last allocation point',
  'paging': 'Divides memory into fixed-size pages and processes into equal-sized frames',
  'segmentation': 'Divides memory into logical segments of varying sizes'
};

export const DEFAULT_MEMORY_SIZE = 1024; // 1GB default memory size
export const DEFAULT_PAGE_SIZE = 64;     // 64KB page size
export const DEFAULT_SEGMENT_COUNT = 8;  // Default number of segments