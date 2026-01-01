import { motion } from 'framer-motion';
import { Cpu, Zap } from 'lucide-react';

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden"
    >
      {/* Background effects */}
      <div className="absolute inset-0 cyber-grid opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10" />
      
      <div className="relative container mx-auto px-4 py-3">
        <div className="flex items-center justify-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="relative"
          >
            <div className="p-2 rounded-lg bg-primary/20 neon-glow">
              <Cpu className="w-6 h-6 text-primary" />
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-0.5 -right-0.5"
            >
              <Zap className="w-3 h-3 text-warning" />
            </motion.div>
          </motion.div>

          <div className="text-center">
            <motion.h1 
              className="font-display text-xl md:text-2xl font-bold text-primary neon-text tracking-wider"
              animate={{ textShadow: [
                '0 0 10px hsl(185, 100%, 50%), 0 0 20px hsl(185, 100%, 50%)',
                '0 0 20px hsl(185, 100%, 50%), 0 0 40px hsl(185, 100%, 50%)',
                '0 0 10px hsl(185, 100%, 50%), 0 0 20px hsl(185, 100%, 50%)',
              ]}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              OS MEMORY ALLOCATOR
            </motion.h1>
            <p className="text-muted-foreground font-mono text-xs">
              Real-time visualization of memory allocation techniques
            </p>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
