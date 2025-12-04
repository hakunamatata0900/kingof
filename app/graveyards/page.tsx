"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGraveyard, Graveyard } from '@/contexts/GraveyardContext';
import { Plus, Search, MapPin, Edit, Trash2, Grid3x3, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import GraveyardForm from '@/components/GraveyardForm';

export default function GraveyardsPage() {
  const { isAuthenticated, user } = useAuth();
  const { graveyards, plots, addGraveyard, updateGraveyard, deleteGraveyard } = useGraveyard();

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
  const [showForm, setShowForm] = useState(false);
  const [editingGraveyard, setEditingGraveyard] = useState<Graveyard | null>(null);

  const filteredGraveyards = graveyards.filter(
    (g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = (data: { name: string; location: string }) => {
    addGraveyard(data);
    setShowForm(false);
  };

  const handleUpdate = (data: { name: string; location: string }) => {
    if (editingGraveyard) {
      updateGraveyard(editingGraveyard.id, data);
      setEditingGraveyard(null);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this graveyard? All plots and graves will be removed.')) {
      deleteGraveyard(id);
    }
  };

  const getPlotCount = (graveyardId: string) => {
    return plots.filter((p) => p.graveyardId === graveyardId).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Graveyards</h1>
            <p className="text-slate-600">Manage your cemetery locations</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Graveyard
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white shadow-sm"
            />
          </div>
        </div>

        {filteredGraveyards.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-lg">
            <MapPin className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No graveyards found</h3>
            <p className="text-slate-600 mb-4">
              {searchQuery ? 'Try adjusting your search' : 'Get started by creating your first graveyard'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-blue-500 to-blue-600">
                <Plus className="mr-2 h-4 w-4" />
                Create Graveyard
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGraveyards.map((graveyard) => (
              <div
                key={graveyard.id}
                className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-3 shadow-lg">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingGraveyard(graveyard)}
                        className="rounded-lg p-2 hover:bg-blue-100 transition-colors"
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(graveyard.id)}
                        className="rounded-lg p-2 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2">{graveyard.name}</h3>
                  <p className="text-sm text-slate-600 mb-4 flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    {graveyard.location}
                  </p>

                  <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-2">
                      <Grid3x3 className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-900">
                        {getPlotCount(graveyard.id)} plots
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(graveyard.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {(showForm || editingGraveyard) && (
        <GraveyardForm
          graveyard={editingGraveyard || undefined}
          onSubmit={editingGraveyard ? handleUpdate : handleCreate}
          onClose={() => {
            setShowForm(false);
            setEditingGraveyard(null);
          }}
        />
      )}
    </div>
  );
}
