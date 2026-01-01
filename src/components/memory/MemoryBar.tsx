import { motion } from 'framer-motion';
import { MemoryBlock } from '@/types/memory';

interface MemoryBarProps {
  blocks: MemoryBlock[];
  totalMemory: number;
}

export function MemoryBar({ blocks, totalMemory }: MemoryBarProps) {
  return (
    <div className="glass-panel p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-display text-sm text-primary neon-text">MEMORY MAP</h3>
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
      <div className="relative h-12 bg-muted/50 rounded overflow-hidden border border-border">
        {/* Grid overlay */}
        <div className="absolute inset-0 cyber-grid-dense opacity-30" />
        
        {/* Memory blocks */}
        <div className="relative h-full flex">
          {blocks.map((block, index) => {
            const width = (block.size / totalMemory) * 100;
            
            return (
              <motion.div
                key={block.id}
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                exit={{ opacity: 0, scaleX: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={`relative h-full flex items-center justify-center overflow-hidden ${
                  block.isHole 
                    ? 'hole-pattern border-r border-dashed border-muted-foreground/30' 
                    : 'border-r border-background/50'
                }`}
                style={{
                  width: `${width}%`,
                  backgroundColor: block.isHole ? undefined : block.color,
                  boxShadow: block.isHole ? undefined : `0 0 20px ${block.color}40, inset 0 0 20px ${block.color}20`,
                }}
              >
                {/* Animated glow effect for allocated blocks */}
                {!block.isHole && (
                  <motion.div
                    className="absolute inset-0"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    style={{
                      background: `linear-gradient(90deg, transparent, ${block.color}40, transparent)`,
                    }}
                  />
                )}
                
                {/* Block info */}
                {width > 5 && (
                  <div className="relative z-10 text-center px-1">
                    <div className={`text-xs font-bold truncate ${
                      block.isHole ? 'text-muted-foreground' : 'text-background'
                    }`}>
                      {block.isHole ? 'FREE' : block.processName}
                    </div>
                    <div className={`text-[10px] ${
                      block.isHole ? 'text-muted-foreground/70' : 'text-background/80'
                    }`}>
                      {block.size} KB
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Scanline effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent"
          animate={{
            y: ['-100%', '200%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{ height: '50%' }}
        />
      </div>

      {/* Detailed block list */}
      <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1">
        {blocks.map((block) => (
          <motion.div
            key={block.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-1.5 rounded text-[10px] ${
              block.isHole 
                ? 'bg-muted/30 border border-dashed border-muted-foreground/30' 
                : 'border border-solid'
            }`}
            style={{
              borderColor: block.isHole ? undefined : block.color,
              boxShadow: block.isHole ? undefined : `0 0 8px ${block.color}20`,
            }}
          >
            <div className="flex items-center gap-1">
              {!block.isHole && (
                <div 
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: block.color }}
                />
              )}
              <span className={`truncate ${block.isHole ? 'text-muted-foreground' : 'text-foreground'}`}>
                {block.isHole ? 'Hole' : block.processName}
              </span>
            </div>
            <div className="text-muted-foreground">
              {block.start}-{block.start + block.size - 1}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
