import { motion, AnimatePresence } from 'framer-motion';
import { Hole } from '@/types/memory';
import { CircleDashed } from 'lucide-react';

interface HolesTableProps {
  holes: Hole[];
}

export function HolesTable({ holes }: HolesTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-3"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded bg-secondary/20 neon-glow-purple">
          <CircleDashed className="w-4 h-4 text-secondary" />
        </div>
        <h3 className="font-display text-sm text-secondary neon-text-purple">HOLE LIST</h3>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-2 py-1.5 text-left text-[10px] text-muted-foreground font-mono">START</th>
              <th className="px-2 py-1.5 text-left text-[10px] text-muted-foreground font-mono">END</th>
              <th className="px-2 py-1.5 text-left text-[10px] text-muted-foreground font-mono">SIZE</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {holes.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-2 py-4 text-center text-muted-foreground text-xs">
                    No holes
                  </td>
                </tr>
              ) : (
                holes.map((hole, index) => (
                  <motion.tr
                    key={hole.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-t border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-2 py-1.5 font-mono text-xs text-foreground">{hole.start}</td>
                    <td className="px-2 py-1.5 font-mono text-xs text-foreground">{hole.end}</td>
                    <td className="px-2 py-1.5">
                      <span className="inline-flex items-center gap-1">
                        <span className="font-mono text-xs text-primary">{hole.size} KB</span>
                        <div 
                          className="h-1.5 rounded-full bg-primary/50"
                          style={{ 
                            width: `${Math.min((hole.size / 256) * 60, 60)}px`,
                            boxShadow: '0 0 8px hsl(185, 100%, 50%)',
                          }}
                        />
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
