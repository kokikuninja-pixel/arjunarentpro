
'use client';

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UnitList } from "@/components/units/UnitList";
import { useParams } from "next/navigation";

export default function ArmadaPage() {
  const params = useParams();
  const branch = params.branch as string;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Armada</h1>
          <p className="text-muted-foreground">
            Kelola semua unit motor di cabang ini
          </p>
        </div>
        <Button asChild>
          <Link href={`/${branch}/armada/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Unit
          </Link>
        </Button>
      </div>

      <UnitList branchId={branch} />
    </div>
  );
}
