"use client";

import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFinance } from '@/contexts/FinanceContext';
import { Plus, Search, Filter, Edit, Trash2, Receipt, Lock, DollarSign, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PaymentForm from '@/components/PaymentForm';
import PaymentReceipt from '@/components/PaymentReceipt';
import EditPaymentForm from '@/components/EditPaymentForm';

export default function FinancePage() {
  const { isAuthenticated, user } = useAuth();
  const {
    payments,
    deletePayment,
    getPaymentById,
    getTotalRevenue,
    getPaidAmount,
    getPendingAmount,
    getOverdueAmount,
    getOverduePayments,
    getPendingPayments,
  } = useFinance();

  const [showForm, setShowForm] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [filterServiceType, setFilterServiceType] = useState<'all' | 'grave_booking' | 'burial_service' | 'maintenance' | 'other'>('all');

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl text-center">
          <div className="rounded-full bg-red-100 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Lock className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600">You need to be logged in.</p>
        </div>
      </div>
    );
  }

  const canModify = ['admin', 'staff'].includes(user?.role || '');

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesSearch =
        payment.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
      const matchesServiceType = filterServiceType === 'all' || payment.serviceType === filterServiceType;

      return matchesSearch && matchesStatus && matchesServiceType;
    });
  }, [payments, searchQuery, filterStatus, filterServiceType]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
    }).format(amount);
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

  const getServiceTypeName = (type: string) => {
    const types: Record<string, string> = {
      grave_booking: 'Grave Booking',
      burial_service: 'Burial Service',
      maintenance: 'Maintenance',
      other: 'Other',
    };
    return types[type] || type;
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this payment record?')) {
      deletePayment(id);
    }
  };

  const handleViewReceipt = (id: string) => {
    setSelectedPaymentId(id);
    setShowReceipt(true);
  };

  const handleEdit = (id: string) => {
    setSelectedPaymentId(id);
    setShowEditForm(true);
  };

  const selectedPayment = selectedPaymentId ? getPaymentById(selectedPaymentId) : null;

  const overduePayments = getOverduePayments();
  const pendingPayments = getPendingPayments();

  const stats = [
    {
      title: 'Total Revenue',
      value: formatCurrency(getTotalRevenue()),
      icon: TrendingUp,
      gradient: 'from-emerald-500 to-emerald-600',
      bgGradient: 'from-emerald-50 to-emerald-100',
    },
    {
      title: 'Paid Amount',
      value: formatCurrency(getPaidAmount()),
      icon: DollarSign,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
    },
    {
      title: 'Pending Amount',
      value: formatCurrency(getPendingAmount()),
      icon: Clock,
      gradient: 'from-amber-500 to-amber-600',
      bgGradient: 'from-amber-50 to-amber-100',
    },
    {
      title: 'Overdue Amount',
      value: formatCurrency(getOverdueAmount()),
      icon: AlertTriangle,
      gradient: 'from-red-500 to-red-600',
      bgGradient: 'from-red-50 to-red-100',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Financial Transactions</h1>
            <p className="text-slate-600">Manage payments and billing for cemetery services</p>
          </div>
          {canModify && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-emerald-600 hover:to-emerald-700 flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              New Payment
            </Button>
          )}
        </div>

        {(overduePayments.length > 0 || pendingPayments.length > 0) && (
          <div className="mb-6 space-y-3">
            {overduePayments.length > 0 && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-900 mb-1">Overdue Payments Alert</h3>
                    <p className="text-sm text-red-700">
                      You have {overduePayments.length} overdue payment{overduePayments.length !== 1 ? 's' : ''} totaling {formatCurrency(getOverdueAmount())}. Please follow up immediately.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {pendingPayments.length > 0 && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-900 mb-1">Pending Payments Notice</h3>
                    <p className="text-sm text-amber-700">
                      {pendingPayments.length} payment{pendingPayments.length !== 1 ? 's are' : ' is'} pending totaling {formatCurrency(getPendingAmount())}.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`rounded-xl bg-gradient-to-br ${stat.gradient} p-3 shadow-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-slate-600 mb-1">{stat.title}</h3>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search payments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white shadow-sm"
            />
          </div>

          <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)}>
            <SelectTrigger className="bg-white shadow-sm">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterServiceType} onValueChange={(value) => setFilterServiceType(value as any)}>
            <SelectTrigger className="bg-white shadow-sm">
              <SelectValue placeholder="Filter by service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              <SelectItem value="grave_booking">Grave Booking</SelectItem>
              <SelectItem value="burial_service">Burial Service</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
            <div>
              <p className="text-sm text-slate-600">Total Records</p>
              <p className="text-2xl font-bold text-slate-900">{filteredPayments.length}</p>
            </div>
            <Filter className="h-5 w-5 text-slate-400" />
          </div>
        </div>

        <div className="rounded-2xl bg-white shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Receipt #</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Service Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <p className="font-mono text-sm text-slate-600">#{payment.id}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">{payment.customerName}</p>
                        {payment.plotInfo && (
                          <p className="text-xs text-slate-500">{payment.plotInfo}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm">
                        {getServiceTypeName(payment.serviceType)}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">{formatCurrency(payment.amount)}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm">
                        {new Date(payment.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(payment.status)}`}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewReceipt(payment.id)}
                            className="p-2 rounded-lg hover:bg-emerald-100 text-emerald-600 hover:text-emerald-700"
                            title="View receipt"
                          >
                            <Receipt className="h-4 w-4" />
                          </button>

                          {canModify && (
                            <>
                              <button
                                onClick={() => handleEdit(payment.id)}
                                className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 hover:text-blue-700"
                                title="Edit payment"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(payment.id)}
                                className="p-2 rounded-lg hover:bg-red-100 text-red-600 hover:text-red-700"
                                title="Delete payment"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <p className="text-slate-600">No payment records found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showForm && (
        <PaymentForm
          onClose={() => setShowForm(false)}
          onSuccess={(paymentId) => {
            setShowForm(false);
            setSelectedPaymentId(paymentId);
            setShowReceipt(true);
          }}
        />
      )}

      {showReceipt && selectedPayment && (
        <PaymentReceipt
          payment={selectedPayment}
          onClose={() => {
            setShowReceipt(false);
            setSelectedPaymentId(null);
          }}
        />
      )}

      {showEditForm && selectedPayment && (
        <EditPaymentForm
          payment={selectedPayment}
          onClose={() => {
            setShowEditForm(false);
            setSelectedPaymentId(null);
          }}
          onSuccess={() => {
            setShowEditForm(false);
            setSelectedPaymentId(null);
          }}
        />
      )}
    </div>
  );
}
