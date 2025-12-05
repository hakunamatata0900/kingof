"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Save, MapPin, Undo2, Download } from 'lucide-react';

if (typeof window !== 'undefined') {
  require('leaflet/dist/leaflet.css');
}

interface MapEditorProps {
  onSavePolygon: (coordinates: [number, number][], center: [number, number]) => void;
  initialPolygon?: {
    coordinates: [number, number][];
    center?: [number, number];
  };
  onClose?: () => void;
}

export default function MapEditor({ onSavePolygon, initialPolygon, onClose }: MapEditorProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(true);
  const [coordinates, setCoordinates] = useState<[number, number][]>(initialPolygon?.coordinates || []);
  const [polygon, setPolygon] = useState<any | null>(null);
  const drawnPoints = useRef<any[]>([]);
  const polyline = useRef<any | null>(null);
  const [L, setL] = useState<any>(null);

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

    const defaultCenter: [number, number] = initialPolygon?.center || [33.6844, 73.0479];
    const defaultZoom = 15;

    map.current = L.map(mapContainer.current).setView(defaultCenter, defaultZoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current);

    if (initialPolygon?.coordinates) {
      const polygon = L.polygon(initialPolygon.coordinates, {
        color: '#3b82f6',
        fillColor: '#60a5fa',
        fillOpacity: 0.4,
        weight: 2,
      }).addTo(map.current);
      setPolygon(polygon);
      map.current.fitBounds(polygon.getBounds());
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [L, initialPolygon]);

  useEffect(() => {
    if (!map.current || !isDrawingMode) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
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
  }, [isDrawingMode, coordinates]);

  const handleFinishDrawing = () => {
    if (coordinates.length < 3) {
      alert('Please draw at least 3 points to create a polygon');
      return;
    }

    if (polygon) {
      map.current?.removeLayer(polygon);
    }

    const closedCoords = [...coordinates, coordinates[0]];
    const newPolygon = L.polygon(coordinates, {
      color: '#3b82f6',
      fillColor: '#60a5fa',
      fillOpacity: 0.4,
      weight: 2,
    }).addTo(map.current!);

    setPolygon(newPolygon);
    setIsDrawingMode(false);

    drawnPoints.current.forEach((marker) => {
      map.current?.removeLayer(marker);
    });
    drawnPoints.current = [];

    if (polyline.current) {
      map.current?.removeLayer(polyline.current);
      polyline.current = null;
    }
  };

  const handleClearPolygon = () => {
    if (polygon) {
      map.current?.removeLayer(polygon);
      setPolygon(null);
    }
    drawnPoints.current.forEach((marker) => {
      map.current?.removeLayer(marker);
    });
    drawnPoints.current = [];
    if (polyline.current) {
      map.current?.removeLayer(polyline.current);
      polyline.current = null;
    }
    setCoordinates([]);
    setIsDrawingMode(true);
  };

  const handleUndo = () => {
    if (coordinates.length === 0) return;

    const newCoordinates = coordinates.slice(0, -1);
    setCoordinates(newCoordinates);

    if (drawnPoints.current.length > 0) {
      const lastMarker = drawnPoints.current.pop();
      if (lastMarker && map.current) {
        map.current.removeLayer(lastMarker);
      }
    }

    if (polyline.current) {
      map.current?.removeLayer(polyline.current);
      polyline.current = null;
    }

    if (newCoordinates.length > 1) {
      polyline.current = L.polyline(newCoordinates, {
        color: '#3b82f6',
        weight: 2,
        opacity: 0.8,
      }).addTo(map.current!);
    }
  };

  const handleSave = () => {
    if (coordinates.length < 3) {
      alert('Polygon must have at least 3 points');
      return;
    }

    const bounds = L.polygon(coordinates).getBounds();
    const center: [number, number] = [bounds.getCenter().lat, bounds.getCenter().lng];
    onSavePolygon(coordinates, center);
  };

  const calculateArea = () => {
    if (coordinates.length < 3) return 0;

    let area = 0;
    for (let i = 0; i < coordinates.length; i++) {
      const j = (i + 1) % coordinates.length;
      area += coordinates[i][1] * coordinates[j][0];
      area -= coordinates[j][1] * coordinates[i][0];
    }
    return Math.abs(area / 2) * 111000 * 111000;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col">
        <div
          ref={mapContainer}
          style={{ height: '100%', width: '100%', minHeight: '500px' }}
          className="rounded-lg overflow-hidden border border-slate-200"
        />
      </div>

      <div className="mt-6 p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium text-slate-700 mb-1">Points</p>
            <p className="text-2xl font-bold text-blue-600">{coordinates.length}</p>
          </div>
          {coordinates.length >= 3 && (
            <div>
              <p className="text-sm font-medium text-slate-700 mb-1">Area (m²)</p>
              <p className="text-2xl font-bold text-green-600">{calculateArea().toFixed(0)}</p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {isDrawingMode ? (
            <>
              <Button
                onClick={handleUndo}
                variant="outline"
                size="sm"
                disabled={coordinates.length === 0}
                className="gap-2"
              >
                <Undo2 className="h-4 w-4" />
                Undo
              </Button>
              <Button
                onClick={handleFinishDrawing}
                disabled={coordinates.length < 3}
                size="sm"
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <MapPin className="h-4 w-4" />
                Finish Drawing
              </Button>
              <Button
                onClick={handleClearPolygon}
                variant="outline"
                size="sm"
                disabled={coordinates.length === 0}
                className="gap-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => setIsDrawingMode(true)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Undo2 className="h-4 w-4" />
                Redraw
              </Button>
              <Button
                onClick={handleSave}
                size="sm"
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4" />
                Save Boundary
              </Button>
              <Button
                onClick={handleClearPolygon}
                variant="outline"
                size="sm"
                className="gap-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </Button>
            </>
          )}
        </div>

        {coordinates.length > 0 && (
          <div className="mt-4 p-3 bg-slate-50 rounded border border-slate-200">
            <p className="text-xs font-medium text-slate-700 mb-2">Coordinates</p>
            <div className="max-h-24 overflow-y-auto">
              <div className="text-xs text-slate-600 space-y-1">
                {coordinates.map((coord, idx) => (
                  <div key={idx}>
                    {idx + 1}. {coord[0].toFixed(4)}, {coord[1].toFixed(4)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
