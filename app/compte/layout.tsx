import { Sidebar } from "@/components/layout/Sidebar";

export default function CompteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950 pt-14 lg:pt-0">{children}</main>
    </div>
  );
}
