"use client";

import { useState, useEffect } from 'react';
import { useFinance, ServiceType, PaymentStatus, Payment } from '@/contexts/FinanceContext';
import { useGraveyard } from '@/contexts/GraveyardContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';

interface EditPaymentFormProps {
  payment: Payment;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditPaymentForm({ payment, onClose, onSuccess }: EditPaymentFormProps) {
  const { updatePayment } = useFinance();
  const { plots, graves } = useGraveyard();

  const [customerName, setCustomerName] = useState(payment.customerName);
  const [amount, setAmount] = useState(payment.amount.toString());
  const [date, setDate] = useState(payment.date);
  const [dueDate, setDueDate] = useState(payment.dueDate || '');
  const [plotInfo, setPlotInfo] = useState(payment.plotInfo || '');
  const [graveInfo, setGraveInfo] = useState(payment.graveInfo || '');
  const [serviceType, setServiceType] = useState<ServiceType>(payment.serviceType);
  const [status, setStatus] = useState<PaymentStatus>(payment.status);
  const [description, setDescription] = useState(payment.description || '');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

      updatePayment(payment.id, {
        customerName,
        amount: amountNum,
        date,
        dueDate: dueDate || undefined,
        plotInfo: plotInfo || undefined,
        graveInfo: graveInfo || undefined,
        serviceType,
        status,
        description: description || undefined,
      });

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update payment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <h2 className="text-2xl font-bold text-slate-900">Edit Payment</h2>
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
                Plot Information
              </label>
              <Input
                type="text"
                value={plotInfo}
                onChange={(e) => setPlotInfo(e.target.value)}
                placeholder="e.g., Plot A1"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Grave Information
              </label>
              <Input
                type="text"
                value={graveInfo}
                onChange={(e) => setGraveInfo(e.target.value)}
                placeholder="e.g., Grave 12"
                className="w-full"
              />
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
              {isLoading ? 'Updating...' : 'Update Payment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
