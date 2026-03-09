
"use client";

import { BranchList } from "@/features/branches/components/branch-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function BranchesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold">Manajemen Cabang</h1>
            <p className="text-muted-foreground">Kelola semua cabang rental motor Anda.</p>
        </div>
        <Button asChild>
            <Link href="/owner/branches/new">
                <Plus className="mr-2 h-4 w-4" />
                Tambah Cabang
            </Link>
        </Button>
      </div>
      
      <BranchList />
    </div>
  );
}
