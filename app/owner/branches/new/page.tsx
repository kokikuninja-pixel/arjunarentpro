import { BranchForm } from "@/features/branches/components/branch-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewBranchPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Buat Cabang Baru</h1>
      <Card>
        <CardHeader>
          <CardTitle>Detail Cabang</CardTitle>
          <CardDescription>
            Isi detail untuk cabang baru Anda. Kode cabang tidak dapat diubah setelah dibuat.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BranchForm />
        </CardContent>
      </Card>
    </div>
  );
}
