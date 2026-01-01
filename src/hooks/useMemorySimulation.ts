import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Process, 
  MemoryBlock, 
  Hole, 
  AllocationLog, 
  MemoryStats, 
  SimulationState,
  AllocationTechnique,
  PROCESS_COLORS 
} from '@/types/memory';

const DEFAULT_TOTAL_MEMORY = 1024;
const DEFAULT_SPEED = 1000;

const generateId = () => Math.random().toString(36).substr(2, 9);

export function useMemorySimulation() {
  const [totalMemory, setTotalMemory] = useState(DEFAULT_TOTAL_MEMORY);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [memoryBlocks, setMemoryBlocks] = useState<MemoryBlock[]>([
    { id: generateId(), start: 0, size: DEFAULT_TOTAL_MEMORY, processId: null, isHole: true }
  ]);
  const [logs, setLogs] = useState<AllocationLog[]>([]);
  const [simulation, setSimulation] = useState<SimulationState>({
    isRunning: false,
    isPaused: false,
    speed: DEFAULT_SPEED,
    currentTime: 0,
    technique: 'first-fit',
    lastFitIndex: 0,
  });

  const colorIndex = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const addLog = useCallback((
    type: AllocationLog['type'],
    message: string,
    details?: string,
    processId?: string,
    processName?: string
  ) => {
    const log: AllocationLog = {
      id: generateId(),
      timestamp: new Date(),
      type,
      message,
      details,
      processId,
      processName,
      technique: simulation.technique,
    };
    setLogs(prev => [log, ...prev].slice(0, 100));
  }, [simulation.technique]);

  const getHoles = useCallback((): Hole[] => {
    return memoryBlocks
      .filter(block => block.isHole)
      .map(block => ({
        id: block.id,
        start: block.start,
        end: block.start + block.size - 1,
        size: block.size,
      }));
  }, [memoryBlocks]);

  const getStats = useCallback((): MemoryStats => {
    const holes = getHoles();
    const usedMemory = memoryBlocks
      .filter(b => !b.isHole)
      .reduce((sum, b) => sum + b.size, 0);
    const freeMemory = totalMemory - usedMemory;

    return {
      totalMemory,
      usedMemory,
      freeMemory,
      utilization: (usedMemory / totalMemory) * 100,
      internalFragmentation: 0,
      externalFragmentation: holes.length > 1 ? holes.reduce((sum, h) => sum + h.size, 0) : 0,
      numberOfHoles: holes.length,
      numberOfProcesses: processes.filter(p => p.status === 'running').length,
    };
  }, [memoryBlocks, processes, getHoles, totalMemory]);

  const findFirstFit = useCallback((size: number): MemoryBlock | null => {
    const holes = memoryBlocks.filter(b => b.isHole && b.size >= size);
    return holes[0] || null;
  }, [memoryBlocks]);

  const findBestFit = useCallback((size: number): MemoryBlock | null => {
    const holes = memoryBlocks
      .filter(b => b.isHole && b.size >= size)
      .sort((a, b) => a.size - b.size);
    return holes[0] || null;
  }, [memoryBlocks]);

  const findWorstFit = useCallback((size: number): MemoryBlock | null => {
    const holes = memoryBlocks
      .filter(b => b.isHole && b.size >= size)
      .sort((a, b) => b.size - a.size);
    return holes[0] || null;
  }, [memoryBlocks]);

  const findNextFit = useCallback((size: number, lastFitIndex: number): MemoryBlock | null => {
    const holes = memoryBlocks.filter(b => b.isHole && b.size >= size);
    if (holes.length === 0) return null;

    const startIdx = lastFitIndex % holes.length;
    for (let i = 0; i < holes.length; i++) {
      const idx = (startIdx + i) % holes.length;
      if (holes[idx].size >= size) {
        return { ...holes[idx], lastFitIndex: idx + 1 };
      }
    }
    return null;
  }, [memoryBlocks]);

  const findHole = useCallback((size: number, technique: AllocationTechnique, lastFitIndex: number): { hole: MemoryBlock | null, newLastFitIndex: number } => {
    switch (technique) {
      case 'first-fit': 
        return { hole: findFirstFit(size), newLastFitIndex: lastFitIndex };
      case 'best-fit': 
        return { hole: findBestFit(size), newLastFitIndex: lastFitIndex };
      case 'worst-fit': 
        return { hole: findWorstFit(size), newLastFitIndex: lastFitIndex };
      case 'next-fit': {
        const result = findNextFit(size, lastFitIndex);
        return { 
          hole: result, 
          newLastFitIndex: result?.lastFitIndex ?? lastFitIndex 
        };
      }
      default: 
        return { hole: findFirstFit(size), newLastFitIndex: lastFitIndex };
    }
  }, [findFirstFit, findBestFit, findWorstFit, findNextFit]);

  const allocateProcess = useCallback((process: Omit<Process, 'id' | 'color' | 'status' | 'remainingTime' | 'startAddress' | 'allocatedAt' | 'endTime'>, manualAddress?: number) => {
    const color = PROCESS_COLORS[colorIndex.current % PROCESS_COLORS.length];
    colorIndex.current++;

    const newProcess: Process = {
      ...process,
      id: generateId(),
      color,
      status: 'waiting',
      remainingTime: process.burstTime,
    };

    // If arrival time is in the future, just add to waiting queue
    if (process.arrivalTime > simulation.currentTime) {
      setProcesses(prev => [...prev, newProcess]);
      addLog(
        'info',
        `Queued ${newProcess.name} (${process.size} KB)`,
        `Will arrive at tick ${process.arrivalTime}`,
        newProcess.id,
        newProcess.name
      );
      return newProcess;
    }

    let targetBlock: MemoryBlock | null = null;
    let newLastFitIndex = simulation.lastFitIndex;

    if (manualAddress !== undefined) {
      const hole = memoryBlocks.find(b => 
        b.isHole && 
        b.start <= manualAddress && 
        b.start + b.size >= manualAddress + process.size
      );
      if (hole) {
        targetBlock = { ...hole, start: manualAddress };
      } else {
        addLog('error', `Cannot allocate ${process.name} at address ${manualAddress}`, 'Invalid or occupied address range');
        return null;
      }
    } else {
      const result = findHole(process.size, simulation.technique, simulation.lastFitIndex);
      targetBlock = result.hole;
      newLastFitIndex = result.newLastFitIndex;
    }

    if (!targetBlock) {
      addLog('error', `Cannot allocate ${process.name} (${process.size} KB)`, 'No suitable hole found');
      return null;
    }

    const allocatedAddress = manualAddress ?? targetBlock.start;
    newProcess.startAddress = allocatedAddress;
    newProcess.status = 'running';
    newProcess.allocatedAt = simulation.currentTime;

    setMemoryBlocks(prev => {
      const newBlocks: MemoryBlock[] = [];
      
      for (const block of prev) {
        if (block.id === targetBlock!.id) {
          if (allocatedAddress > block.start) {
            newBlocks.push({
              id: generateId(),
              start: block.start,
              size: allocatedAddress - block.start,
              processId: null,
              isHole: true,
            });
          }

          newBlocks.push({
            id: generateId(),
            start: allocatedAddress,
            size: process.size,
            processId: newProcess.id,
            processName: newProcess.name,
            color: newProcess.color,
            isHole: false,
          });

          const endOfAllocation = allocatedAddress + process.size;
          const endOfBlock = block.start + block.size;
          if (endOfAllocation < endOfBlock) {
            newBlocks.push({
              id: generateId(),
              start: endOfAllocation,
              size: endOfBlock - endOfAllocation,
              processId: null,
              isHole: true,
            });
          }
        } else {
          newBlocks.push(block);
        }
      }

      return newBlocks.sort((a, b) => a.start - b.start);
    });

    setSimulation(prev => ({ ...prev, lastFitIndex: newLastFitIndex }));
    setProcesses(prev => [...prev, newProcess]);

    addLog(
      'allocation',
      `Allocated ${newProcess.name} (${process.size} KB)`,
      `Address: ${allocatedAddress}, Technique: ${simulation.technique}`,
      newProcess.id,
      newProcess.name
    );

    return newProcess;
  }, [memoryBlocks, simulation.technique, simulation.currentTime, simulation.lastFitIndex, findHole, addLog]);

  const deallocateProcess = useCallback((processId: string) => {
    setProcesses(prevProcesses => {
      const process = prevProcesses.find(p => p.id === processId);
      if (!process) return prevProcesses;

      setMemoryBlocks(prevBlocks => {
        // Mark the block as a hole and remove process info
        const newBlocks = prevBlocks.map(block => 
          block.processId === processId 
            ? { 
                ...block, 
                processId: null, 
                processName: undefined, 
                color: undefined, 
                isHole: true 
              } as MemoryBlock
            : block
        );

        // Merge adjacent holes
        const merged: MemoryBlock[] = [];
        for (const block of newBlocks) {
          const lastBlock = merged[merged.length - 1];
          if (lastBlock?.isHole && block.isHole && 
              lastBlock.start + lastBlock.size === block.start) {
            lastBlock.size += block.size;
          } else {
            merged.push({...block});
          }
        }

        return merged.sort((a, b) => a.start - b.start);
      });

      // Update process status to completed
      return prevProcesses.map(p => 
        p.id === processId 
          ? { 
              ...p, 
              status: 'completed' as const, 
              endTime: simulation.currentTime,
              // Ensure all required properties are present
              startAddress: 'startAddress' in p ? (p as any).startAddress : 0,
              allocatedAt: 'allocatedAt' in p ? (p as any).allocatedAt : 0
            } as Process
          : p
      );
    });

    const process = processes.find(p => p.id === processId);
    if (process) {
      addLog(
        'deallocation',
        `Deallocated ${process.name}`,
        `Freed ${process.size} KB at address ${'startAddress' in process ? (process as any).startAddress : 'N/A'}`,
        process.id,
        process.name
      );
    }
  }, [processes, simulation.currentTime, addLog]);

  const tryAllocateWaitingProcess = useCallback((process: Process, currentTime: number) => {
    const { hole: targetBlock, newLastFitIndex } = findHole(
      process.size, 
      simulation.technique, 
      simulation.lastFitIndex
    );
    
    if (!targetBlock) {
      addLog(
        'error',
        `Failed to allocate ${process.name} (${process.size} KB)`,
        'No suitable hole found',
        process.id,
        process.name
      );
      return null;
    }

    const allocatedAddress = targetBlock.start;

    setMemoryBlocks(prevBlocks => {
      const newBlocks: MemoryBlock[] = [];
      let blockProcessed = false;
      
      for (const block of prevBlocks) {
        if (!blockProcessed && block.id === targetBlock.id) {
          // Add space before the allocated block if needed
          if (allocatedAddress > block.start) {
            newBlocks.push({
              id: generateId(),
              start: block.start,
              size: allocatedAddress - block.start,
              processId: null,
              processName: undefined,
              color: undefined,
              isHole: true,
            } as MemoryBlock);
          }

          // Add the allocated block
          newBlocks.push({
            id: generateId(),
            start: allocatedAddress,
            size: process.size,
            processId: process.id,
            processName: process.name,
            color: process.color,
            isHole: false,
          } as MemoryBlock);

          // Add remaining space after the allocated block if needed
          const endOfAllocation = allocatedAddress + process.size;
          const endOfBlock = block.start + block.size;
          if (endOfAllocation < endOfBlock) {
            newBlocks.push({
              id: generateId(),
              start: endOfAllocation,
              size: endOfBlock - endOfAllocation,
              processId: null,
              processName: undefined,
              color: undefined,
              isHole: true,
            } as MemoryBlock);
          }
          blockProcessed = true;
        } else {
          newBlocks.push({...block});
        }
      }

      // Merge adjacent holes
      const mergedBlocks: MemoryBlock[] = [];
      for (const block of newBlocks) {
        const lastBlock = mergedBlocks[mergedBlocks.length - 1];
        if (lastBlock?.isHole && block.isHole && 
            lastBlock.start + lastBlock.size === block.start) {
          lastBlock.size += block.size;
        } else {
          mergedBlocks.push({...block});
        }
      }

      return mergedBlocks.sort((a, b) => a.start - b.start);
    });

    setSimulation(prev => ({ ...prev, lastFitIndex: newLastFitIndex }));

    addLog(
      'allocation',
      `Allocated ${process.name} (${process.size} KB)`,
      `Address: ${allocatedAddress}, Technique: ${simulation.technique}`,
      process.id,
      process.name
    );

    return allocatedAddress;
  }, [simulation.technique, simulation.lastFitIndex, findHole, addLog]);

  const tick = useCallback(() => {
    setSimulation(prev => {
      const newTime = prev.currentTime + 1;
      
      setProcesses(currentProcesses => {
        // 1. Process allocations for waiting processes
        const updatedProcesses = [...currentProcesses];
        
        // Get processes that need allocation
        const processesToAllocate = updatedProcesses
          .filter((p: Process) => 
            p.status === 'waiting' && 
            p.arrivalTime <= newTime && 
            p.startAddress === undefined
          )
          .sort((a: Process, b: Process) => {
            // Sort by arrival time, then by process ID for same arrival time
            const timeDiff = a.arrivalTime - b.arrivalTime;
            return timeDiff !== 0 ? timeDiff : a.id.localeCompare(b.id);
          });

        // Process each waiting process in order
        for (const process of processesToAllocate) {
          const address = tryAllocateWaitingProcess(process, newTime);
          if (address !== null) {
            const index = updatedProcesses.findIndex((p: Process) => p.id === process.id);
            if (index !== -1) {
              updatedProcesses[index] = {
                ...updatedProcesses[index],
                status: 'running',
                startAddress: address,
                allocatedAt: newTime
              } as Process;
            }
          }
        }

        // 2. Update remaining time for running processes and check for completion
        for (let i = 0; i < updatedProcesses.length; i++) {
  const p = updatedProcesses[i];
  if (p.status === 'running' && p.remainingTime > 0) {
    if (p.remainingTime <= 1) {
      // Mark the process as completed first
      updatedProcesses[i] = {
        ...p,
        status: 'completed',
        remainingTime: 0,
        endTime: newTime
      } as Process;
      // Then deallocate
      deallocateProcess(p.id);
    } else {
      updatedProcesses[i] = {
        ...p,
        remainingTime: p.remainingTime - 1
      } as Process;
    }
  }
}

        return updatedProcesses;
      });

      return { ...prev, currentTime: newTime };
    });
  }, [deallocateProcess, tryAllocateWaitingProcess]);

  // Handle simulation timing
  useEffect(() => {
    if (!simulation.isRunning || simulation.isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(tick, simulation.speed);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [simulation.isRunning, simulation.isPaused, simulation.speed, tick]);

  const startSimulation = useCallback(() => {
    setSimulation(prev => ({ ...prev, isRunning: true, isPaused: false }));
  }, []);

  const pauseSimulation = useCallback(() => {
    setSimulation(prev => ({ ...prev, isPaused: true }));
  }, []);

  const resumeSimulation = useCallback(() => {
    setSimulation(prev => ({ ...prev, isPaused: false }));
  }, []);

  const resetSimulation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setProcesses([]);
    setMemoryBlocks([
      { id: generateId(), start: 0, size: totalMemory, processId: null, isHole: true }
    ]);
    setLogs([]);
    setSimulation(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      speed: DEFAULT_SPEED,
      currentTime: 0,
      lastFitIndex: 0,
    }));
    
    colorIndex.current = 0;
    addLog('info', 'Simulation reset', 'Memory cleared');
  }, [totalMemory, addLog]);

  const setSpeed = useCallback((speed: number) => {
    setSimulation(prev => ({ ...prev, speed }));
  }, []);

  const setTechnique = useCallback((technique: AllocationTechnique) => {
    setSimulation(prev => ({ ...prev, technique }));
  }, []);

  const changeTotalMemory = useCallback((newTotal: number) => {
    if (newTotal < totalMemory) {
      const usedMemory = memoryBlocks
        .filter(b => !b.isHole)
        .reduce((sum, b) => sum + b.size, 0);
      
      if (newTotal < usedMemory) {
        addLog('error', 'Cannot reduce memory below used memory', `Used: ${usedMemory}KB, Requested: ${newTotal}KB`);
        return false;
      }
    }

    setTotalMemory(newTotal);
    
    setMemoryBlocks(prev => {
      if (newTotal > totalMemory) {
        // If increasing memory, add a new hole at the end
        const lastBlock = [...prev].sort((a, b) => b.start - a.start)[0];
        const newHole = {
          id: generateId(),
          start: lastBlock.start + lastBlock.size,
          size: newTotal - totalMemory,
          processId: null,
          isHole: true,
        };
        return [...prev, newHole].sort((a, b) => a.start - b.start);
      } else {
        // If decreasing memory, remove from the last hole
        const lastHole = [...prev]
          .filter(b => b.isHole)
          .sort((a, b) => b.start - a.start)[0];
        
        if (lastHole) {
          const newSize = lastHole.size - (totalMemory - newTotal);
          if (newSize > 0) {
            return prev.map(b => 
              b.id === lastHole.id 
                ? { ...b, size: newSize } 
                : b
            );
          } else {
            // If the hole is too small, remove it
            return prev.filter(b => b.id !== lastHole.id);
          }
        }
        return prev;
      }
    });

    addLog('info', `Memory resized to ${newTotal}KB`);
    return true;
  }, [totalMemory, memoryBlocks, addLog]);

  const importProcesses = useCallback((newProcesses: Omit<Process, 'id' | 'color' | 'status' | 'remainingTime'>[]) => {
    const imported = newProcesses.map(process => 
      allocateProcess(process)
    ).filter(Boolean) as Process[];

    addLog(
      'info', 
      `Imported ${imported.length} processes`, 
      imported.map(p => p.name).join(', ')
    );

    return imported;
  }, [allocateProcess, addLog]);

  return {
    processes,
    memoryBlocks,
    logs,
    simulation,
    stats: getStats(),
    holes: getHoles(),
    totalMemory,
    allocateProcess,
    deallocateProcess,
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    resetSimulation,
    setSpeed,
    setTechnique,
    changeTotalMemory,
    importProcesses,
  };
}