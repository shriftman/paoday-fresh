import WorkspaceSidebar from '@/components/WorkspaceSidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <WorkspaceSidebar />
      <main className="flex-1 ml-64 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
