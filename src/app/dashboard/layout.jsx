import { Suspense } from "react";
import { WorkspaceQueryProvider } from "@/components/WorkspaceQueryProvider";
import { WorkspaceShell } from "@/components/WorkspaceShell";

export default function WorkspaceLayout({ children }) {
  return (
    <Suspense
      fallback={
        <main className="p-6 text-sm text-muted" role="status">
          Memuat ruang kerja…
        </main>
      }
    >
      <WorkspaceShell>
        <WorkspaceQueryProvider>{children}</WorkspaceQueryProvider>
      </WorkspaceShell>
    </Suspense>
  );
}
