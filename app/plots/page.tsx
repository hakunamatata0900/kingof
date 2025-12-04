"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGraveyard, Plot } from '@/contexts/GraveyardContext';
import { Plus, Search, Grid3x3, Edit, Trash2, MapPin, Boxes, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PlotForm from '@/components/PlotForm';

export default function PlotsPage() {
  const { isAuthenticated, user } = useAuth();
  const { graveyards, plots, graves, addPlot, updatePlot, deletePlot } = useGraveyard();

  if (!isAuthenticated || !['admin', 'staff'].includes(user?.role || '')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl text-center">
          <div className="rounded-full bg-red-100 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Lock className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600">You don't have permission to access this module.</p>
        </div>
      </div>
    );
  }
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGraveyardId, setFilterGraveyardId] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingPlot, setEditingPlot] = useState<Plot | null>(null);

  const filteredPlots = plots.filter((p) => {
    const matchesSearch = p.plotNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGraveyard = filterGraveyardId === 'all' || p.graveyardId === filterGraveyardId;
    return matchesSearch && matchesGraveyard;
  });

  const handleCreate = (data: { graveyardId: string; plotNumber: string; rows: number; columns: number }) => {
    addPlot(data);
    setShowForm(false);
  };

  const handleUpdate = (data: { graveyardId: string; plotNumber: string; rows: number; columns: number }) => {
    if (editingPlot) {
      updatePlot(editingPlot.id, data);
      setEditingPlot(null);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this plot? All graves in this plot will be removed.')) {
      deletePlot(id);
    }
  };

  const getGraveyardName = (graveyardId: string) => {
    return graveyards.find((g) => g.id === graveyardId)?.name || 'Unknown';
  };

  const getGraveStats = (plotId: string) => {
    const plotGraves = graves.filter((g) => g.plotId === plotId);
    const available = plotGraves.filter((g) => g.status === 'available').length;
    const unavailable = plotGraves.filter((g) => g.status === 'unavailable').length;
    return { available, unavailable, total: plotGraves.length };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Plots</h1>
            <p className="text-slate-600">Manage cemetery plots and their layout</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Plot
          </Button>
        </div>

        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by plot number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white shadow-sm"
            />
          </div>
          <Select value={filterGraveyardId} onValueChange={setFilterGraveyardId}>
            <SelectTrigger className="w-64 bg-white shadow-sm">
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
        </div>

        {filteredPlots.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-lg">
            <Grid3x3 className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No plots found</h3>
            <p className="text-slate-600 mb-4">
              {searchQuery || filterGraveyardId !== 'all' ? 'Try adjusting your filters' : 'Get started by creating your first plot'}
            </p>
            {!searchQuery && filterGraveyardId === 'all' && (
              <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-amber-500 to-amber-600">
                <Plus className="mr-2 h-4 w-4" />
                Create Plot
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlots.map((plot) => {
              const stats = getGraveStats(plot.id);
              return (
                <div
                  key={plot.id}
                  className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 p-3 shadow-lg">
                        <Grid3x3 className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingPlot(plot)}
                          className="rounded-lg p-2 hover:bg-amber-100 transition-colors"
                        >
                          <Edit className="h-4 w-4 text-amber-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(plot.id)}
                          className="rounded-lg p-2 hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-2">Plot {plot.plotNumber}</h3>
                    <p className="text-sm text-slate-600 mb-4 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {getGraveyardName(plot.graveyardId)}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Layout</span>
                        <span className="font-medium text-slate-900">
                          {plot.rows} × {plot.columns}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Total Graves</span>
                        <span className="font-medium text-slate-900">{stats.total}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
                      <div className="flex items-center gap-1">
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                        <span className="text-xs font-medium text-slate-600">{stats.available}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-3 w-3 rounded-full bg-red-500"></div>
                        <span className="text-xs font-medium text-slate-600">{stats.unavailable}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {(showForm || editingPlot) && (
        <PlotForm
          plot={editingPlot || undefined}
          graveyards={graveyards}
          onSubmit={editingPlot ? handleUpdate : handleCreate}
          onClose={() => {
            setShowForm(false);
            setEditingPlot(null);
          }}
        />
      )}
    </div>
  );
}
