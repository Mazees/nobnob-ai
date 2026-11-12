import Link from "next/link";

const sections = ["Posts", "Calendar", "Accounts", "Analytics", "AI Studio", "Settings"];

function Navigation() {
  return (
    <nav aria-label="Ruang kerja">
      <ul className="grid gap-1">
        <li>
          <Link href="/dashboard" aria-current="page" className="block rounded-control bg-surface px-3 py-2 font-semibold text-primary">
            Dashboard
          </Link>
        </li>
        {sections.map((section) => (
          <li key={section} className="px-3 py-2 text-muted">{section}</li>
        ))}
      </ul>
    </nav>
  );
}

export function WorkspaceShell({ children }) {
  return (
    <div className="mx-auto grid min-h-dvh max-w-[1600px] gap-5 p-4 md:grid-cols-[220px_minmax(0,1fr)] md:gap-8 md:p-6">
      <aside className="hidden rounded-card bg-sidebar p-5 md:block">
        <p className="mb-8 font-primary text-2xl font-bold">Nob<span className="text-primary">Nob</span></p>
        <Navigation />
      </aside>
      <div className="min-w-0">
        <header className="mb-6 border-b border-border pb-4">
          <details className="md:hidden">
            <summary className="cursor-pointer rounded-control bg-sidebar px-3 py-2 font-semibold">Menu NobNob</summary>
            <div className="mt-2 rounded-card bg-sidebar p-3"><Navigation /></div>
          </details>
          <p className="mt-3 text-sm text-muted md:mt-0">Ruang kerja</p>
        </header>
        <main id="main-content">{children}</main>
      </div>
    </div>
  );
}
