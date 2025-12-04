"use client";

import { useState } from 'react';
import { useBurialRecord, BurialRecord } from '@/contexts/BurialRecordContext';
import { useGraveyard } from '@/contexts/GraveyardContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';

interface EditBurialRecordFormProps {
  record: BurialRecord;
  onClose: () => void;
}

export default function EditBurialRecordForm({ record, onClose }: EditBurialRecordFormProps) {
  const [name, setName] = useState(record.name);
  const [fatherName, setFatherName] = useState(record.fatherName);
  const [dateOfDeath, setDateOfDeath] = useState(record.dateOfDeath);
  const [gender, setGender] = useState<'male' | 'female'>(record.gender);
  const [age, setAge] = useState(record.age.toString());
  const [religion, setReligion] = useState(record.religion);
  const [phoneNumber, setPhoneNumber] = useState(record.phoneNumber || '');
  const [address, setAddress] = useState(record.address || '');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { updateRecord, checkDuplicateRecord } = useBurialRecord();
  const { plots } = useGraveyard();

  const selectedPlot = plots.find((p) => p.id === record.plotId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !fatherName || !dateOfDeath || !age || !religion) {
      setError('All required fields must be filled');
      return;
    }

    if (parseInt(age) < 0 || parseInt(age) > 150) {
      setError('Age must be between 0 and 150');
      return;
    }

    if (checkDuplicateRecord(name, fatherName, dateOfDeath, record.id)) {
      setError('A burial record with the same name, father\'s name, and date of death already exists');
      return;
    }

    setIsLoading(true);

    try {
      updateRecord(record.id, {
        name,
        fatherName,
        dateOfDeath,
        gender,
        age: parseInt(age),
        religion,
        phoneNumber,
        address,
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update record');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <h2 className="text-2xl font-bold text-slate-900">Edit Burial Record</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <X className="h-5 w-5 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Name <span className="text-red-500">*</span></label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Father's Name <span className="text-red-500">*</span></label>
              <Input
                type="text"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                placeholder="Father's name"
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Date of Death <span className="text-red-500">*</span></label>
              <Input
                type="date"
                value={dateOfDeath}
                onChange={(e) => setDateOfDeath(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Gender <span className="text-red-500">*</span></label>
              <Select value={gender} onValueChange={(value) => setGender(value as 'male' | 'female')}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Age <span className="text-red-500">*</span></label>
              <Input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Age at death"
                required
                min="0"
                max="150"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Religion <span className="text-red-500">*</span></label>
              <Select value={religion} onValueChange={setReligion}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Select religion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Christianity">Christianity</SelectItem>
                  <SelectItem value="Islam">Islam</SelectItem>
                  <SelectItem value="Judaism">Judaism</SelectItem>
                  <SelectItem value="Hinduism">Hinduism</SelectItem>
                  <SelectItem value="Buddhism">Buddhism</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
              <Input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Contact number"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
              <Input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Full address"
                className="w-full"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Assigned Plot/Grave</label>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <p className="text-sm text-slate-900">
                  Plot {selectedPlot?.plotNumber || 'N/A'} - Grave #{record.graveId.split('-').pop()}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Plot and grave assignment cannot be changed after creation
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 border border-red-200">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="px-6 py-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white px-6 py-2 rounded-lg hover:from-cyan-600 hover:to-cyan-700"
            >
              {isLoading ? 'Updating...' : 'Update Record'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
