import { useState, useCallback } from 'react';
import { AllocationTechnique, ComparisonMetrics, MemoryBlock, TECHNIQUE_LABELS } from '@/types/memory';

interface ProcessInput {
  name: string;
  size: number;
  burstTime: number;
  arrivalTime: number;
}

interface SimulationBlock {
  start: number;
  size: number;
  processId: string | null;
  isHole: boolean;
}

interface RunningProcess {
  id: string;
  name: string;
  size: number;
  burstTime: number;
  arrivalTime: number;
  remainingTime: number;
  startAddress?: number;
  status: 'waiting' | 'running' | 'completed';
}

const CONTIGUOUS_TECHNIQUES: AllocationTechnique[] = ['first-fit', 'best-fit', 'worst-fit', 'next-fit'];

const generateId = () => Math.random().toString(36).substr(2, 9);

export function useComparisonSimulation(totalMemory: number) {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<ComparisonMetrics[] | null>(null);

  const findHole = (
    blocks: SimulationBlock[], 
    size: number, 
    technique: AllocationTechnique,
    lastFitIndex: number
  ): { block: SimulationBlock | null; newLastFitIndex: number } => {
    const holes = blocks.filter(b => b.isHole && b.size >= size);
    
    if (holes.length === 0) return { block: null, newLastFitIndex: lastFitIndex };

    switch (technique) {
      case 'first-fit':
        return { block: holes[0], newLastFitIndex: lastFitIndex };
      case 'best-fit':
        return { block: holes.sort((a, b) => a.size - b.size)[0], newLastFitIndex: lastFitIndex };
      case 'worst-fit':
        return { block: holes.sort((a, b) => b.size - a.size)[0], newLastFitIndex: lastFitIndex };
      case 'next-fit': {
        const startIdx = lastFitIndex % holes.length;
        for (let i = 0; i < holes.length; i++) {
          const idx = (startIdx + i) % holes.length;
          if (holes[idx].size >= size) {
            return { block: holes[idx], newLastFitIndex: idx + 1 };
          }
        }
        return { block: null, newLastFitIndex: lastFitIndex };
      }
      default:
        return { block: holes[0], newLastFitIndex: lastFitIndex };
    }
  };

  const allocate = (
    blocks: SimulationBlock[],
    process: RunningProcess,
    technique: AllocationTechnique,
    lastFitIndex: number
  ): { newBlocks: SimulationBlock[]; success: boolean; newLastFitIndex: number } => {
    const { block: targetBlock, newLastFitIndex } = findHole(blocks, process.size, technique, lastFitIndex);

    if (!targetBlock) {
      return { newBlocks: blocks, success: false, newLastFitIndex };
    }

    const newBlocks: SimulationBlock[] = [];
    
    for (const block of blocks) {
      if (block === targetBlock) {
        newBlocks.push({
          start: block.start,
          size: process.size,
          processId: process.id,
          isHole: false,
        });

        const remaining = block.size - process.size;
        if (remaining > 0) {
          newBlocks.push({
            start: block.start + process.size,
            size: remaining,
            processId: null,
            isHole: true,
          });
        }
      } else {
        newBlocks.push(block);
      }
    }

    return { newBlocks: newBlocks.sort((a, b) => a.start - b.start), success: true, newLastFitIndex };
  };

  const deallocate = (blocks: SimulationBlock[], processId: string): SimulationBlock[] => {
    const newBlocks = blocks.map(block => {
      if (block.processId === processId) {
        return { ...block, processId: null, isHole: true };
      }
      return block;
    });

    // Merge adjacent holes
    const merged: SimulationBlock[] = [];
    for (const block of newBlocks) {
      const lastBlock = merged[merged.length - 1];
      if (lastBlock && lastBlock.isHole && block.isHole) {
        lastBlock.size += block.size;
      } else {
        merged.push({ ...block });
      }
    }

    return merged;
  };

  const runSimulationForTechnique = useCallback((
    processInputs: ProcessInput[],
    technique: AllocationTechnique
  ): ComparisonMetrics => {
    let blocks: SimulationBlock[] = [{ start: 0, size: totalMemory, processId: null, isHole: true }];
    let processes: RunningProcess[] = processInputs.map((p, i) => ({
      ...p,
      id: `p-${i}`,
      remainingTime: p.burstTime,
      status: 'waiting' as const,
    }));
    
    let currentTime = 0;
    let lastFitIndex = 0;
    let successfulAllocations = 0;
    let failedAllocations = 0;
    let utilizationSum = 0;
    let utilizationCount = 0;
    let maxHoles = 0;
    let holesSum = 0;
    let holesCount = 0;
    let maxExternalFragmentation = 0;

    const maxTicks = Math.max(...processInputs.map(p => p.arrivalTime + p.burstTime)) + 10;

    while (currentTime < maxTicks) {
      // Check for arriving processes
      for (const process of processes) {
        if (process.status === 'waiting' && process.arrivalTime <= currentTime && process.startAddress === undefined) {
          const result = allocate(blocks, process, technique, lastFitIndex);
          blocks = result.newBlocks;
          lastFitIndex = result.newLastFitIndex;
          
          if (result.success) {
            process.status = 'running';
            process.startAddress = blocks.find(b => b.processId === process.id)?.start;
            successfulAllocations++;
          } else {
            failedAllocations++;
          }
        }
      }

      // Tick running processes
      for (const process of processes) {
        if (process.status === 'running') {
          process.remainingTime--;
          if (process.remainingTime <= 0) {
            blocks = deallocate(blocks, process.id);
            process.status = 'completed';
          }
        }
      }

      // Calculate metrics
      const usedMemory = blocks.filter(b => !b.isHole).reduce((sum, b) => sum + b.size, 0);
      const utilization = (usedMemory / totalMemory) * 100;
      utilizationSum += utilization;
      utilizationCount++;

      const holes = blocks.filter(b => b.isHole);
      holesSum += holes.length;
      holesCount++;
      maxHoles = Math.max(maxHoles, holes.length);

      const extFrag = holes.length > 1 ? holes.reduce((sum, h) => sum + h.size, 0) : 0;
      maxExternalFragmentation = Math.max(maxExternalFragmentation, extFrag);

      // Check if all processes completed
      if (processes.every(p => p.status === 'completed')) {
        break;
      }

      currentTime++;
    }

    return {
      technique,
      label: TECHNIQUE_LABELS[technique] || technique,
      successfulAllocations,
      failedAllocations,
      avgUtilization: utilizationCount > 0 ? utilizationSum / utilizationCount : 0,
      maxHoles,
      avgHoles: holesCount > 0 ? holesSum / holesCount : 0,
      maxExternalFragmentation,
      totalTicks: currentTime,
    };
  }, [totalMemory]);

  const runComparison = useCallback((processInputs: ProcessInput[]) => {
    if (processInputs.length === 0) return;

    setIsRunning(true);
    
    // Run simulation for each technique
    const metrics: ComparisonMetrics[] = CONTIGUOUS_TECHNIQUES.map(technique => 
      runSimulationForTechnique(processInputs, technique)
    );

    setResults(metrics);
    setIsRunning(false);
  }, [runSimulationForTechnique]);

  const clearResults = useCallback(() => {
    setResults(null);
  }, []);

  return {
    isRunning,
    results,
    runComparison,
    clearResults,
  };
}
