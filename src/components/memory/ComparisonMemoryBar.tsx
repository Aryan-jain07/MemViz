import { motion } from 'framer-motion';
import { MemoryBlock } from '@/types/memory';

interface ComparisonMemoryBarProps {
  blocks: MemoryBlock[];
  totalMemory: number;
  title: string;
  color: string;
  height?: number;
}

export function ComparisonMemoryBar({ 
  blocks, 
  totalMemory, 
  title, 
  color,
  height = 200 
}: ComparisonMemoryBarProps) {
  return (
    <div className="w-full bg-card/50 rounded-lg border border-border overflow-hidden">
      <div className="p-3 border-b border-border bg-muted/10">
        <h4 className="text-xs font-medium text-foreground">{title}</h4>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">Memory Map</span>
          <span className="text-xs text-muted-foreground">{totalMemory} KB</span>
        </div>
        
        {/* Address markers */}
        <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
          <span>0</span>
          <span>{Math.floor(totalMemory / 4)}</span>
          <span>{Math.floor(totalMemory / 2)}</span>
          <span>{Math.floor((totalMemory * 3) / 4)}</span>
          <span>{totalMemory}</span>
        </div>

        {/* Memory bar container */}
        <div className="relative h-6 bg-muted/50 rounded overflow-hidden border border-border">
          {/* Grid overlay */}
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(90deg, #00000010 1px, transparent 1px)',
            backgroundSize: '20px 100%'
          }} />
          
          {/* Memory blocks */}
          <div className="relative h-full flex">
            {blocks.map((block, index) => {
              const width = (block.size / totalMemory) * 100;
              
              return (
                <motion.div
                  key={`${block.id}-${index}`}
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className={`relative h-full flex items-center justify-center overflow-hidden ${
                    block.isHole 
                      ? 'bg-muted/30 border-r border-dashed border-muted-foreground/30' 
                      : 'border-r border-background/50'
                  }`}
                  style={{
                    width: `${width}%`,
                    backgroundColor: block.isHole ? undefined : color,
                    opacity: block.isHole ? 0.7 : 0.9,
                  }}
                >
                  {/* Block info */}
                  {width > 10 && !block.isHole && (
                    <div className="relative z-10 text-center px-1">
                      <div className="text-[10px] font-medium text-background truncate">
                        {block.processName}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
            <span className="text-muted-foreground">Allocated</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-muted/30 border border-dashed border-muted-foreground/30" />
            <span className="text-muted-foreground">Free</span>
          </div>
        </div>
      </div>
    </div>
  );
}
