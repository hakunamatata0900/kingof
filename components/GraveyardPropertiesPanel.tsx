"use client";

import React, { useState } from 'react';
import { Graveyard } from '@/contexts/GraveyardContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, MapPin, Edit2, Save } from 'lucide-react';

interface GraveyardPropertiesPanelProps {
  graveyard: Graveyard;
  onUpdate: (updates: Partial<Graveyard>) => void;
  onClose: () => void;
}

export default function GraveyardPropertiesPanel({
  graveyard,
  onUpdate,
  onClose,
}: GraveyardPropertiesPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: graveyard.name,
    location: graveyard.location,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    const updates: Partial<Graveyard> = {
      name: formData.name,
      location: formData.location,
    };

    onUpdate(updates);
    setIsEditing(false);
  };

  const calculateArea = () => {
    if (!graveyard.polygon || graveyard.polygon.coordinates.length < 3) return null;

    let area = 0;
    const coords = graveyard.polygon.coordinates;
    for (let i = 0; i < coords.length; i++) {
      const j = (i + 1) % coords.length;
      area += coords[i][1] * coords[j][0];
      area -= coords[j][1] * coords[i][0];
    }
    return Math.abs(area / 2) * 111000 * 111000;
  };

  const area = calculateArea();

  return (
    <Card className="w-full h-full overflow-y-auto bg-white rounded-lg shadow-lg">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900">
            {isEditing ? 'Edit Graveyard' : 'Graveyard Details'}
          </h2>
        </div>
        <div className="flex gap-2">
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="gap-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Graveyard Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="mt-1"
                placeholder="Enter graveyard name"
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Textarea
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="mt-1"
                placeholder="Enter location details"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Name</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{graveyard.name}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Location</p>
              <p className="mt-1 text-slate-700 whitespace-pre-wrap">{graveyard.location}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Plots</p>
                <p className="mt-1 text-2xl font-bold text-blue-600">{graveyard.totalPlots}</p>
              </div>
              {area && (
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                    Area
                  </p>
                  <p className="mt-1 text-2xl font-bold text-green-600">
                    {(area / 10000).toFixed(2)} ha
                  </p>
                </div>
              )}
            </div>

            {graveyard.polygon && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-900 mb-2">Boundary Information</p>
                <p className="text-xs text-blue-800">
                  Polygon defined with {graveyard.polygon.coordinates.length} points
                </p>
                {graveyard.polygon.center && (
                  <p className="text-xs text-blue-800 mt-1">
                    Center: {graveyard.polygon.center[0].toFixed(4)},
                    {graveyard.polygon.center[1].toFixed(4)}
                  </p>
                )}
              </div>
            )}

            <div className="pt-4 text-xs text-slate-500">
              <p>Created: {new Date(graveyard.createdAt).toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
