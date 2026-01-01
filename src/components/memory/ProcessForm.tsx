import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface ProcessFormProps {
  onSubmit: (process: {
    name: string;
    size: number;
    burstTime: number;
    arrivalTime: number;
  }, manualAddress?: number) => void;
  currentTime: number;
}

export function ProcessForm({ onSubmit, currentTime }: ProcessFormProps) {
  const [name, setName] = useState('');
  const [size, setSize] = useState('');
  const [burstTime, setBurstTime] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [useManualAddress, setUseManualAddress] = useState(false);
  const [manualAddress, setManualAddress] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !size || !burstTime) return;
    
    const sizeNum = parseInt(size);
    const burstNum = parseInt(burstTime);
    const arrivalNum = arrivalTime ? parseInt(arrivalTime) : currentTime;
    
    if (isNaN(sizeNum) || isNaN(burstNum) || sizeNum <= 0 || burstNum <= 0) return;

    const address = useManualAddress && manualAddress ? parseInt(manualAddress) : undefined;
    
    onSubmit(
      { name, size: sizeNum, burstTime: burstNum, arrivalTime: arrivalNum },
      address
    );

    setName('');
    setSize('');
    setBurstTime('');
    setArrivalTime('');
    setManualAddress('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-3"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded bg-primary/20 neon-glow">
          <Cpu className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-display text-sm text-primary neon-text">ADD PROCESS</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="space-y-1">
          <Label htmlFor="name" className="text-muted-foreground text-xs">Process Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="P1"
            className="bg-muted/50 border-border focus:border-primary focus:ring-primary/50 h-8 text-sm"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <Label htmlFor="size" className="text-muted-foreground text-xs">Size (KB)</Label>
            <Input
              id="size"
              type="number"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="128"
              min="1"
              className="bg-muted/50 border-border focus:border-primary focus:ring-primary/50 h-8 text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="burst" className="text-muted-foreground text-xs">Burst</Label>
            <Input
              id="burst"
              type="number"
              value={burstTime}
              onChange={(e) => setBurstTime(e.target.value)}
              placeholder="5"
              min="1"
              className="bg-muted/50 border-border focus:border-primary focus:ring-primary/50 h-8 text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="arrival" className="text-muted-foreground text-xs">Arrival</Label>
            <Input
              id="arrival"
              type="number"
              value={arrivalTime}
              onChange={(e) => setArrivalTime(e.target.value)}
              placeholder={`${currentTime}`}
              min="0"
              className="bg-muted/50 border-border focus:border-primary focus:ring-primary/50 h-8 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-2 rounded bg-muted/30 border border-border">
          <Label htmlFor="manual" className="text-xs text-muted-foreground cursor-pointer">
            Manual Address
          </Label>
          <Switch
            id="manual"
            checked={useManualAddress}
            onCheckedChange={setUseManualAddress}
            className="scale-75"
          />
        </div>

        {useManualAddress && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-1"
          >
            <Label htmlFor="address" className="text-muted-foreground text-xs">Starting Address</Label>
            <Input
              id="address"
              type="number"
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
              placeholder="0"
              min="0"
              className="bg-muted/50 border-border focus:border-primary focus:ring-primary/50 h-8 text-sm"
            />
          </motion.div>
        )}

        <Button
          type="submit"
          size="sm"
          className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-display neon-glow text-xs"
        >
          <Plus className="w-3 h-3 mr-1" />
          ALLOCATE
        </Button>
      </form>
    </motion.div>
  );
}
