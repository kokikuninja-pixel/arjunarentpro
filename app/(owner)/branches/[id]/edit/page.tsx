import { getBranch } from "@/features/branches/actions/get-branch";
import { BranchForm } from "@/features/branches/components/branch-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";

interface PageProps {
  params: { id: string };
}

export default async function EditBranchPage({ params }: PageProps) {
  const branch = await getBranch(params.id);

  if (!branch) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Edit Cabang: {branch.name}</h1>
       <Card>
        <CardHeader>
          <CardTitle>Detail Cabang</CardTitle>
          <CardDescription>
            Perbarui detail untuk cabang ini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BranchForm branch={branch} />
        </CardContent>
      </Card>
    </div>
  );
}
