import { InventoryList } from '@/components/inventory/InventoryList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function InventoryPage({ params }: { params: { branch: string } }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Inventaris</h1>
         <Button asChild>
          <Link href={`/${params.branch}/inventory/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Item
          </Link>
        </Button>
      </div>
      <InventoryList branchId={params.branch} />
    </div>
  );
}
