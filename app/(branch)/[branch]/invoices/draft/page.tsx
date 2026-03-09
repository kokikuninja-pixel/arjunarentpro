interface PageProps {
  params: { branch: string };
}

export default function BranchPage({ params }: PageProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold capitalize">Branch Page</h1>
      <p className="text-muted-foreground">
        Branch: <code className="bg-gray-100 px-2 py-1 rounded">{params.branch}</code>
      </p>
    </div>
  );
}
