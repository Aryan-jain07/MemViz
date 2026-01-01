import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Terminal, AlertCircle, CheckCircle2, XCircle, Info } from 'lucide-react';

interface AllocationLog {
  id: string;
  timestamp: Date;
  type: 'allocation' | 'deallocation' | 'error' | 'warning' | 'info';
  message: string;
  details?: string;
  processId?: string;
  processName?: string;
  technique?: string;
}

interface AllocationLogsProps {
  logs: AllocationLog[];
  maxLogs?: number;
}

const getLogIcon = (type: AllocationLog['type']) => {
  const iconSize = 14;
  switch (type) {
    case 'allocation':
      return <CheckCircle2 size={iconSize} className="text-green-500" />;
    case 'deallocation':
      return <XCircle size={iconSize} className="text-red-500" />;
    case 'error':
      return <AlertCircle size={iconSize} className="text-red-500" />;
    case 'warning':
      return <AlertCircle size={iconSize} className="text-yellow-500" />;
    case 'info':
    default:
      return <Info size={iconSize} className="text-blue-500" />;
  }
};

export function AllocationLogs({ logs = [], maxLogs = 100 }: AllocationLogsProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [logs]);

  return (
    <div className="h-[300px] flex flex-col border rounded-lg overflow-hidden bg-card">
      <div className="p-3 border-b bg-muted/50">
        <h2 className="text-sm font-medium flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          Kernel Logs
        </h2>
      </div>
      <div className="flex-1 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="p-2 space-y-2">
            <AnimatePresence initial={false}>
              {logs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  <span>No logs available</span>
                </div>
              ) : (
                logs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="text-xs p-2 rounded border bg-card/50 hover:bg-card transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">
                        {getLogIcon(log.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {log.message}
                          </span>
                          <span className="text-muted-foreground text-[0.7rem]">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        {log.details && (
                          <p className="mt-0.5 text-muted-foreground">
                            {log.details}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}