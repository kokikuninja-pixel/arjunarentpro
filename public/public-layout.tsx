import { Icons } from "@/components/icons";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center bg-muted/40 p-4 md:p-8">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="flex items-center gap-2">
            <Icons.logo className="size-10 text-primary" />
            <span className="text-2xl font-semibold font-headline">
              Sistem Rental Motor
            </span>
        </div>
        <p className="text-muted-foreground">Manajemen Rental Motor yang Efisien</p>
      </div>
      {children}
    </main>
  );
}
