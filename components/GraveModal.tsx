"use client";

import { useState } from 'react';
import { X, User, Phone, MapPin, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Grave } from '@/contexts/GraveyardContext';
import { useBurialRecord } from '@/contexts/BurialRecordContext';

interface GraveModalProps {
  grave: Grave;
  plotNumber: string;
  onUpdate: (status: 'available' | 'unavailable', reservedBy?: string) => void;
  onClose: () => void;
}

export default function GraveModal({ grave, plotNumber, onUpdate, onClose }: GraveModalProps) {
  const [reservedBy, setReservedBy] = useState(grave.reservedBy || '');
  const { getRecordByGraveId } = useBurialRecord();

  const burialRecord = getRecordByGraveId(grave.id);

  const handleReserve = () => {
    if (reservedBy.trim()) {
      onUpdate('unavailable', reservedBy);
      onClose();
    }
  };

  const handleRelease = () => {
    onUpdate('available');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <h2 className="text-2xl font-bold text-slate-900">
            Grave #{grave.graveNumber}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="rounded-lg bg-slate-50 p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Plot</span>
              <span className="font-medium text-slate-900">{plotNumber}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Grave Number</span>
              <span className="font-medium text-slate-900">#{grave.graveNumber}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Status</span>
              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
                grave.status === 'available'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                <div className={`h-2 w-2 rounded-full ${
                  grave.status === 'available' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                {grave.status === 'available' ? 'Available' : 'Reserved'}
              </span>
            </div>
          </div>

          {grave.status === 'unavailable' && burialRecord ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Burial Record Information
                </h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-blue-700">Name</p>
                      <p className="font-semibold text-blue-900">{burialRecord.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-blue-700">Father's Name</p>
                      <p className="font-semibold text-blue-900">{burialRecord.fatherName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-blue-700">Date of Death</p>
                      <p className="font-semibold text-blue-900">
                        {new Date(burialRecord.dateOfDeath).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-blue-700">Age</p>
                      <p className="font-semibold text-blue-900">{burialRecord.age}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-700">Gender</p>
                      <p className="font-semibold text-blue-900 capitalize">{burialRecord.gender}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-blue-700">Religion</p>
                    <p className="font-semibold text-blue-900">{burialRecord.religion}</p>
                  </div>

                  {burialRecord.phoneNumber && (
                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-blue-700">Phone Number</p>
                        <p className="font-semibold text-blue-900">{burialRecord.phoneNumber}</p>
                      </div>
                    </div>
                  )}

                  {burialRecord.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-blue-700">Address</p>
                        <p className="font-semibold text-blue-900">{burialRecord.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <Button
                onClick={handleRelease}
                variant="outline"
                className="w-full border-green-500 text-green-700 hover:bg-green-50"
              >
                Release Grave
              </Button>
            </div>
          ) : grave.status === 'available' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reservedBy">Reserve For</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="reservedBy"
                    value={reservedBy}
                    onChange={(e) => setReservedBy(e.target.value)}
                    placeholder="Enter name"
                    className="pl-10"
                  />
                </div>
              </div>
              <Button
                onClick={handleReserve}
                disabled={!reservedBy.trim()}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              >
                Reserve Grave
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {grave.reservedBy && (
                <div className="rounded-lg bg-red-50 p-4">
                  <p className="text-sm text-slate-600 mb-1">Reserved for</p>
                  <p className="font-semibold text-slate-900">{grave.reservedBy}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    No approved burial record found for this grave
                  </p>
                </div>
              )}
              <Button
                onClick={handleRelease}
                variant="outline"
                className="w-full border-green-500 text-green-700 hover:bg-green-50"
              >
                Release Grave
              </Button>
            </div>
          )}

          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
