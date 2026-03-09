import { MaintenanceList } from '@/components/maintenance/MaintenanceList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function MaintenancePage({ params }: { params: { branch: string } }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Log Perawatan</h1>
         <Button asChild>
          <Link href={`/${params.branch}/maintenance/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Log
          </Link>
        </Button>
      </div>
      <MaintenanceList branchId={params.branch} />
    </div>
  );
}
