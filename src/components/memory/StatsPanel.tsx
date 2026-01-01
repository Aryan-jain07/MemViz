import { motion } from 'framer-motion';
import { MemoryStats } from '@/types/memory';
import { HardDrive, Activity, AlertTriangle, Clock } from 'lucide-react';

interface StatsPanelProps {
  stats: MemoryStats;
  currentTime: number;
}

export function StatsPanel({ stats, currentTime }: StatsPanelProps) {
  const statItems = [
    {
      label: 'MEMORY UTILIZATION',
      value: `${stats.utilization.toFixed(1)}%`,
      icon: HardDrive,
      color: 'primary',
      progress: stats.utilization,
    },
    {
      label: 'USED MEMORY',
      value: `${stats.usedMemory} KB`,
      icon: Activity,
      color: 'neon-cyan',
      progress: (stats.usedMemory / stats.totalMemory) * 100,
    },
    {
      label: 'FREE MEMORY',
      value: `${stats.freeMemory} KB`,
      icon: HardDrive,
      color: 'neon-green',
      progress: (stats.freeMemory / stats.totalMemory) * 100,
    },
    {
      label: 'EXTERNAL FRAGMENTATION',
      value: `${stats.externalFragmentation} KB`,
      icon: AlertTriangle,
      color: 'warning',
      progress: (stats.externalFragmentation / stats.totalMemory) * 100,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-panel p-3 space-y-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm text-primary neon-text">SYSTEM STATS</h3>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span className="font-mono text-xs">T: {currentTime}</span>
        </div>
      </div>

      <div className="space-y-2">
        {statItems.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-1"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <stat.icon className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">{stat.label}</span>
              </div>
              <span className="font-mono text-xs text-foreground">{stat.value}</span>
            </div>
            
            <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(stat.progress, 100)}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full rounded-full relative overflow-hidden"
                style={{
                  background: stat.color === 'primary' 
                    ? 'linear-gradient(90deg, hsl(185, 100%, 50%), hsl(210, 100%, 60%))'
                    : stat.color === 'neon-cyan'
                    ? 'hsl(185, 100%, 50%)'
                    : stat.color === 'neon-green'
                    ? 'hsl(150, 100%, 50%)'
                    : 'hsl(45, 100%, 50%)',
                  boxShadow: '0 0 10px currentColor',
                }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
        <div className="text-center p-2 rounded bg-muted/30">
          <div className="text-lg font-display text-primary neon-text">
            {stats.numberOfHoles}
          </div>
          <div className="text-[10px] text-muted-foreground">HOLES</div>
        </div>
        <div className="text-center p-2 rounded bg-muted/30">
          <div className="text-lg font-display text-secondary neon-text-purple">
            {stats.numberOfProcesses}
          </div>
          <div className="text-[10px] text-muted-foreground">ACTIVE</div>
        </div>
      </div>
    </motion.div>
  );
}
