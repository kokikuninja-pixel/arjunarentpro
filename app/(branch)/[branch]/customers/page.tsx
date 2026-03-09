
'use client';

import { CustomerList } from '@/components/customers/CustomerList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function CustomersPage() {
  const params = useParams();
  const branch = params.branch as string;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pelanggan</h1>
        <Button asChild>
          <Link href={`/${branch}/customers/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Pelanggan
          </Link>
        </Button>
      </div>
      <CustomerList branchId={branch} />
    </div>
  );
}
