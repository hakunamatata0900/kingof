"use client";

import { useState } from 'react';
import { useFinance, ServiceType, PaymentStatus } from '@/contexts/FinanceContext';
import { useGraveyard } from '@/contexts/GraveyardContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';

interface PaymentFormProps {
  onClose: () => void;
  onSuccess: (paymentId: string) => void;
}

export default function PaymentForm({ onClose, onSuccess }: PaymentFormProps) {
  const { addPayment } = useFinance();
  const { plots, graves } = useGraveyard();

  const [customerName, setCustomerName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [plotId, setPlotId] = useState('');
  const [graveId, setGraveId] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('grave_booking');
  const [status, setStatus] = useState<PaymentStatus>('pending');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const availableGraves = plotId
    ? graves.filter((g) => g.plotId === plotId)
    : [];

  const getPlotName = (id: string) => {
    const plot = plots.find((p) => p.id === id);
    return plot ? `Plot ${plot.plotNumber}` : '';
  };

  const getGraveName = (id: string) => {
    const grave = graves.find((g) => g.id === id);
    return grave ? `Grave ${grave.graveNumber}` : '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!customerName || !amount || !date || !serviceType) {
      setError('Please fill in all required fields');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const payment = addPayment({
        customerName,
        amount: amountNum,
        date,
        dueDate: dueDate || undefined,
        plotInfo: plotId ? getPlotName(plotId) : undefined,
        graveInfo: graveId ? getGraveName(graveId) : undefined,
        serviceType,
        status,
        description: description || undefined,
      });

      onSuccess(payment.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create payment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <h2 className="text-2xl font-bold text-slate-900">New Payment Entry</h2>
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
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Amount <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Payment Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Due Date
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Service Type <span className="text-red-500">*</span>
              </label>
              <Select value={serviceType} onValueChange={(value) => setServiceType(value as ServiceType)}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grave_booking">Grave Booking</SelectItem>
                  <SelectItem value="burial_service">Burial Service</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Payment Status <span className="text-red-500">*</span>
              </label>
              <Select value={status} onValueChange={(value) => setStatus(value as PaymentStatus)}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Plot
              </label>
              <Select value={plotId} onValueChange={(value) => {
                setPlotId(value);
                setGraveId('');
              }}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Select plot (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {plots.map((plot) => (
                    <SelectItem key={plot.id} value={plot.id}>
                      Plot {plot.plotNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Grave
              </label>
              <Select value={graveId} onValueChange={setGraveId} disabled={!plotId || plotId === 'none'}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder={plotId && plotId !== 'none' ? "Select grave (optional)" : "Select plot first"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {availableGraves.map((grave) => (
                    <SelectItem key={grave.id} value={grave.id}>
                      Grave {grave.graveNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter payment description or notes"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              rows={3}
            />
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
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-2 rounded-lg hover:from-emerald-600 hover:to-emerald-700"
            >
              {isLoading ? 'Creating...' : 'Create Payment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
