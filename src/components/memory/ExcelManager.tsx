import { useState, useRef, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { Upload, Download, Shuffle, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

interface ProcessData {
  name: string;
  size: number;
  burstTime: number;
  arrivalTime: number;
}

interface ExcelManagerProps {
  onImport: (processes: ProcessData[]) => void;
  totalMemory: number;
}

export function ExcelManager({ onImport, totalMemory }: ExcelManagerProps) {
  const [processCount, setProcessCount] = useState(5);
  const [currentProcesses, setCurrentProcesses] = useState<ProcessData[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const processes: ProcessData[] = jsonData.map((row: any, index: number) => ({
          name: row['Process Name'] || row['name'] || `P${index + 1}`,
          size: Number(row['Size'] || row['size'] || 64),
          burstTime: Number(row['Burst Time'] || row['burstTime'] || row['burst'] || 5),
          arrivalTime: Number(row['Arrival Time'] || row['arrivalTime'] || row['arrival'] || 0),
        }));
        
        setCurrentProcesses(processes);

        if (processes.length === 0) {
          toast.error('No valid processes found in file');
          return;
        }

        onImport(processes);
        toast.success(`Imported ${processes.length} processes`);
      } catch (error) {
        toast.error('Failed to parse Excel file');
        console.error(error);
      }
    };
    reader.readAsArrayBuffer(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const generateRandomProcesses = (): ProcessData[] => {
    const names = ['Init', 'Kernel', 'Shell', 'Editor', 'Browser', 'Player', 'Daemon', 'Server', 'Client', 'Worker', 'Cache', 'Logger', 'Monitor', 'Scheduler', 'Handler'];
    const processes: ProcessData[] = [];
    const usedArrivalTimes = new Set<number>();
    
    for (let i = 0; i < processCount; i++) {
      const baseName = names[i % names.length];
      let arrivalTime: number;
      
      // Generate a unique arrival time
      do {
        arrivalTime = Math.floor(Math.random() * 20); // 0-19 range
      } while (usedArrivalTimes.has(arrivalTime) && usedArrivalTimes.size < 20);
      
      usedArrivalTimes.add(arrivalTime);
      
      processes.push({
        name: `${baseName}${i + 1}`,
        size: Math.floor(Math.random() * (totalMemory / 4 - 32)) + 32, // 32 to totalMemory/4
        burstTime: Math.floor(Math.random() * 15) + 3, // 3-17 ticks
        arrivalTime: arrivalTime,
      });
    }

    return processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
  };

  const downloadProcesses = (processes: ProcessData[]) => {
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(
      processes.map(process => ({
        'Process Name': process.name,
        'Size (KB)': process.size,
        'Burst Time': process.burstTime,
        'Arrival Time': process.arrivalTime
      }))
    );

    // Set column widths
    worksheet['!cols'] = [
      { wch: 15 }, // Process Name
      { wch: 15 }, // Size (KB)
      { wch: 12 }, // Burst Time
      { wch: 14 }  // Arrival Time
    ];

    // Add headers style
    const headerStyle = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '4F46E5' } } // Indigo color
    };

    // Apply header style
    ['A1', 'B1', 'C1', 'D1'].forEach(cell => {
      if (!worksheet[cell]) return;
      worksheet[cell].s = headerStyle;
    });

    // Create workbook and save
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Generated Processes');
    
    // Save the file
    XLSX.writeFile(workbook, `memory_processes_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Downloaded generated processes');
  };

  const handleGenerateAndImport = () => {
    const processes = generateRandomProcesses();
    setCurrentProcesses(processes);
    onImport(processes);
    toast.success(`Generated ${processes.length} random processes`);
  };
  
  const handleDownloadGenerated = () => {
    if (currentProcesses.length === 0) {
      toast.error('No processes to download. Generate processes first.');
      return;
    }
    downloadProcesses(currentProcesses);
  };

  const handleDownloadTemplate = () => {
    // Create test cases that demonstrate different allocation scenarios
    const testCases = [
      // Small processes that can fit in small gaps
      { name: 'Small1', size: 32, burstTime: 5, arrivalTime: 0 },
      { name: 'Small2', size: 16, burstTime: 3, arrivalTime: 1 },
      { name: 'Small3', size: 8, burstTime: 4, arrivalTime: 2 },
      
      // Medium processes for general testing
      { name: 'Medium1', size: 128, burstTime: 8, arrivalTime: 3 },
      { name: 'Medium2', size: 96, burstTime: 6, arrivalTime: 4 },
      
      // Large processes that will test worst-fit
      { name: 'Large1', size: 256, burstTime: 10, arrivalTime: 5 },
      { name: 'Large2', size: 384, burstTime: 12, arrivalTime: 6 },
      
      // Processes that arrive later to test time-based allocation
      { name: 'Late1', size: 64, burstTime: 5, arrivalTime: 10 },
      { name: 'Late2', size: 192, burstTime: 7, arrivalTime: 12 },
      
      // Processes that will be deallocated to create fragmentation
      { name: 'Temp1', size: 96, burstTime: 2, arrivalTime: 1 },
      { name: 'Temp2', size: 160, burstTime: 3, arrivalTime: 2 }
    ];

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(
      testCases.map(process => ({
        'Process Name': process.name,
        'Size (KB)': process.size,
        'Burst Time': process.burstTime,
        'Arrival Time': process.arrivalTime
      }))
    );

    // Set column widths
    worksheet['!cols'] = [
      { wch: 15 }, // Process Name
      { wch: 15 }, // Size (KB)
      { wch: 12 }, // Burst Time
      { wch: 14 }  // Arrival Time
    ];

    // Add headers style
    const headerStyle = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '4F46E5' } } // Indigo color
    };

    // Apply header style
    ['A1', 'B1', 'C1', 'D1'].forEach(cell => {
      if (!worksheet[cell]) return;
      worksheet[cell].s = headerStyle;
    });

    // Create workbook and save
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Memory Test Cases');
    
    // Add a help sheet with instructions
    const helpData = [
      ['Memory Allocation Test Cases'],
      [''],
      ['This template includes test cases designed to demonstrate:'],
      ['- First Fit: Small processes that can fit in small gaps'],
      ['- Best Fit: Medium-sized processes that fit perfectly in available spaces'],
      ['- Worst Fit: Large processes that require significant memory'],
      ['- Next Fit: Processes that arrive at different times'],
      ['- Fragmentation: Processes that will be deallocated to create holes'],
      [''],
      ['Instructions:'],
      ['1. Modify the values as needed for your tests'],
      ['2. Save the file'],
      ['3. Use the "Upload Excel" button to load the test cases']
    ];
    
    const helpSheet = XLSX.utils.aoa_to_sheet(helpData);
    XLSX.utils.book_append_sheet(workbook, helpSheet, 'Instructions');

    // Save the file
    XLSX.writeFile(workbook, 'memory_allocation_test_cases.xlsx');
    toast.success('Downloaded test cases template');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-3 rounded-lg border border-border"
    >
      <div className="flex items-center gap-2 mb-3">
        <FileSpreadsheet className="w-4 h-4 text-primary" />
        <h3 className="text-xs font-bold font-display text-foreground">Batch Import</h3>
      </div>

      <div className="space-y-2">
        {/* Upload Excel */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            className="hidden"
            id="excel-upload"
          />
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs h-7"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-3 h-3 mr-1" />
            Upload Excel
          </Button>
        </div>

        {/* Random Generation */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Label className="text-[10px] text-muted-foreground">Count</Label>
            <Input
              type="number"
              min={1}
              max={20}
              value={processCount}
              onChange={(e) => setProcessCount(Math.min(20, Math.max(1, Number(e.target.value))))}
              className="h-7 text-xs"
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="secondary"
              size="sm"
              className="h-7 text-xs"
              onClick={handleGenerateAndImport}
            >
              <Shuffle className="w-3 h-3 mr-1" />
              Generate
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7 text-muted-foreground"
            onClick={handleDownloadTemplate}
          >
            <Download className="w-3 h-3 mr-1" />
            Template
          </Button>
          <Button
            variant={currentProcesses.length > 0 ? "default" : "ghost"}
            size="sm"
            className="text-xs h-7"
            onClick={handleDownloadGenerated}
            disabled={currentProcesses.length === 0}
          >
            <Download className="w-3 h-3 mr-1" />
            {currentProcesses.length > 0 ? `Save (${currentProcesses.length})` : 'Save'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
