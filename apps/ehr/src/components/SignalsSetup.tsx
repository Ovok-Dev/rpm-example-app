import { useEffect, useState } from "react";
import type { OvokClient } from "@ovok/core";
import { Activity, ArrowUpRight, ShieldCheck } from "lucide-react";

type SignalsSettings = Awaited<ReturnType<OvokClient["getSignalsSettings"]>>;
type RawAlert = Awaited<ReturnType<OvokClient["listSignalsRawAlerts"]>>["items"][number];

export function SignalsSetup({ client, demo }: { client: OvokClient | null; demo: boolean }) {
  const [settings, setSettings] = useState<SignalsSettings | null>(null);
  const [alerts, setAlerts] = useState<RawAlert[]>([]);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [alertsError, setAlertsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (demo || !client) return;
    let current = true;
    setLoading(true);
    setSettingsError(null);
    setAlertsError(null);
    Promise.allSettled([
      client.getSignalsSettings(),
      client.listSignalsRawAlerts({ acknowledged: false, limit: 20 }),
    ]).then(([settingsResult, alertsResult]) => {
      if (!current) return;
      if (settingsResult.status === "fulfilled") setSettings(settingsResult.value);
      else setSettingsError(errorMessage(settingsResult.reason));
      if (alertsResult.status === "fulfilled") setAlerts(alertsResult.value.items);
      else setAlertsError(errorMessage(alertsResult.reason));
    }).finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [client, demo]);

  return (
    <section className="content-page">
      <div className="page-intro"><div><h1>Signals setup</h1><p>Review the project status and setup guidance. This screen does not alter Signals configuration or acknowledge alerts.</p></div><span className="status-pill"><ShieldCheck size={14} /> Read-only</span></div>
      {demo ? <article className="panel notice-panel"><h2>Sandbox connection required</h2><p>Signals settings and alert results are not simulated in demo mode. Connect a practitioner account to request genuine sandbox data.</p></article> : <>
        <article className="panel signal-settings"><div className="panel-title"><Activity size={18} /><h2>Project settings</h2></div>
          {loading && <p className="notice">Loading current settings…</p>}
          {settingsError && <p className="notice notice-error" role="alert">Settings request failed: {settingsError}</p>}
          {settings && <dl className="settings-list"><div><dt>Episodic alerts</dt><dd><span className={`status-mark ${settings.settings.episodicAlerts ? "status-on" : "status-off"}`} />{settings.settings.episodicAlerts ? "Enabled" : "Disabled"}</dd></div><div><dt>Workspace</dt><dd>{settings.tenant === "project" ? "Current sandbox project" : "Shared tenant"}</dd></div><div><dt>Configuration</dt><dd>Read-only from this example</dd></div></dl>}
          <a className="inline-link" href="https://docs.ovok.com/signals" target="_blank" rel="noreferrer">Review Signals documentation <ArrowUpRight size={14} /></a>
        </article>
        <article className="panel"><div className="section-heading"><div><h2>Open Signals alerts</h2></div><span className="status-pill">{alerts.length} returned</span></div>
          {alertsError && <p className="notice notice-error" role="alert">Alert request failed: {alertsError}</p>}
          {alerts.length ? <div className="record-list">{alerts.map((alert) => <div className="record-row" key={alert.id}><span className="record-icon alert-icon"><Activity size={16} /></span><div><strong>{alert.code ?? "Signals alert"}</strong><p>{alert.patientId} · {alert.createdAt ? new Date(alert.createdAt).toLocaleString() : "Timestamp unavailable"} · acknowledgement is managed in an authorized clinical workflow</p></div></div>)}</div> : !alertsError && !loading ? <p className="empty-state">No open alerts were returned by the current sandbox request.</p> : null}
        </article>
      </>}
      <article className="panel info-panel"><h2>Component boundary</h2><p>Signals is a separately regulated platform component. This example reports only returned settings and alert data; it does not calculate risk or provide clinical advice.</p></article>
    </section>
  );
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "The sandbox request could not be completed.";
}
