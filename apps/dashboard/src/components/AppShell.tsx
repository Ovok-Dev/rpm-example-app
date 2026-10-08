import type { ReactNode } from "react";
import {
  Activity,
  BookOpenText,
  HeartPulse,
  LifeBuoy,
  UsersRound,
} from "lucide-react";
import type { PageId } from "../types";

interface AppShellProps {
  page: PageId;
  mode: "demo" | "sandbox";
  children: ReactNode;
  onNavigate: (page: PageId) => void;
  onConnect: () => void;
  onDisconnect: () => void;
}

const navigation: Array<{
  id: PageId;
  label: string;
  icon: typeof Activity;
}> = [
  { id: "home", label: "Overview", icon: Activity },
  { id: "patients", label: "Patients", icon: UsersRound },
  { id: "signals", label: "Signals setup", icon: HeartPulse },
  { id: "support", label: "Support", icon: LifeBuoy },
];

const pageTitles: Record<PageId, string> = {
  home: "Patient review",
  patients: "Patients",
  signals: "Signals setup",
  support: "Support",
};

export default function AppShell({
  page,
  mode,
  children,
  onNavigate,
  onConnect,
  onDisconnect,
}: AppShellProps) {
  return (
    <div className="app-frame">
      <aside className="sidebar" aria-label="Main navigation">
        <a className="brand" href="#home" onClick={(event) => {
          event.preventDefault();
          onNavigate("home");
        }}>
          <span className="brand-mark" aria-hidden="true">
            <HeartPulse size={21} strokeWidth={2.3} />
          </span>
          <span className="brand-word">ovok<span>care</span></span>
        </a>

        <div className="clinic-label">CLINIC WORKSPACE</div>
        <div className="clinic-card">
          <span className="clinic-avatar"><BookOpenText size={17} /></span>
          <span className="clinic-copy">
            <strong>CHF clinic</strong>
            <span>Single clinic view</span>
          </span>
          <span className="clinic-status" aria-label="One clinic" />
        </div>

        <nav className="primary-nav">
          <span className="nav-label">WORKSPACE</span>
          {navigation.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item ${page === id ? "is-active" : ""}`}
              aria-current={page === id ? "page" : undefined}
              onClick={() => onNavigate(id)}
            >
              <Icon size={18} strokeWidth={1.9} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footnote">
          <span className="footnote-dot" />
          <span>Example workspace<br />for Ovok SDK</span>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>CHF clinic</span>
            <span className="breadcrumb-divider">/</span>
            <strong>{pageTitles[page]}</strong>
          </div>
          <div className="topbar-actions">
            <div className={`environment-pill ${mode}`}>
              <span className="environment-dot" />
              {mode === "demo" ? "Demo workspace" : "Sandbox connected"}
            </div>
            {mode === "demo" ? (
              <button className="button button-primary button-small" onClick={onConnect}>
                Connect sandbox
              </button>
            ) : (
              <button className="button button-quiet button-small" onClick={onDisconnect}>
                Return to demo
              </button>
            )}
          </div>
        </header>

        <main className="page-content" key={page}>
          {children}
        </main>
        <nav className="mobile-nav" aria-label="Main navigation">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`mobile-nav-item ${page === id ? "is-active" : ""}`}
              aria-current={page === id ? "page" : undefined}
              onClick={() => onNavigate(id)}
            >
              <Icon size={19} strokeWidth={1.9} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
