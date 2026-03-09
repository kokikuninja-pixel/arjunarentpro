import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RevenueCard } from "@/components/dashboard/RevenueCard";
import { ActiveRentalsCard } from "@/components/dashboard/ActiveRentalsCard";
import { UnitStatusChart } from "@/components/dashboard/unit-status-chart";
import { ActivityLogCard } from "@/components/dashboard/activity-log-card";
import { getBranch } from "@/features/branches/actions/get-branch";

// Props for the page component, automatically passed by Next.js for dynamic routes
interface PageProps {
  params: { branch: string };
}

// generateMetadata is a server-only function
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const branch = await getBranch(params.branch);
  return {
    title: branch ? `Dashboard ${branch.name}` : "Dashboard Cabang",
  };
}

// The page is now a Server Component
export default async function BranchDashboardPage({ params }: PageProps) {
  const branch = await getBranch(params.branch);

  if (!branch) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard {branch.name}</h1>
        <p className="text-muted-foreground">{branch.address}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RevenueCard branchId={branch.id} scope="branch" />
        <ActiveRentalsCard branchId={branch.id} scope="branch" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UnitStatusChart branchId={branch.id} scope="branch" />
        <ActivityLogCard branchId={branch.id} scope="branch" />
      </div>
    </div>
  );
}
