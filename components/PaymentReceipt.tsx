"use client";

import { useRef } from 'react';
import { Payment } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { X, Download, Printer } from 'lucide-react';

interface PaymentReceiptProps {
  payment: Payment;
  onClose: () => void;
}

export default function PaymentReceipt({ payment, onClose }: PaymentReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getServiceTypeName = (type: string) => {
    const types: Record<string, string> = {
      grave_booking: 'Grave Booking',
      burial_service: 'Burial Service',
      maintenance: 'Maintenance',
      other: 'Other',
    };
    return types[type] || type;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'overdue':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow && receiptRef.current) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Payment Receipt - ${payment.id}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 40px;
                max-width: 800px;
                margin: 0 auto;
              }
              .receipt-container {
                border: 2px solid #e2e8f0;
                border-radius: 8px;
                padding: 30px;
              }
              .header {
                text-align: center;
                border-bottom: 2px solid #e2e8f0;
                padding-bottom: 20px;
                margin-bottom: 20px;
              }
              .title {
                font-size: 28px;
                font-weight: bold;
                color: #0f172a;
                margin-bottom: 5px;
              }
              .subtitle {
                color: #64748b;
                font-size: 14px;
              }
              .receipt-info {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin-bottom: 30px;
              }
              .info-item {
                margin-bottom: 10px;
              }
              .label {
                font-size: 12px;
                color: #64748b;
                margin-bottom: 3px;
              }
              .value {
                font-size: 14px;
                font-weight: 600;
                color: #0f172a;
              }
              .amount-section {
                background: #f8fafc;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                text-align: center;
              }
              .amount-label {
                font-size: 14px;
                color: #64748b;
                margin-bottom: 8px;
              }
              .amount-value {
                font-size: 36px;
                font-weight: bold;
                color: #10b981;
              }
              .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 2px solid #e2e8f0;
                text-align: center;
                color: #64748b;
                font-size: 12px;
              }
              .status-badge {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
              }
              .status-paid {
                background: #dcfce7;
                color: #15803d;
              }
              .status-pending {
                background: #fef3c7;
                color: #92400e;
              }
              .status-overdue {
                background: #fee2e2;
                color: #991b1b;
              }
            </style>
          </head>
          <body>
            ${receiptRef.current.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  const handleDownload = () => {
    if (receiptRef.current) {
      const content = receiptRef.current.innerHTML;
      const blob = new Blob([`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Receipt - ${payment.id}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
              .receipt-container { border: 2px solid #e2e8f0; border-radius: 8px; padding: 30px; }
              .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 20px; }
              .title { font-size: 28px; font-weight: bold; color: #0f172a; margin-bottom: 5px; }
              .subtitle { color: #64748b; font-size: 14px; }
              .receipt-info { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; }
              .info-item { margin-bottom: 10px; }
              .label { font-size: 12px; color: #64748b; margin-bottom: 3px; }
              .value { font-size: 14px; font-weight: 600; color: #0f172a; }
              .amount-section { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
              .amount-label { font-size: 14px; color: #64748b; margin-bottom: 8px; }
              .amount-value { font-size: 36px; font-weight: bold; color: #10b981; }
              .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center; color: #64748b; font-size: 12px; }
              .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
              .status-paid { background: #dcfce7; color: #15803d; }
              .status-pending { background: #fef3c7; color: #92400e; }
              .status-overdue { background: #fee2e2; color: #991b1b; }
            </style>
          </head>
          <body>${content}</body>
        </html>
      `], { type: 'text/html' });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${payment.id}-${Date.now()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <h2 className="text-2xl font-bold text-slate-900">Payment Receipt</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <X className="h-5 w-5 text-slate-600" />
          </button>
        </div>

        <div className="p-6">
          <div ref={receiptRef} className="receipt-container">
            <div className="header">
              <div className="title">Graveyard Management System</div>
              <div className="subtitle">Official Payment Receipt</div>
            </div>

            <div className="receipt-info">
              <div className="info-item">
                <div className="label">Receipt Number</div>
                <div className="value">#{payment.id}</div>
              </div>

              <div className="info-item">
                <div className="label">Date Issued</div>
                <div className="value">{formatDate(payment.date)}</div>
              </div>

              <div className="info-item">
                <div className="label">Customer Name</div>
                <div className="value">{payment.customerName}</div>
              </div>

              <div className="info-item">
                <div className="label">Service Type</div>
                <div className="value">{getServiceTypeName(payment.serviceType)}</div>
              </div>

              {payment.plotInfo && (
                <div className="info-item">
                  <div className="label">Plot Information</div>
                  <div className="value">{payment.plotInfo}</div>
                </div>
              )}

              {payment.graveInfo && (
                <div className="info-item">
                  <div className="label">Grave Information</div>
                  <div className="value">{payment.graveInfo}</div>
                </div>
              )}

              {payment.dueDate && (
                <div className="info-item">
                  <div className="label">Due Date</div>
                  <div className="value">{formatDate(payment.dueDate)}</div>
                </div>
              )}

              <div className="info-item">
                <div className="label">Payment Status</div>
                <div className="value">
                  <span className={`status-badge status-${payment.status}`}>
                    {payment.status}
                  </span>
                </div>
              </div>
            </div>

            {payment.description && (
              <div style={{ marginBottom: '20px', padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
                <div className="label">Description</div>
                <div className="value" style={{ marginTop: '5px' }}>{payment.description}</div>
              </div>
            )}

            <div className="amount-section">
              <div className="amount-label">Total Amount</div>
              <div className="amount-value">{formatCurrency(payment.amount)}</div>
            </div>

            <div className="footer">
              <p>This is an official receipt from Graveyard Management System</p>
              <p>Generated on {new Date().toLocaleString()}</p>
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <Button
              onClick={handleDownload}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button
              onClick={handlePrint}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
