"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGraveyard, Graveyard } from '@/contexts/GraveyardContext';
import { Lock, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import GraveyardMapView from '@/components/GraveyardMapView';
import GraveyardPropertiesPanel from '@/components/GraveyardPropertiesPanel';

export default function GraveyardsPage() {
  const { isAuthenticated, user } = useAuth();
  const { graveyards, updateGraveyard } = useGraveyard();
  const [selectedGraveyardId, setSelectedGraveyardId] = useState<string | undefined>();
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);

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

  const selectedGraveyard = graveyards.find((g) => g.id === selectedGraveyardId);

  const handleSelectGraveyard = (graveyard: Graveyard) => {
    setSelectedGraveyardId(graveyard.id);
    setShowDetailsPanel(true);
  };

  const handleUpdateGraveyard = (updates: Partial<Graveyard>) => {
    if (selectedGraveyardId) {
      updateGraveyard(selectedGraveyardId, updates);
      if (selectedGraveyard) {
        setSelectedGraveyardId(selectedGraveyard.id);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 p-8">
      <div className="mx-auto max-w-7xl mb-6">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Graveyards</h1>
        <p className="text-slate-600">Manage your cemetery locations on the map</p>
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden" style={{ minHeight: '70vh' }}>
          <GraveyardMapView
            onSelectGraveyard={handleSelectGraveyard}
            selectedGraveyardId={selectedGraveyardId}
          />
        </div>
      </div>

      {selectedGraveyard && (
        <Dialog open={showDetailsPanel} onOpenChange={setShowDetailsPanel}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0">
            <GraveyardPropertiesPanel
              graveyard={selectedGraveyard}
              onUpdate={handleUpdateGraveyard}
              onClose={() => setShowDetailsPanel(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
