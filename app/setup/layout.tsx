// This is a public layout without any authentication protection.
export default function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
