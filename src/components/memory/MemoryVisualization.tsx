import { useEffect, useRef } from 'react';
import { Process } from '@/types/memory';

interface MemoryBlock {
  start: number;
  end: number;
  process: Process | null;
  isHole: boolean;
}

interface MemoryVisualizationProps {
  totalMemory: number;
  blocks: MemoryBlock[];
  title: string;
  color: string;
  height?: number;
}

export function MemoryVisualization({
  totalMemory,
  blocks,
  title,
  color,
  height = 200
}: MemoryVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${height}px`;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw memory blocks
    const blockHeight = 30;
    const startY = (height - blockHeight) / 2;

    blocks.forEach(block => {
      const width = ((block.end - block.start) / totalMemory) * rect.width;
      const x = (block.start / totalMemory) * rect.width;

      // Draw block
      ctx.fillStyle = block.isHole ? '#f3f4f6' : `${color}80`; // 50% opacity
      ctx.strokeStyle = block.isHole ? '#d1d5db' : color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x, startY, width, blockHeight, 4);
      ctx.fill();
      ctx.stroke();

      // Draw process info
      if (!block.isHole && block.process) {
        ctx.fillStyle = '#1f2937';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const text = `${block.process.name} (${block.process.size}KB)`;
        
        // Only draw text if there's enough space
        if (width > 60) {
          ctx.fillText(text, x + width / 2, startY + blockHeight / 2);
        }
      }

      // Draw size markers
      if (width > 40) {
        ctx.fillStyle = '#6b7280';
        ctx.font = '8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          `${block.end - block.start}KB`,
          x + width / 2,
          startY + blockHeight + 12
        );
      }
    });

    // Draw memory scale
    ctx.strokeStyle = '#9ca3af';
    ctx.beginPath();
    ctx.moveTo(0, startY + blockHeight + 30);
    ctx.lineTo(rect.width, startY + blockHeight + 30);
    ctx.stroke();

    // Draw scale markers
    const scaleSteps = 5;
    for (let i = 0; i <= scaleSteps; i++) {
      const x = (i / scaleSteps) * rect.width;
      const pos = Math.round((i / scaleSteps) * totalMemory);
      
      ctx.beginPath();
      ctx.moveTo(x, startY + blockHeight + 28);
      ctx.lineTo(x, startY + blockHeight + 32);
      ctx.stroke();
      
      ctx.fillStyle = '#6b7280';
      ctx.font = '8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${pos}KB`, x, startY + blockHeight + 44);
    }
  }, [blocks, totalMemory, color, height]);

  return (
    <div className="w-full">
      <h4 className="text-xs font-medium mb-2 text-center">{title}</h4>
      <div className="relative w-full" style={{ height: `${height}px` }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ display: 'block' }}
        />
      </div>
    </div>
  );
}
