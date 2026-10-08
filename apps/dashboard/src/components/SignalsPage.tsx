import {
  ArrowUpRight,
  BookOpenText,
  CircleAlert,
  CircleCheck,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import type { OvokClient } from "@ovok/core";
import type { PatientChoice } from "../types";
import { formatDateTime } from "../lib/formatting";

type SignalsSettings = Awaited<ReturnType<OvokClient["getSignalsSettings"]>>;
type RawSignal = Awaited<ReturnType<OvokClient["listSignalsRawAlerts"]>>["items"][number];

interface SignalsPageProps {
  mode: "demo" | "sandbox";
  tenantCode: string;
  settings: SignalsSettings | null;
  alerts: RawSignal[];
  patients: PatientChoice[];
  settingsError: string | null;
  alertsError: string | null;
  loading: boolean;
  onConnect: () => void;
}

export default function SignalsPage({
  mode,
  tenantCode,
  settings,
  alerts,
  patients,
  settingsError,
  alertsError,
  loading,
  onConnect,
}: SignalsPageProps) {
  const patientNames = new Map(patients.map((patient) => [patient.id, patient.name]));

  return (
    <div className="content-stack">
      <section className="page-heading">
        <div>
          <h1>Signals setup</h1>
          <p className="page-subtitle">Read-only status and setup guidance for this clinic’s project.</p>
        </div>
        <span className="read-only-tag"><ShieldCheck size={15} /> Read only</span>
      </section>

      {mode === "demo" ? (
        <section className="setup-card">
          <div className="setup-icon"><CircleAlert size={20} /></div>
          <div className="setup-copy">
            <h2>Connect to view live setup</h2>
            <p>This demo cannot report Signals settings or alerts. Sign in with a practitioner account to read the project configuration.</p>
            <button className="button button-primary" onClick={onConnect}>Connect sandbox</button>
          </div>
          <div className="setup-aside">
            <span>Tenant code</span><strong>{tenantCode}</strong>
            <span>API environment</span><strong>Sandbox</strong>
          </div>
        </section>
      ) : (
        <>
          <section className="signals-settings-card">
            <div className="section-heading">
              <div><h2>Project status</h2><p>Values returned by Ovok Signals</p></div>
              {settings && <span className="read-only-tag"><ShieldCheck size={15} /> Read only</span>}
            </div>
            {loading && !settings && <div className="loading-panel compact">Loading setup…</div>}
            {settingsError && <div className="inline-error" role="alert">{settingsError}</div>}
            {settings && (
              <div className="settings-grid">
                <div className="setting-tile">
                  <span>Tenant scope</span>
                  <strong>{settings.tenant === "project" ? "This project" : "Shared settings"}</strong>
                  <small>Reported by the Ovok API</small>
                </div>
                <div className="setting-tile">
                  <span>Episodic alerts</span>
                  <strong className="setting-status">
                    <span className={settings.settings.episodicAlerts ? "status-on" : "status-off"} />
                    {settings.settings.episodicAlerts ? "Enabled" : "Disabled"}
                  </strong>
                  <small>Project behavior; this screen cannot change it</small>
                </div>
                <div className="setting-tile">
                  <span>Changes</span>
                  <strong>Configure in project setup</strong>
                  <small>Changing this value can affect open episodes</small>
                </div>
              </div>
            )}
          </section>

          <section className="signals-alert-section">
            <div className="section-heading">
              <div><h2>Unacknowledged Signals alerts</h2><p>Individual alerts returned by Ovok; acknowledgement is not available here.</p></div>
              <span className="activity-count">{alerts.length} alerts</span>
            </div>
            {loading && <div className="loading-panel compact" role="status">Loading alerts…</div>}
            {alertsError && <div className="inline-error" role="alert">{alertsError}</div>}
            {!loading && !alertsError && (
              alerts.length ? (
                <div className="alert-list">
                  {alerts.map((alert) => (
                    <article className="alert-row" key={alert.id}>
                      <span className={`alert-icon ${alert.status.toLowerCase()}`}><CircleAlert size={17} /></span>
                      <div className="alert-description">
                        <strong>{patientNames.get(alert.patientId) ?? "Patient record"}</strong>
                        <span>{alert.message ?? alert.reason.replaceAll("_", " ").toLowerCase()}</span>
                      </div>
                      <span className={`alert-status ${alert.status.toLowerCase()}`}>
                        {alert.status === "RESOLVED" ? "Resolved · unacknowledged" : "Active · unacknowledged"}
                      </span>
                      <time dateTime={alert.createdAt}>{formatDateTime(alert.createdAt)}</time>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="signals-empty"><CircleCheck size={19} />No unacknowledged alerts were returned.</div>
              )
            )}
          </section>
        </>
      )}

      <section className="guidance-card">
        <div className="guidance-icon"><BookOpenText size={19} /></div>
        <div className="guidance-copy">
          <h2>Complete setup in Ovok</h2>
          <p>Use the project’s documented configuration and access policy. This example reads settings and raw alerts through the Ovok SDK only.</p>
        </div>
        <a className="button button-secondary" href="https://docs.ovok.com/access-policies/signals" target="_blank" rel="noreferrer">
          Signals access guide <ExternalLink size={14} />
        </a>
        <a className="guidance-link" href="https://docs.ovok.com/signals" target="_blank" rel="noreferrer" aria-label="Open Ovok Signals documentation">
          <ArrowUpRight size={17} />
        </a>
      </section>
    </div>
  );
}
