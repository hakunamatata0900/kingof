"use client";

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plot, Graveyard } from '@/contexts/GraveyardContext';

interface PlotFormProps {
  plot?: Plot;
  graveyards: Graveyard[];
  onSubmit: (data: { graveyardId: string; plotNumber: string; rows: number; columns: number }) => void;
  onClose: () => void;
}

export default function PlotForm({ plot, graveyards, onSubmit, onClose }: PlotFormProps) {
  const [graveyardId, setGraveyardId] = useState(plot?.graveyardId || '');
  const [plotNumber, setPlotNumber] = useState(plot?.plotNumber || '');
  const [rows, setRows] = useState(plot?.rows.toString() || '');
  const [columns, setColumns] = useState(plot?.columns.toString() || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (graveyardId && plotNumber.trim() && rows && columns) {
      onSubmit({
        graveyardId,
        plotNumber,
        rows: parseInt(rows),
        columns: parseInt(columns),
      });
    }
  };

  const totalGraves = rows && columns ? parseInt(rows) * parseInt(columns) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <h2 className="text-2xl font-bold text-slate-900">
            {plot ? 'Edit Plot' : 'Create New Plot'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="graveyard">Graveyard</Label>
            <Select value={graveyardId} onValueChange={setGraveyardId} disabled={!!plot}>
              <SelectTrigger>
                <SelectValue placeholder="Select a graveyard" />
              </SelectTrigger>
              <SelectContent>
                {graveyards.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="plotNumber">Plot Number</Label>
            <Input
              id="plotNumber"
              value={plotNumber}
              onChange={(e) => setPlotNumber(e.target.value)}
              placeholder="e.g., A1, B2, etc."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rows">Rows</Label>
              <Input
                id="rows"
                type="number"
                min="1"
                max="50"
                value={rows}
                onChange={(e) => setRows(e.target.value)}
                placeholder="Rows"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="columns">Columns</Label>
              <Input
                id="columns"
                type="number"
                min="1"
                max="50"
                value={columns}
                onChange={(e) => setColumns(e.target.value)}
                placeholder="Columns"
                required
              />
            </div>
          </div>

          {totalGraves > 0 && (
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm text-blue-900">
                This will create <span className="font-bold">{totalGraves} graves</span>
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700">
              {plot ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
