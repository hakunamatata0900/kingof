"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type PaymentStatus = 'paid' | 'pending' | 'overdue';
export type ServiceType = 'grave_booking' | 'burial_service' | 'maintenance' | 'other';

export interface Payment {
  id: string;
  customerName: string;
  amount: number;
  date: string;
  dueDate?: string;
  plotInfo?: string;
  graveInfo?: string;
  serviceType: ServiceType;
  status: PaymentStatus;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface FinanceContextType {
  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => Payment;
  updatePayment: (id: string, updates: Partial<Payment>) => void;
  deletePayment: (id: string) => void;
  getPaymentById: (id: string) => Payment | undefined;
  getTotalRevenue: () => number;
  getPaidAmount: () => number;
  getPendingAmount: () => number;
  getOverdueAmount: () => number;
  getOverduePayments: () => Payment[];
  getPendingPayments: () => Payment[];
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEY = 'graveyard_payments';

export const FinanceProvider = ({ children }: { children: ReactNode }) => {
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const paymentsWithDates = parsed.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
        }));
        setPayments(paymentsWithDates);
      } catch (error) {
        console.error('Failed to parse stored payments');
      }
    } else {
      const samplePayments: Payment[] = [
        {
          id: '1',
          customerName: 'Musawir Abbass',
          amount: 5000,
          date: '2024-10-15',
          plotInfo: 'Plot A1',
          graveInfo: 'Grave 12',
          serviceType: 'grave_booking',
          status: 'paid',
          description: 'Grave Booking for family member',
          createdAt: new Date('2024-10-15'),
          updatedAt: new Date('2024-10-15'),
        },
        {
          id: '2',
          customerName: 'Muhammad Bilal',
          amount: 3500,
          date: '2024-11-01',
          dueDate: '2024-11-15',
          plotInfo: 'Plot B2',
          graveInfo: 'Grave 8',
          serviceType: 'burial_service',
          status: 'pending',
          description: 'Burial service arrangement',
          createdAt: new Date('2024-11-01'),
          updatedAt: new Date('2024-11-01'),
        },
        {
          id: '3',
          customerName: 'Daniyal Ali',
          amount: 2000,
          date: '2024-10-20',
          dueDate: '2024-10-30',
          plotInfo: 'Plot A2',
          serviceType: 'maintenance',
          status: 'overdue',
          description: 'Annual maintenance fee',
          createdAt: new Date('2024-10-20'),
          updatedAt: new Date('2024-10-20'),
        },
      ];
      setPayments(samplePayments);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(samplePayments));
    }
  }, []);

  useEffect(() => {
    if (payments.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payments));
    }
  }, [payments]);

  const addPayment = (payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Payment => {
    const newPayment: Payment = {
      ...payment,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setPayments((prev) => [newPayment, ...prev]);
    return newPayment;
  };

  const updatePayment = (id: string, updates: Partial<Payment>) => {
    setPayments((prev) =>
      prev.map((payment) =>
        payment.id === id
          ? { ...payment, ...updates, updatedAt: new Date() }
          : payment
      )
    );
  };

  const deletePayment = (id: string) => {
    setPayments((prev) => prev.filter((payment) => payment.id !== id));
  };

  const getPaymentById = (id: string) => {
    return payments.find((p) => p.id === id);
  };

  const getTotalRevenue = () => {
    return payments.reduce((sum, p) => sum + p.amount, 0);
  };

  const getPaidAmount = () => {
    return payments
      .filter((p) => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const getPendingAmount = () => {
    return payments
      .filter((p) => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const getOverdueAmount = () => {
    return payments
      .filter((p) => p.status === 'overdue')
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const getOverduePayments = () => {
    return payments.filter((p) => p.status === 'overdue');
  };

  const getPendingPayments = () => {
    return payments.filter((p) => p.status === 'pending');
  };

  const value: FinanceContextType = {
    payments,
    addPayment,
    updatePayment,
    deletePayment,
    getPaymentById,
    getTotalRevenue,
    getPaidAmount,
    getPendingAmount,
    getOverdueAmount,
    getOverduePayments,
    getPendingPayments,
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within FinanceProvider');
  }
  return context;
};
