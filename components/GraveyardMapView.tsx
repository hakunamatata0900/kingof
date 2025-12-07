"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Edit2, X, Save } from 'lucide-react';
import { useGraveyard, Graveyard } from '@/contexts/GraveyardContext';

if (typeof window !== 'undefined') {
  require('leaflet/dist/leaflet.css');
}

interface GraveyardMapViewProps {
  onSelectGraveyard: (graveyard: Graveyard) => void;
  selectedGraveyardId?: string;
}

export default function GraveyardMapView({ onSelectGraveyard, selectedGraveyardId }: GraveyardMapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any | null>(null);
  const [L, setL] = useState<any>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [coordinates, setCoordinates] = useState<[number, number][]>([]);
  const [newGraveyardName, setNewGraveyardName] = useState('');
  const [newGraveyardLocation, setNewGraveyardLocation] = useState('');
  const drawnPoints = useRef<any[]>([]);
  const polyline = useRef<any | null>(null);
  const graveyardLayers = useRef<{ [key: string]: any }>({});
  const { graveyards, addGraveyard, updateGraveyard, deleteGraveyard } = useGraveyard();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initLeaflet = async () => {
      try {
        const leaflet = await import('leaflet');
        setL(leaflet.default);
      } catch (e) {
        console.error('Failed to load Leaflet:', e);
      }
    };

    initLeaflet();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !L) return;

    const defaultCenter: [number, number] = [33.6844, 73.0479];
    const defaultZoom = 12;

    map.current = L.map(mapContainer.current).setView(defaultCenter, defaultZoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current);

    renderGraveyards();

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [L]);

  useEffect(() => {
    if (!map.current || !L) return;
    renderGraveyards();
  }, [graveyards, selectedGraveyardId, L]);

  const renderGraveyards = () => {
    if (!map.current || !L) return;

    Object.keys(graveyardLayers.current).forEach((key) => {
      map.current.removeLayer(graveyardLayers.current[key]);
    });
    graveyardLayers.current = {};

    graveyards.forEach((graveyard) => {
      if (graveyard.polygon?.coordinates) {
        const isSelected = graveyard.id === selectedGraveyardId;
        const color = isSelected ? '#ff6b6b' : '#3b82f6';
        const fillColor = isSelected ? '#ff8787' : '#60a5fa';

        const polygon = L.polygon(graveyard.polygon.coordinates, {
          color,
          fillColor,
          fillOpacity: 0.4,
          weight: isSelected ? 3 : 2,
        }).addTo(map.current);

        polygon.on('click', () => {
          onSelectGraveyard(graveyard);
        });

        polygon.bindPopup(
          `<div class="p-2"><strong>${graveyard.name}</strong><br/>${graveyard.location}</div>`
        );

        graveyardLayers.current[graveyard.id] = polygon;
      }
    });
  };

  useEffect(() => {
    if (!map.current || !isDrawingMode || !L) return;

    const handleMapClick = (e: any) => {
      const newCoord: [number, number] = [e.latlng.lat, e.latlng.lng];
      setCoordinates((prev) => [...prev, newCoord]);

      const marker = L.circleMarker(e.latlng, {
        radius: 5,
        fillColor: '#3b82f6',
        color: '#1e40af',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      }).addTo(map.current!);
      drawnPoints.current.push(marker);

      if (coordinates.length + 1 > 1) {
        if (polyline.current) {
          map.current!.removeLayer(polyline.current);
        }
        polyline.current = L.polyline([...coordinates, newCoord], {
          color: '#3b82f6',
          weight: 2,
          opacity: 0.8,
        }).addTo(map.current!);
      }
    };

    map.current.on('click', handleMapClick);

    return () => {
      if (map.current) {
        map.current.off('click', handleMapClick);
      }
    };
  }, [isDrawingMode, coordinates, L]);

  const handleStartDrawing = () => {
    setIsDrawingMode(true);
    setCoordinates([]);
    setNewGraveyardName('');
    setNewGraveyardLocation('');
  };

  const handleSaveGraveyard = () => {
    if (coordinates.length < 3) {
      alert('Please draw at least 3 points to create a graveyard boundary');
      return;
    }

    if (!newGraveyardName.trim()) {
      alert('Please enter a graveyard name');
      return;
    }

    const bounds = L.polygon(coordinates).getBounds();
    const center: [number, number] = [bounds.getCenter().lat, bounds.getCenter().lng];

    addGraveyard({
      name: newGraveyardName,
      location: newGraveyardLocation || 'No location specified',
      polygon: { coordinates, center },
      latitude: center[0],
      longitude: center[1],
    });

    clearDrawing();
  };

  const clearDrawing = () => {
    drawnPoints.current.forEach((marker) => {
      if (map.current) {
        map.current.removeLayer(marker);
      }
    });
    drawnPoints.current = [];

    if (polyline.current && map.current) {
      map.current.removeLayer(polyline.current);
      polyline.current = null;
    }

    setCoordinates([]);
    setIsDrawingMode(false);
    setNewGraveyardName('');
    setNewGraveyardLocation('');
  };

  return (
    <div className="flex h-full gap-4">
      <div className="flex-1 flex flex-col">
        <div
          ref={mapContainer}
          className="flex-1 rounded-lg overflow-hidden border-2 border-slate-200 shadow-lg"
          style={{ minHeight: '600px' }}
        />

        {isDrawingMode && (
          <div className="mt-4 p-4 bg-white rounded-lg border border-slate-200 shadow-md">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700">Graveyard Name *</label>
                <Input
                  value={newGraveyardName}
                  onChange={(e) => setNewGraveyardName(e.target.value)}
                  placeholder="Enter graveyard name"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Location</label>
                <Input
                  value={newGraveyardLocation}
                  onChange={(e) => setNewGraveyardLocation(e.target.value)}
                  placeholder="Enter location (optional)"
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2 items-center text-sm text-slate-600 bg-blue-50 p-3 rounded">
                <div className="font-semibold">Points: {coordinates.length}</div>
                {coordinates.length >= 3 && (
                  <div className="ml-auto text-green-600 font-medium">Ready to save</div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSaveGraveyard}
                  disabled={coordinates.length < 3 || !newGraveyardName.trim()}
                  className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Save className="h-4 w-4" />
                  Save Graveyard
                </Button>
                <Button
                  onClick={clearDrawing}
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="w-64 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-3">Graveyards</h2>
          {!isDrawingMode && (
            <Button
              onClick={handleStartDrawing}
              className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Add Graveyard
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {graveyards.length === 0 ? (
            <div className="p-4 text-center text-slate-500 text-sm">
              <p>No graveyards yet</p>
              <p className="text-xs mt-1">Click "Add Graveyard" to create one</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {graveyards.map((graveyard) => (
                <div
                  key={graveyard.id}
                  onClick={() => onSelectGraveyard(graveyard)}
                  className={`p-3 cursor-pointer transition-colors ${
                    selectedGraveyardId === graveyard.id
                      ? 'bg-blue-100 border-l-4 border-blue-600'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 text-sm truncate">
                        {graveyard.name}
                      </h3>
                      <p className="text-xs text-slate-500 truncate">{graveyard.location}</p>
                      <p className="text-xs text-slate-600 mt-1">
                        {graveyard.totalPlots} plots
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedGraveyardId && (
          <div className="p-3 border-t border-slate-200 space-y-2">
            <Button
              onClick={() => {
                const selected = graveyards.find((g) => g.id === selectedGraveyardId);
                if (selected) {
                  setNewGraveyardName(selected.name);
                  setNewGraveyardLocation(selected.location);
                  setCoordinates(selected.polygon?.coordinates || []);
                  setIsDrawingMode(true);
                }
              }}
              variant="outline"
              size="sm"
              className="w-full gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Edit Boundary
            </Button>
            <Button
              onClick={() => {
                if (selectedGraveyardId && confirm('Delete this graveyard?')) {
                  deleteGraveyard(selectedGraveyardId);
                }
              }}
              variant="outline"
              size="sm"
              className="w-full gap-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
