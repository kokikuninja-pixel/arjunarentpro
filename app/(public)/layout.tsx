export const metadata = {
  title: "MotoRent - Sewa Motor Terpercaya",
  description: "Pilih cabang terdekat dan sewa motor berkualitas dengan harga terbaik",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      {children}
    </div>
  );
}