"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type RecordStatus = 'pending' | 'approved' | 'rejected';

export interface BurialRecord {
  id: string;
  name: string;
  fatherName: string;
  dateOfDeath: string;
  gender: 'male' | 'female';
  age: number;
  religion: string;
  plotId: string;
  graveId: string;
  status: RecordStatus;
  createdAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  notes?: string;
  phoneNumber?: string;
  address?: string;
}

interface BurialRecordContextType {
  records: BurialRecord[];
  addRecord: (record: Omit<BurialRecord, 'id' | 'createdAt'>) => void;
  updateRecord: (id: string, updates: Partial<BurialRecord>) => void;
  deleteRecord: (id: string) => void;
  approveRecord: (id: string, approvedBy: string) => void;
  rejectRecord: (id: string, notes: string) => void;
  getRecordByGraveId: (graveId: string) => BurialRecord | undefined;
  checkDuplicateRecord: (name: string, fatherName: string, dateOfDeath: string, excludeId?: string) => boolean;
}

const BurialRecordContext = createContext<BurialRecordContextType | undefined>(undefined);

export const BurialRecordProvider = ({ children }: { children: ReactNode }) => {
  const [records, setRecords] = useState<BurialRecord[]>([
   
  ]);

  const addRecord = (record: Omit<BurialRecord, 'id' | 'createdAt'>) => {
    const newRecord: BurialRecord = {
      ...record,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setRecords((prev) => [newRecord, ...prev]);
  };

  const updateRecord = (id: string, updates: Partial<BurialRecord>) => {
    setRecords((prev) =>
      prev.map((record) =>
        record.id === id ? { ...record, ...updates } : record
      )
    );
  };

  const deleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((record) => record.id !== id));
  };

  const approveRecord = (id: string, approvedBy: string) => {
    updateRecord(id, {
      status: 'approved',
      approvedBy,
      approvedAt: new Date(),
    });
  };

  const rejectRecord = (id: string, notes: string) => {
    updateRecord(id, {
      status: 'rejected',
      notes,
    });
  };

  const getRecordByGraveId = (graveId: string) => {
    return records.find((record) => record.graveId === graveId && record.status === 'approved');
  };

  const checkDuplicateRecord = (name: string, fatherName: string, dateOfDeath: string, excludeId?: string) => {
    return records.some((record) =>
      record.name.toLowerCase() === name.toLowerCase() &&
      record.fatherName.toLowerCase() === fatherName.toLowerCase() &&
      record.dateOfDeath === dateOfDeath &&
      record.id !== excludeId
    );
  };

  const value: BurialRecordContextType = {
    records,
    addRecord,
    updateRecord,
    deleteRecord,
    approveRecord,
    rejectRecord,
    getRecordByGraveId,
    checkDuplicateRecord,
  };

  return (
    <BurialRecordContext.Provider value={value}>
      {children}
    </BurialRecordContext.Provider>
  );
};

export const useBurialRecord = () => {
  const context = useContext(BurialRecordContext);
  if (!context) {
    throw new Error('useBurialRecord must be used within BurialRecordProvider');
  }
  return context;
};
