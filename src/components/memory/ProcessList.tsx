import { motion, AnimatePresence } from 'framer-motion';
import { Process } from '@/types/memory';
import { Cpu, Clock, MapPin, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface ProcessListProps {
  processes: Process[];
  onTerminate: (id: string) => void;
}

export function ProcessList({ processes, onTerminate }: ProcessListProps) {
  const activeProcesses = processes.filter(p => p.status === 'running');
  const completedProcesses = processes.filter(p => p.status === 'completed');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-3"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded bg-neon-purple/20 neon-glow-purple">
          <Cpu className="w-4 h-4 text-secondary" />
        </div>
        <h3 className="font-display text-sm text-secondary neon-text-purple">PROCESSES</h3>
        <span className="ml-auto text-xs text-muted-foreground">
          {activeProcesses.length} active
        </span>
      </div>

      <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
        <AnimatePresence mode="popLayout">
          {activeProcesses.length === 0 && completedProcesses.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <Cpu className="w-6 h-6 mx-auto mb-1 opacity-50" />
              <p className="text-xs">No processes</p>
            </div>
          ) : (
            <>
              {activeProcesses.map((process) => (
                  <motion.div
                    key={process.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, x: 20 }}
                    className="p-2 rounded bg-muted/30 border"
                    style={{ 
                      borderColor: process.color,
                      boxShadow: `0 0 10px ${process.color}20`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <div 
                          className="w-2 h-2 rounded-full animate-pulse"
                          style={{ backgroundColor: process.color }}
                        />
                        <span className="font-display font-bold text-xs text-foreground">
                          {process.name}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                        onClick={() => onTerminate(process.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-1.5">
                      <div className="flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5" />
                        <span>{process.startAddress}</span>
                      </div>
                      <span>{process.size} KB</span>
                      <div className="flex items-center gap-0.5 ml-auto">
                        <Clock className="w-2.5 h-2.5" />
                        <span className="font-mono text-primary">
                          {process.remainingTime}/{process.burstTime}
                        </span>
                      </div>
                    </div>
                    <Progress 
                      value={((process.burstTime - process.remainingTime) / process.burstTime) * 100}
                      className="h-1"
                    />
                  </motion.div>
              ))}

              {completedProcesses.length > 0 && (
                <div className="pt-2 border-t border-border">
                  <p className="text-[10px] text-muted-foreground mb-1">Done ({completedProcesses.length})</p>
                  {completedProcesses.slice(0, 3).map((process) => (
                    <motion.div
                      key={process.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.5 }}
                      className="flex items-center gap-1 text-[10px] text-muted-foreground py-0.5"
                    >
                      <div 
                        className="w-1.5 h-1.5 rounded-full opacity-50"
                        style={{ backgroundColor: process.color }}
                      />
                      <span>{process.name}</span>
                      <span className="ml-auto">✓</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
