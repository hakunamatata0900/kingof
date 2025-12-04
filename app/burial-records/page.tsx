"use client";

import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useBurialRecord } from '@/contexts/BurialRecordContext';
import { useGraveyard } from '@/contexts/GraveyardContext';
import { Plus, Search, Filter, Check, X, Eye, Lock, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BurialRecordForm from '@/components/BurialRecordForm';
import EditBurialRecordForm from '@/components/EditBurialRecordForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function BurialRecordsPage() {
  const { isAuthenticated, user } = useAuth();
  const { records, approveRecord, rejectRecord } = useBurialRecord();
  const { plots } = useGraveyard();
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedRecord, setSelectedRecord] = useState<typeof records[0] | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectingRecordId, setRejectingRecordId] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<typeof records[0] | null>(null);

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

  const canAddRecord = ['admin', 'staff'].includes(user?.role || '');
  const canApprove = user?.role === 'admin';

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch =
        record.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.fatherName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = filterStatus === 'all' || record.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [records, searchQuery, filterStatus]);

  const getPlotName = (plotId: string) => {
    const plot = plots.find((p) => p.id === plotId);
    return plot ? `Plot ${plot.plotNumber}` : 'N/A';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleReject = (recordId: string) => {
    setRejectingRecordId(recordId);
    setRejectReason('');
    setShowRejectDialog(true);
  };

  const submitReject = () => {
    if (rejectingRecordId) {
      rejectRecord(rejectingRecordId, rejectReason);
      setShowRejectDialog(false);
      setRejectingRecordId(null);
      setRejectReason('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Burial Records</h1>
            <p className="text-slate-600">Manage and track burial registrations</p>
          </div>
          {canAddRecord && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white px-6 py-3 rounded-lg hover:from-cyan-600 hover:to-cyan-700 flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              New Record
            </Button>
          )}
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by name or father's name..."
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
              <SelectItem value="all">All Records</SelectItem>
              <SelectItem value="pending">Pending Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
            <div>
              <p className="text-sm text-slate-600">Total Records</p>
              <p className="text-2xl font-bold text-slate-900">{filteredRecords.length}</p>
            </div>
            <Filter className="h-5 w-5 text-slate-400" />
          </div>
        </div>

        <div className="rounded-2xl bg-white shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Father's Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Date of Death</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Age</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Religion</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Plot/Grave</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">{record.name}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{record.fatherName}</td>
                      <td className="px-6 py-4 text-slate-600">
                        {new Date(record.dateOfDeath).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{record.age}</td>
                      <td className="px-6 py-4 text-slate-600">{record.religion}</td>
                      <td className="px-6 py-4 text-slate-600 text-sm">
                        <div className="bg-slate-100 rounded px-2 py-1 inline-block">
                          {getPlotName(record.plotId)}/{record.graveId.substring(0, 4)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(record.status)}`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedRecord(record);
                              setShowDetails(true);
                            }}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {canApprove && (
                            <button
                              onClick={() => setEditingRecord(record)}
                              className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 hover:text-blue-700"
                              title="Edit record"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}

                          {canApprove && record.status === 'pending' && (
                            <>
                              <button
                                onClick={() => approveRecord(record.id, user?.username || 'admin')}
                                className="p-2 rounded-lg hover:bg-green-100 text-green-600 hover:text-green-700"
                                title="Approve"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleReject(record.id)}
                                className="p-2 rounded-lg hover:bg-red-100 text-red-600 hover:text-red-700"
                                title="Reject"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <p className="text-slate-600">No burial records found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showForm && <BurialRecordForm onClose={() => setShowForm(false)} />}

      {showDetails && selectedRecord && (
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Burial Record Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Name</p>
                  <p className="font-semibold text-slate-900">{selectedRecord.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Father's Name</p>
                  <p className="font-semibold text-slate-900">{selectedRecord.fatherName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Date of Death</p>
                  <p className="font-semibold text-slate-900">
                    {new Date(selectedRecord.dateOfDeath).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Gender</p>
                  <p className="font-semibold text-slate-900 capitalize">{selectedRecord.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Age</p>
                  <p className="font-semibold text-slate-900">{selectedRecord.age}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Religion</p>
                  <p className="font-semibold text-slate-900">{selectedRecord.religion}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Plot</p>
                  <p className="font-semibold text-slate-900">{getPlotName(selectedRecord.plotId)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(selectedRecord.status)}`}>
                    {selectedRecord.status.charAt(0).toUpperCase() + selectedRecord.status.slice(1)}
                  </span>
                </div>
                {selectedRecord.phoneNumber && (
                  <div>
                    <p className="text-sm text-slate-600">Phone Number</p>
                    <p className="font-semibold text-slate-900">{selectedRecord.phoneNumber}</p>
                  </div>
                )}
                {selectedRecord.address && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-slate-600">Address</p>
                    <p className="font-semibold text-slate-900">{selectedRecord.address}</p>
                  </div>
                )}
              </div>

              {selectedRecord.approvedBy && (
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <p className="text-sm text-slate-600">Approved by {selectedRecord.approvedBy}</p>
                  {selectedRecord.approvedAt && (
                    <p className="text-xs text-slate-500">
                      {new Date(selectedRecord.approvedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {selectedRecord.notes && (
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <p className="text-sm font-medium text-red-700">Rejection Reason</p>
                  <p className="text-sm text-red-600 mt-1">{selectedRecord.notes}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {showRejectDialog && (
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Reject Record</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Reason for Rejection</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter reason..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={4}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => setShowRejectDialog(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={submitReject}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
                >
                  Reject
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {editingRecord && (
        <EditBurialRecordForm
          record={editingRecord}
          onClose={() => setEditingRecord(null)}
        />
      )}
    </div>
  );
}
