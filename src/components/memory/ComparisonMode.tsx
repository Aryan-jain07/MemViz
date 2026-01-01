import { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ComparisonModeProps {
  totalMemory: number;
  currentProcesses: Array<{ name: string; size: number; burstTime: number; arrivalTime: number }>;
}

export function ComparisonMode({ totalMemory, currentProcesses }: ComparisonModeProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-7"
          disabled={currentProcesses.length === 0}
        >
          <BarChart3 className="w-3 h-3 mr-1" />
          Compare
        </Button>
      </div>

      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Memory Allocation Comparison</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="text-center py-8 text-muted-foreground">
            Memory allocation comparison will be implemented here.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}