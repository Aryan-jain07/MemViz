import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AllocationTechnique, SimulationState } from '@/types/memory';
import { ComparisonMode } from './ComparisonMode';

interface ControlPanelProps {
  simulation: SimulationState;
  totalMemory: number;
  currentProcesses: Array<{ name: string; size: number; burstTime: number; arrivalTime: number }>;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onTechniqueChange: (technique: AllocationTechnique) => void;
  onTotalMemoryChange: (size: number) => void;
}

const TECHNIQUES: { value: AllocationTechnique; label: string }[] = [
  { value: 'first-fit', label: 'First Fit' },
  { value: 'best-fit', label: 'Best Fit' },
  { value: 'worst-fit', label: 'Worst Fit' },
  { value: 'next-fit', label: 'Next Fit' },
];

export function ControlPanel({
  simulation,
  totalMemory,
  currentProcesses,
  onStart,
  onPause,
  onResume,
  onReset,
  onSpeedChange,
  onTechniqueChange,
  onTotalMemoryChange,
}: ControlPanelProps) {
  const speedMs = simulation.speed;
  const speedLabel = speedMs >= 1000 
    ? `${(speedMs / 1000).toFixed(1)}s` 
    : `${speedMs}ms`;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-3"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded bg-primary/20 neon-glow">
          <Settings className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-display text-sm text-primary neon-text">CONTROL PANEL</h3>
      </div>

      <div className="space-y-3">
        {/* Playback controls */}
        <div className="flex flex-wrap items-center gap-2">
          {!simulation.isRunning ? (
            <Button
              onClick={onStart}
              size="sm"
              className="flex-1 min-w-[80px] bg-success hover:bg-success/80 text-success-foreground font-display text-xs"
            >
              <Play className="w-3 h-3 mr-1" />
              START
            </Button>
          ) : simulation.isPaused ? (
            <Button
              onClick={onResume}
              size="sm"
              className="flex-1 min-w-[80px] bg-success hover:bg-success/80 text-success-foreground font-display text-xs"
            >
              <Play className="w-3 h-3 mr-1" />
              RESUME
            </Button>
          ) : (
            <Button
              onClick={onPause}
              size="sm"
              className="flex-1 min-w-[80px] bg-warning hover:bg-warning/80 text-warning-foreground font-display text-xs"
            >
              <Pause className="w-3 h-3 mr-1" />
              PAUSE
            </Button>
          )}
          
          <Button
            onClick={onReset}
            variant="outline"
            size="sm"
            className="border-destructive text-destructive hover:bg-destructive/10"
          >
            <RotateCcw className="w-3 h-3" />
          </Button>
          
          <ComparisonMode totalMemory={totalMemory} currentProcesses={currentProcesses} />
        </div>

        {/* Technique selector */}
        <div className="space-y-1">
          <Label className="text-muted-foreground text-xs">Allocation Technique</Label>
          <Select
            value={simulation.technique}
            onValueChange={(value) => onTechniqueChange(value as AllocationTechnique)}
          >
            <SelectTrigger className="bg-muted/50 border-border h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {TECHNIQUES.map((tech) => (
                <SelectItem key={tech.value} value={tech.value} className="text-xs">
                  {tech.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Total Memory Size */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-muted-foreground text-xs">Total Memory</Label>
            <span className="text-xs font-mono text-primary">{totalMemory} KB</span>
          </div>
          <Slider
            value={[totalMemory]}
            onValueChange={([value]) => onTotalMemoryChange(value)}
            min={256}
            max={4096}
            step={128}
            disabled={simulation.isRunning}
            className="[&_[role=slider]]:bg-accent [&_[role=slider]]:border-accent [&_[role=slider]]:h-3 [&_[role=slider]]:w-3"
          />
        </div>

        {/* Speed control */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-muted-foreground text-xs">Speed</Label>
            <span className="text-xs font-mono text-primary">{speedLabel}/tick</span>
          </div>
          <Slider
            value={[speedMs]}
            onValueChange={([value]) => onSpeedChange(value)}
            min={100}
            max={3000}
            step={100}
            className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary [&_[role=slider]]:h-3 [&_[role=slider]]:w-3"
          />
        </div>

        {/* Status indicator */}
        <div className="p-2 rounded bg-muted/30 border border-border">
          <div className="flex items-center gap-2">
            <div 
              className={`w-2 h-2 rounded-full ${
                simulation.isRunning && !simulation.isPaused
                  ? 'bg-success animate-pulse'
                  : simulation.isPaused
                  ? 'bg-warning'
                  : 'bg-muted-foreground'
              }`}
            />
            <span className="text-xs text-muted-foreground">
              {simulation.isRunning && !simulation.isPaused
                ? 'Running'
                : simulation.isPaused
                ? 'Paused'
                : 'Stopped'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
