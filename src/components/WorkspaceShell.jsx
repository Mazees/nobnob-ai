"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const sections = [
  { label: "Dashboard", icon: <Icon><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" /></Icon>, href: "/dashboard" },
  { label: "Posts", icon: <Icon><path d="M6 3h9l4 4v14H6zM14 3v5h5M9 12h7m-7 4h5" /></Icon> },
  { label: "Calendar", icon: <Icon><path d="M4 5h16v16H4zM8 3v4m8-4v4M4 10h16m-11 5h2m3 0h2" /></Icon> },
  { label: "Accounts", icon: <Icon><path d="M10 13a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1M14 11a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1" /></Icon> },
  { label: "Analytics", icon: <Icon><path d="M4 4v16h16M8 16v-3m4 3V9m4 7V6" /></Icon> },
  { label: "AI Studio", icon: <Icon><path d="M4 4h16v12H9l-5 4V4z" /></Icon> },
  { label: "Settings", icon: <Icon><path d="M10 3h4l.7 3 2 .9 2.8-.9 2 3.4-2.2 2v2.3l2.2 2-2 3.4-2.8-.9-2 .9-.7 3h-4l-.7-3-2-.9-2.8.9-2-3.4 2.2-2v-2.3l-2.2-2 2-3.4 2.8.9 2-.9L10 3zM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" /></Icon> },
];

function Icon({ children, className = "size-[18px]" }) {
  return (
    <svg className={`shrink-0 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

function Sidebar({ active, close }) {
  const itemStyle = "flex min-h-12 items-center gap-[11px] rounded-control px-[11px] text-[15px]";
  return (
    <>
      <div className="mb-8 flex items-center justify-between gap-2">
        <Link href="/dashboard" onClick={close} className="flex items-center gap-[11px] font-primary text-[26px] font-bold tracking-tight">
          <span>Nob<span className="text-primary">Nob</span></span>
        </Link>
        {close && (
          <button type="button" onClick={close} aria-label="Tutup navigasi" autoFocus className="grid size-11 shrink-0 place-items-center rounded-control hover:bg-sidebar-active">
            <Icon><path d="M6 6l12 12M18 6L6 18" /></Icon>
          </button>
        )}
      </div>
      <nav aria-label="Navigasi utama">
        <p className="mb-[7px] px-[11px] text-[11px] font-bold text-muted">Ruang kerja</p>
        <ul className="grid gap-[5px]">
          {sections.map(({ label, icon, href }) => (
            <li key={label}>
              {href ? (
                <Link href={href} onClick={close} aria-current={active === href ? "page" : undefined}
                  className={`${itemStyle} text-sidebar-foreground hover:bg-accent aria-[current=page]:bg-sidebar-active aria-[current=page]:font-bold aria-[current=page]:text-sidebar-active-foreground`}>
                  {icon}{label}
                </Link>
              ) : (
                <span aria-disabled="true" className={`${itemStyle} text-sidebar-foreground`}>
                  {icon}{label}
                </span>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto pt-[15px]">
        <div className="flex items-center gap-[9px] rounded-[9px] border border-sidebar-border bg-sidebar-surface p-[11px]">
          <Avatar />
          <div className="min-w-0 wrap-break-word">
            <p className="text-xs font-bold">Nama Akun</p>
            <p className="text-[11px] text-muted">Role</p>
          </div>
        </div>
        <form action="/auth/logout" method="post">
          <button type="submit" className={`${itemStyle} mt-2 w-full text-muted`}>
          <Icon><path d="M10 4H4v16h6m1-8h10m-4-4l4 4-4 4" /></Icon>Keluar
          </button>
        </form>
      </div>
    </>
  );
}

function Avatar({ header = false }) {
  return (
    <span aria-hidden="true" className={`grid shrink-0 place-items-center rounded-[9px] border border-sidebar-avatar-border text-xs font-bold text-sidebar-avatar-foreground ${header ? "size-[33px] bg-surface" : "size-9 bg-sidebar-surface"}`}>
      NN
    </span>
  );
}

export function WorkspaceShell({ children }) {
  const pathname = usePathname();
  const drawer = useRef(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const current = sections.find(({ href }) => href === pathname);
  const closeDrawer = () => drawer.current?.close();

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 761px)");
    const onResize = () => {
      if (desktop.matches) drawer.current?.close();
    };
    desktop.addEventListener("change", onResize);
    return () => desktop.removeEventListener("change", onResize);
  }, []);

  return (
    <div className="mx-auto min-h-dvh max-w-[1600px] min-[761px]:grid min-[761px]:grid-cols-[clamp(190px,18vw,270px)_minmax(0,1fr)] min-[761px]:gap-[20px] min-[761px]:px-[17px] min-[761px]:py-5 min-[1061px]:gap-[clamp(22px,3vw,46px)] min-[1061px]:px-6">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-10 focus:rounded-control focus:bg-surface focus:p-2">
        Ke konten utama
      </a>
      <aside className="sticky top-5 hidden h-[calc(100dvh-40px)] flex-col overflow-auto rounded-card bg-sidebar px-[13px] pt-[29px] pb-[15px] min-[761px]:flex min-[1061px]:px-[23px]">
        <Sidebar active={pathname} />
      </aside>
      <dialog id="workspace-navigation" ref={drawer} aria-label="Navigasi ruang kerja"
        onClose={() => setDrawerOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDrawer();
        }}
        className="fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-[min(240px,100vw)] max-w-none bg-sidebar text-foreground backdrop:bg-foreground/45">
        <div className="flex min-h-full flex-col px-[13px] py-5">
          <Sidebar active={pathname} close={closeDrawer} />
        </div>
      </dialog>
      <div className="min-w-0">
        <header className="flex h-[54px] items-center justify-between gap-2 border-b border-border px-3 min-[761px]:h-11 min-[761px]:border-0 min-[761px]:px-0">
          <div className="flex items-center gap-2 text-[13px]">
            <button type="button" aria-label="Buka navigasi" aria-controls="workspace-navigation" aria-expanded={drawerOpen}
              onClick={() => {
                drawer.current.showModal();
                setDrawerOpen(true);
              }}
              className="grid size-11 place-items-center rounded-control hover:bg-accent min-[761px]:hidden">
              <Icon><path d="M4 6h16M4 12h16M4 18h16" /></Icon>
            </button>
            <span className="hidden text-muted min-[761px]:inline">Ruang kerja</span>
            <Icon className="hidden size-4 text-muted min-[761px]:block"><path d="M9 6l6 6-6 6" /></Icon>
            <strong>{current?.label ?? "NobNob"}</strong>
          </div>
          <Avatar header />
        </header>
        <main id="main-content" tabIndex={-1} className="px-[14px] pt-[15px] pb-7 min-[761px]:px-0 min-[761px]:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
}
