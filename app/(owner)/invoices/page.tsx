
'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { collection, query, orderBy } from 'firebase/firestore';
import { useAuth } from '@/features/auth/hooks/use-auth';
import type { Invoice, InvoiceStatus } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp,
  Clock,
  DollarSign,
  Users
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/useMediaQuery';

// New Split-View Components
import { InvoiceListPanel } from '@/components/invoices/InvoiceListPanel';
import { InvoiceDetailPanel } from '@/components/invoices/InvoiceDetailPanel';
import { EmptyState } from '@/components/invoices/EmptyState';
import { MobileInvoiceView } from '@/components/invoices/MobileInvoiceView';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';

function StatCard({ 
  title, 
  amount, 
  subtitle, 
  icon: Icon, 
  trend
}: {
  title: string;
  amount: string;
  subtitle?: string;
  icon: any;
  trend?: string;
}) {
  return (
    <div className="lumina-card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm text-gray-500 font-medium">{title}</span>
        <div className="w-8 h-8 bg-lumina-100 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-lumina-800" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-navy">{amount}</span>
        {trend && (
          <span className="text-xs text-emerald-500 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}


export default function OwnerInvoicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const firestore = useFirestore();

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [filterStatus, setFilterStatus] = useState<InvoiceStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const isMobile = useMediaQuery('(max-width: 1024px)');

  const selectedId = searchParams.get('id');

  const invoicesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'invoices'), orderBy('createdAt', 'desc'));
  }, [firestore, user]);

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
  
  const stats = useMemo(() => {
    if (!invoices) return { totalRevenue: 0, pendingAmount: 0, activeRentals: 0 };
    const totalRevenue = invoices.reduce((sum, inv) => 
      inv.status !== 'CANCELLED' ? sum + (inv.financial.total || 0) : sum, 0);
    const pendingAmount = invoices.reduce((sum, inv) => 
      (inv.financial.sisa || 0) > 0 ? sum + inv.financial.sisa : sum, 0);
    const activeRentals = invoices.filter(inv => inv.status === 'RENTED').length;
    
    return { totalRevenue, pendingAmount, activeRentals };
  }, [invoices]);

  if (isMobile) {
    return (
      <MobileInvoiceView
        invoices={filteredInvoices}
        selectedInvoice={selectedInvoice}
        onSelect={handleSelectInvoice}
        loading={isLoading}
      />
    );
  }

  return (
     <div className="h-[calc(100vh-10rem)] flex flex-col">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-navy">Global Invoices</h1>
            <p className="text-gray-500 mt-1">Kelola semua invoice dari seluruh cabang</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Revenue" amount={formatCurrency(stats.totalRevenue)} icon={DollarSign} trend="+12.5%"/>
          <StatCard title="Total Due" amount={formatCurrency(stats.pendingAmount)} icon={Clock} />
          <StatCard title="Total Active Rentals" amount={stats.activeRentals.toString()} icon={Users} trend="+3"/>
          <StatCard title="Total Payouts" amount={formatCurrency(stats.totalRevenue * 0.8)} icon={TrendingUp}/>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
          <InvoiceListPanel
            invoices={filteredInvoices}
            selectedId={selectedInvoice?.id}
            onSelect={handleSelectInvoice}
            loading={isLoading}
            filterStatus={filterStatus}
            onFilterChange={setFilterStatus}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          <div className="lg:col-span-8 lumina-card p-0 flex flex-col">
            {isLoading && !selectedInvoice ? (
                <div className="h-full flex items-center justify-center text-gray-400">Loading invoices...</div>
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


    