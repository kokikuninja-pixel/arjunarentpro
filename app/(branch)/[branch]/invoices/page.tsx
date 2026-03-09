"use client";

import { useParams } from "next/navigation";
import { useState, useMemo, useEffect, useCallback } from "react";
import { InvoiceListPanel } from "@/components/invoices/InvoiceListPanel";
import { InvoiceDetailPanel } from "@/components/invoices/InvoiceDetailPanel";
import { EmptyState } from "@/components/invoices/EmptyState";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { collection, query, where, orderBy } from 'firebase/firestore';
import type { Invoice, InvoiceStatus } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';

export default function BranchInvoicesPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { branches } = useAuth();
  
  const branchCode = params.branch as string;
  const branch = useMemo(() => branches.find(b => b.id === branchCode), [branches, branchCode]);
  const branchId = branch?.id;

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [filterStatus, setFilterStatus] = useState<InvoiceStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedId = searchParams.get('id');

  const invoicesQuery = useMemoFirebase(() => {
    if (!branchId) return null;
    return query(collection(firestore, 'invoices'), where('branchId', '==', branchId), orderBy('createdAt', 'desc'));
  }, [firestore, branchId]);

  const { data: invoices, isLoading, error } = useCollection<Invoice>(invoicesQuery);

  useEffect(() => {
    if (error) {
      toast({ variant: 'destructive', title: 'Gagal memuat data invoice', description: error.message });
    }
  }, [error, toast]);

  const updateURL = useCallback((invoiceId: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('id', invoiceId);
    router.replace(url.pathname + url.search, { scroll: false });
  }, [router]);
  
  const filteredInvoices = useMemo(() => {
    if (!invoices) return [];
    return invoices.filter(inv => {
      const matchesStatus = filterStatus === 'ALL' || inv.status === filterStatus;
      const matchesSearch = searchQuery === '' || 
        inv.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.customerSnapshot.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.unitMotor && inv.unitMotor.nopol?.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }, [invoices, filterStatus, searchQuery]);
  
  useEffect(() => {
    if (isLoading || !invoices || invoices.length === 0) return;
    const found = invoices.find(inv => inv.id === selectedId);
    if (found) {
        if (selectedInvoice?.id !== found.id) {
            setSelectedInvoice(found);
        }
    } else if (!selectedId && filteredInvoices.length > 0) {
        setSelectedInvoice(filteredInvoices[0]);
        updateURL(filteredInvoices[0].id);
    } else {
        setSelectedInvoice(null);
    }
  }, [selectedId, invoices, isLoading, filterStatus, selectedInvoice, updateURL, filteredInvoices]);

  const handleSelectInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    updateURL(invoice.id);
  };
  
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <Button asChild>
          <Link href={`/${branchCode}/invoices/new`}>
            <Plus className="w-4 h-4 mr-2" />
            Invoice Baru
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        <InvoiceListPanel 
          invoices={filteredInvoices}
          onSelect={handleSelectInvoice}
          selectedId={selectedInvoice?.id}
          loading={isLoading}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <div className="lg:col-span-8 lumina-card p-0 flex flex-col">
          {isLoading && !selectedInvoice ? (
              <div className="h-full flex items-center justify-center text-gray-400">Loading invoice...</div>
          ) : selectedInvoice ? (
            <InvoiceDetailPanel
              key={selectedInvoice.id}
              invoiceId={selectedInvoice.id}
            />
          ) : (
            <EmptyState type={invoices && invoices.length > 0 ? "no-selection" : "no-invoices"} />
          )}
        </div>
      </div>
    </div>
  );
}
