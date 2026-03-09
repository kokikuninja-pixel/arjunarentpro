import { Metadata } from "next";
import { RevenueCard } from "@/components/dashboard/RevenueCard";
import { ActiveRentalsCard } from "@/components/dashboard/ActiveRentalsCard";
import { UnitStatusChart } from "@/components/dashboard/unit-status-chart";
import { ActivityLogCard } from "@/components/dashboard/activity-log-card";
import { BranchList } from "@/features/branches";

export const metadata: Metadata = {
  title: "Dashboard Owner - MotoRent",
};

export default function OwnerDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard Owner</h1>
        <p className="text-muted-foreground">Overview semua cabang</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RevenueCard scope="global" />
        <ActiveRentalsCard scope="global" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UnitStatusChart scope="global" />
        <ActivityLogCard scope="global" />
      </div>
      
      <div className="pt-4">
        <h2 className="text-2xl font-bold mb-4">Daftar Cabang</h2>
        <BranchList />
      </div>
    </div>
  );
}
