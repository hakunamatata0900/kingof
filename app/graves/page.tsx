"use client";

import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGraveyard, Grave } from '@/contexts/GraveyardContext';
import { CheckSquare, Grid3x3, Search, Trash2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import GraveModal from '@/components/GraveModal';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function GravesPage() {
  const { isAuthenticated, user } = useAuth();
  const { graveyards, plots, graves, updateGrave, bulkUpdateGraves } = useGraveyard();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl text-center">
          <div className="rounded-full bg-red-100 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Lock className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600">You need to be logged in to view graves.</p>
        </div>
      </div>
    );
  }

  const canModify = ['admin', 'staff'].includes(user?.role || '');

  const [filterGraveyardId, setFilterGraveyardId] = useState<string>('all');
  const [filterPlotId, setFilterPlotId] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrave, setSelectedGrave] = useState<Grave | null>(null);
  const [selectedGraves, setSelectedGraves] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);

  const filteredPlots = useMemo(() => {
    if (filterGraveyardId === 'all') return plots;
    return plots.filter((p) => p.graveyardId === filterGraveyardId);
  }, [plots, filterGraveyardId]);

  const displayedPlot = useMemo(() => {
    if (filterPlotId === 'all') return filteredPlots[0];
    return plots.find((p) => p.id === filterPlotId);
  }, [filterPlotId, filteredPlots, plots]);

  const filteredGraves = useMemo(() => {
    if (!displayedPlot) return [];

    let plotGraves = graves.filter((g) => g.plotId === displayedPlot.id);

    if (filterStatus !== 'all') {
      plotGraves = plotGraves.filter((g) => g.status === filterStatus);
    }

    if (searchQuery) {
      plotGraves = plotGraves.filter(
        (g) =>
          g.graveNumber.toString().includes(searchQuery) ||
          g.reservedBy?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return plotGraves;
  }, [graves, displayedPlot, filterStatus, searchQuery]);

  const handleGraveClick = (grave: Grave) => {
    if (selectionMode) {
      setSelectedGraves((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(grave.id)) {
          newSet.delete(grave.id);
        } else {
          newSet.add(grave.id);
        }
        return newSet;
      });
    } else {
      setSelectedGrave(grave);
    }
  };

  const handleUpdateGrave = (status: 'available' | 'unavailable', reservedBy?: string) => {
    if (selectedGrave) {
      updateGrave(selectedGrave.id, { status, reservedBy });
    }
  };

  const handleBulkAction = (action: 'reserve' | 'release') => {
    const updates = action === 'reserve'
      ? { status: 'unavailable' as const }
      : { status: 'available' as const, reservedBy: undefined };

    bulkUpdateGraves(Array.from(selectedGraves), updates);
    setSelectedGraves(new Set());
    setSelectionMode(false);
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedGraves(new Set());
  };

  if (!displayedPlot) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl bg-white p-12 text-center shadow-lg">
            <Grid3x3 className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No plots available</h3>
            <p className="text-slate-600">Create a plot first to manage graves</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Graves</h1>
            <p className="text-slate-600">Manage grave reservations and availability</p>
          </div>
          {canModify && (
            <Button
              onClick={toggleSelectionMode}
              variant={selectionMode ? 'default' : 'outline'}
              className={selectionMode ? 'bg-gradient-to-r from-cyan-500 to-cyan-600' : ''}
            >
              <CheckSquare className="mr-2 h-4 w-4" />
              {selectionMode ? 'Exit Selection' : 'Bulk Select'}
            </Button>
          )}
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select value={filterGraveyardId} onValueChange={(value) => {
            setFilterGraveyardId(value);
            setFilterPlotId('all');
          }}>
            <SelectTrigger className="bg-white shadow-sm">
              <SelectValue placeholder="Filter by graveyard" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Graveyards</SelectItem>
              {graveyards.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterPlotId} onValueChange={setFilterPlotId}>
            <SelectTrigger className="bg-white shadow-sm">
              <SelectValue placeholder="Select plot" />
            </SelectTrigger>
            <SelectContent>
              {filteredPlots.length === 0 ? (
                <SelectItem value="none" disabled>No plots available</SelectItem>
              ) : (
                filteredPlots.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    Plot {p.plotNumber}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="bg-white shadow-sm">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="unavailable">Reserved</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search graves..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white shadow-sm"
            />
          </div>
        </div>

        {selectionMode && selectedGraves.size > 0 && (
          <div className="mb-6 rounded-xl bg-white p-4 shadow-lg flex items-center justify-between">
            <span className="text-sm font-medium text-slate-900">
              {selectedGraves.size} grave{selectedGraves.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <Button
                onClick={() => handleBulkAction('reserve')}
                size="sm"
                className="bg-gradient-to-r from-red-500 to-red-600"
              >
                Reserve Selected
              </Button>
              <Button
                onClick={() => handleBulkAction('release')}
                size="sm"
                variant="outline"
                className="border-green-500 text-green-700"
              >
                Release Selected
              </Button>
              <Button
                onClick={() => setSelectedGraves(new Set())}
                size="sm"
                variant="outline"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-white p-6 shadow-lg">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">
              Plot {displayedPlot.plotNumber} - {displayedPlot.rows} × {displayedPlot.columns}
            </h2>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-green-500"></div>
                <span className="text-slate-600">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-red-500"></div>
                <span className="text-slate-600">Reserved</span>
              </div>
            </div>
          </div>

          <TooltipProvider>
            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${displayedPlot.columns}, minmax(0, 1fr))`,
              }}
            >
              {filteredGraves.map((grave) => {
                const isSelected = selectedGraves.has(grave.id);
                return (
                  <Tooltip key={grave.id}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleGraveClick(grave)}
                        className={`
                          aspect-square rounded-lg transition-all duration-200 relative
                          ${grave.status === 'available' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}
                          ${isSelected ? 'ring-4 ring-cyan-500 scale-95' : 'hover:scale-105 hover:shadow-lg'}
                        `}
                      >
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                          {grave.graveNumber}
                        </span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-xs">
                        <p className="font-semibold">Grave #{grave.graveNumber}</p>
                        <p className="text-slate-300">
                          {grave.status === 'available' ? 'Available' : `Reserved${grave.reservedBy ? ` - ${grave.reservedBy}` : ''}`}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </TooltipProvider>
        </div>
      </div>

      {selectedGrave && (
        <GraveModal
          grave={selectedGrave}
          plotNumber={displayedPlot.plotNumber}
          onUpdate={handleUpdateGrave}
          onClose={() => setSelectedGrave(null)}
        />
      )}
    </div>
  );
}
