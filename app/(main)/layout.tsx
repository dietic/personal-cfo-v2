import { ChatProvider } from "@/components/chat/chat-provider";
import { DashboardNavbar } from "@/components/dashboard/dashboard-navbar";
import { Sidebar } from "@/components/dashboard/sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex h-screen overflow-hidden relative z-0">
        {/* Sidebar - hidden on mobile, visible on desktop */}
        <Sidebar />

        {/* Main content area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top navbar */}
          <DashboardNavbar />

          {/* Page content */}
          <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>

      {/* Floating chat widget - rendered outside overflow container */}
      <ChatProvider />
    </>
  );
}
