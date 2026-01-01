import { motion } from 'framer-motion';
import { useMemorySimulation } from '@/hooks/useMemorySimulation';
import { Terminal } from 'lucide-react';
import { Header } from '@/components/memory/Header';
import { MemoryBar } from '@/components/memory/MemoryBar';
import { ProcessForm } from '@/components/memory/ProcessForm';
import { ControlPanel } from '@/components/memory/ControlPanel';
import { StatsPanel } from '@/components/memory/StatsPanel';
import { HolesTable } from '@/components/memory/HolesTable';
import { AllocationLogs } from '@/components/memory/AllocationLogs';
import { ProcessList } from '@/components/memory/ProcessList';
import { ExcelManager } from '@/components/memory/ExcelManager';
const Index = () => {
  const {
    processes,
    memoryBlocks,
    logs,
    simulation,
    stats,
    holes,
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
  } = useMemorySimulation();

  const handleAddProcess = (
    process: { name: string; size: number; burstTime: number; arrivalTime: number },
    manualAddress?: number
  ) => {
    allocateProcess(process, manualAddress);
  };

  return (
    <div className="min-h-screen bg-background cyber-grid relative overflow-x-hidden">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <Header />

        <main className="container mx-auto px-4 py-6 space-y-6">
          {/* 1. Memory Map - Hero Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <h2 className="text-lg font-medium text-foreground/90">Memory Map</h2>
            <div className="glass-panel p-4">
              <MemoryBar blocks={memoryBlocks} totalMemory={totalMemory} />
            </div>
          </motion.section>

          {/* 2. Memory State Row */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Processes Panel */}
            <div className="glass-panel p-4">
              <h2 className="text-lg font-medium mb-4 text-foreground/90">Processes</h2>
              <ProcessList 
                processes={processes} 
                onTerminate={deallocateProcess}
              />
            </div>

            {/* Holes Panel */}
            <div className="glass-panel p-4">
              <h2 className="text-lg font-medium mb-4 text-foreground/90">Memory Holes</h2>
              <HolesTable holes={holes} />
            </div>
          </section>

          {/* 3. Control & Observability Row */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Control Panel */}
            <div className="glass-panel p-4">
              <h2 className="text-lg font-medium mb-4 text-foreground/90">Simulation Controls</h2>
              <ControlPanel
                simulation={simulation}
                totalMemory={totalMemory}
                currentProcesses={processes.map(p => ({
                  name: p.name,
                  size: p.size,
                  burstTime: p.burstTime,
                  arrivalTime: p.arrivalTime
                }))}
                onStart={startSimulation}
                onPause={pauseSimulation}
                onResume={resumeSimulation}
                onReset={resetSimulation}
                onSpeedChange={setSpeed}
                onTechniqueChange={setTechnique}
                onTotalMemoryChange={changeTotalMemory}
              />
            </div>

            {/* Stats Panel */}
            <div className="glass-panel p-4">
              <h2 className="text-lg font-medium mb-4 text-foreground/90">System Statistics</h2>
              <StatsPanel stats={stats} currentTime={simulation.currentTime} />
            </div>

            {/* Kernel Logs */}
            <div className="glass-panel p-4 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-foreground/90">Kernel Logs</h2>
                <div className="flex items-center gap-2 text-success">
                  <Terminal className="w-4 h-4" />
                  <span className="text-xs font-mono">ACTIVE</span>
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <AllocationLogs logs={logs} />
              </div>
            </div>
          </section>

          {/* 4. Input & Simulation Row */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-4">
              <h2 className="text-lg font-medium mb-4 text-foreground/90">Add Process</h2>
              <ProcessForm 
                onSubmit={handleAddProcess} 
                currentTime={simulation.currentTime} 
              />
            </div>
            <div className="glass-panel p-4">
              <h2 className="text-lg font-medium mb-4 text-foreground/90">Batch Import</h2>
              <ExcelManager 
                onImport={importProcesses} 
                totalMemory={totalMemory} 
              />
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="relative z-10 border-t border-border py-3 mt-4">
          <div className="container mx-auto px-4 text-center">
            <p className="text-xs text-muted-foreground font-mono">
              OS Memory Allocation Visualizer • Contiguous Allocation Techniques
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
