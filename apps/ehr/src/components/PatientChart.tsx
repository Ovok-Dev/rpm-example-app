import { useEffect, useState } from "react";
import type { CarePlan, CareTeam, Consent, Device, DeviceUseStatement, Observation, Patient, Practitioner, QuestionnaireResponse } from "@medplum/fhirtypes";
import { ArrowLeft, Activity, ClipboardList, HeartPulse, UserRound } from "lucide-react";
import { type DemoPatient, type WorkspaceMode } from "../domain";
import { DEMO_MEASUREMENTS } from "../data/demo";
import { deviceName, patientName, practitionerName, toCarePlan, toCareTeam, toDeviceUseStatement, toFhirPatient } from "../lib/fhir";
import type { OvokClient } from "@ovok/core";

type ChartTab = "overview" | "demographics" | "observations" | "questionnaires" | "care-team" | "devices";
interface PatientChartProps {
  client: OvokClient | null;
  mode: WorkspaceMode;
  patient: Patient | null;
  demoPatient?: DemoPatient | null;
  demoPatientId?: string;
  onBack: () => void;
}

export function PatientChart({ client, mode, patient, demoPatient, demoPatientId, onBack }: PatientChartProps) {
  const [tab, setTab] = useState<ChartTab>("overview");
  const [observations, setObservations] = useState<Observation[]>([]);
  const [questionnaires, setQuestionnaires] = useState<QuestionnaireResponse[]>([]);
  const [careTeams, setCareTeams] = useState<CareTeam[]>([]);
  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
  const [devices, setDevices] = useState<DeviceUseStatement[]>([]);
  const [consents, setConsents] = useState<Consent[]>([]);
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [availableDevices, setAvailableDevices] = useState<Device[]>([]);
  const [selectedPractitionerId, setSelectedPractitionerId] = useState("");
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [selectedNurseId, setSelectedNurseId] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [actionBusy, setActionBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== "sandbox" || !client || !patient?.id) return;
    let current = true;
    setObservations([]);
    setQuestionnaires([]);
    setCareTeams([]);
    setCarePlans([]);
    setDevices([]);
    setConsents([]);
    setLoading(true);
    setError(null);

    Promise.allSettled([
      client.listPatientMeasurementHistory({ patient: `Patient/${patient.id}`, _sort: "-date", _count: 50 }),
      client.listPatientQuestionnaireResponses({ patient: `Patient/${patient.id}`, _sort: "-authored", _count: 20 }),
      client.searchResources<"CareTeam">("CareTeam", { subject: `Patient/${patient.id}`, _count: 20 }),
      client.searchResources<"CarePlan">("CarePlan", { subject: `Patient/${patient.id}`, _count: 20 }),
      client.searchResources<"DeviceUseStatement">("DeviceUseStatement", { patient: `Patient/${patient.id}`, _count: 20 }),
      client.searchResources<"Consent">("Consent", { patient: `Patient/${patient.id}`, _count: 20 }),
      client.searchResources<"Practitioner">("Practitioner", { _count: 50, _sort: "name" }),
      client.searchResources<"Device">("Device", { _count: 50 }),
    ]).then((results) => {
      if (!current) return;
      const failedReads: string[] = [];
      applyReadResult(results[0], "Observations", setObservations, failedReads);
      applyReadResult(results[1], "QuestionnaireResponses", setQuestionnaires, failedReads);
      applyReadResult(results[2], "CareTeams", setCareTeams, failedReads);
      applyReadResult(results[3], "CarePlans", setCarePlans, failedReads);
      applyReadResult(results[4], "DeviceUseStatements", setDevices, failedReads);
      applyReadResult(results[5], "Consents", setConsents, failedReads);
      applyReadResult(results[6], "Practitioners", setPractitioners, failedReads);
      applyReadResult(results[7], "Devices", setAvailableDevices, failedReads);
      setError(failedReads.length ? `Could not read ${failedReads.join(", ")}. Ovok returned a permission or request error.` : null);
    }).finally(() => {
      if (current) setLoading(false);
    });

    return () => { current = false; };
  }, [client, mode, patient?.id, refreshKey]);

  const displayPatient = mode === "demo" && demoPatient
    ? { ...toFhirPatient(demoPatient), id: demoPatient.id }
    : patient;
  const name = displayPatient ? patientName(displayPatient) : "Patient record";
  const demoMeasurements = DEMO_MEASUREMENTS.filter((measurement) => measurement.patientId === demoPatientId);

  return (
    <section className="chart-page">
      <button className="text-button" onClick={onBack}><ArrowLeft size={16} /> Back to clinic operations</button>
      <div className="chart-heading">
        <div className="patient-avatar large">{initials(name)}</div>
        <div>
          <h1>{name}</h1>
          <p>{mode === "demo" ? "Synthetic record" : "Ovok FHIR record"} · {displayPatient?.id ? `Patient/${displayPatient.id}` : "Synthetic patient"} · {displayPatient?.birthDate ?? "Date of birth not recorded"}</p>
        </div>
        <a className="button button-secondary chart-rpm-link" href={rpmReviewUrl(patient?.id ?? demoPatientId ?? "")} target="_blank" rel="noreferrer">
          <Activity size={16} /> Open RPM review
        </a>
      </div>
      <nav className="chart-tabs" aria-label="Patient chart sections">
        {chartTabs.map(({ id, label }) => (
          <button key={id} className={tab === id ? "is-selected" : ""} onClick={() => setTab(id)}>{label}</button>
        ))}
      </nav>
      {loading && <p className="notice">Loading records allowed by the active AccessPolicy…</p>}
      {error && <p className="notice notice-error" role="alert">Some chart records could not be loaded: {error}</p>}
      {tab === "overview" && (
        <div className="chart-grid">
          <article className="panel chart-main-panel">
            <div className="section-heading"><div><h2>Recent activity</h2></div><span className="status-pill">{mode === "demo" ? "Synthetic" : "FHIR"}</span></div>
            {mode === "demo" ? <DemoTimeline measurements={demoMeasurements} /> : <SandboxTimeline observations={observations} questionnaires={questionnaires} carePlans={carePlans} careTeams={careTeams} />}
          </article>
          <aside className="chart-aside">
            <article className="panel"><div className="panel-title"><UserRound size={17} /><h2>Demographics</h2></div><p>{displayPatient?.gender ?? "Gender not recorded"}</p><p>{displayPatient?.birthDate ?? "Date of birth not recorded"}</p><p>{patientEmail(displayPatient)}</p></article>
            <article className="panel"><div className="panel-title"><HeartPulse size={17} /><h2>CHF RPM enrollment</h2></div><p>{mode === "demo" ? "Progress is synthetic and local to this browser session." : carePlans.length ? `${carePlans.length} CarePlan record(s) accessible.` : "No accessible CarePlan returned."}</p><p>Consent status: {mode === "demo" ? demoPatient?.intake.consented ? "Marked in synthetic intake" : "Not marked in synthetic intake" : consentSummary(consents)}</p><p className="fine-print">No diagnosis or treatment recommendation is generated.</p></article>
          </aside>
        </div>
      )}
      {tab === "demographics" && <Demographics patient={displayPatient} />}
      {tab === "observations" && <RecordList title="Measurements" records={mode === "demo" ? demoMeasurements : observations} empty="No accessible measurements were returned." />}
      {tab === "questionnaires" && <RecordList title="Questionnaires" records={mode === "demo" ? demoMeasurements.filter((item) => item.kind === "questionnaire") : questionnaires} empty="No accessible questionnaire responses were returned." />}
      {tab === "care-team" && <RecordList title="Care team and plans" records={mode === "demo" ? [] : [...careTeams, ...carePlans]} empty={mode === "demo" ? "Demo care-team details are shown in the enrollment workbench." : "No accessible CareTeam or CarePlan records were returned."} />}
      {tab === "devices" && <RecordList title="Assigned devices" records={mode === "demo" ? demoMeasurements.filter((item) => item.kind === "ecg" || item.kind === "weight") : devices} empty={mode === "demo" ? "Physical kit assignment is synthetic demo inventory." : "No accessible DeviceUseStatement records were returned. Shipping and kit inventory are outside the verified Ovok FHIR workflow."} />}
      {mode === "sandbox" && patient && <SandboxEnrollmentActions
        patient={patient}
        client={client}
        careTeams={careTeams}
        carePlans={carePlans}
        devices={devices}
        consents={consents}
        practitioners={practitioners}
        availableDevices={availableDevices}
        selectedPractitionerId={selectedPractitionerId}
        selectedNurseId={selectedNurseId}
        selectedDeviceId={selectedDeviceId}
        onSelectPractitioner={setSelectedPractitionerId}
        onSelectNurse={setSelectedNurseId}
        onSelectDevice={setSelectedDeviceId}
        onSaved={() => setRefreshKey((value) => value + 1)}
        actionMessage={actionMessage}
        actionError={actionError}
        actionBusy={actionBusy}
        setActionBusy={setActionBusy}
        setActionMessage={setActionMessage}
        setActionError={setActionError}
      />}
    </section>
  );
}

const chartTabs: { id: ChartTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "demographics", label: "Demographics" },
  { id: "observations", label: "Observations" },
  { id: "questionnaires", label: "Questionnaires" },
  { id: "care-team", label: "Care team" },
  { id: "devices", label: "Devices" },
];

function DemoTimeline({ measurements }: { measurements: typeof DEMO_MEASUREMENTS }) {
  return measurements.length ? <div className="timeline">{measurements.map((item) => <article className="timeline-item" key={item.id}><span className="timeline-dot" /><div><strong>{item.kind === "ecg" ? "ECG reading" : item.kind === "weight" ? `Weight · ${item.value} ${item.unit}` : "Daily questionnaire"}</strong><p>{item.source} · {formatDate(item.recordedAt)}</p></div></article>)}</div> : <EmptyState text="No synthetic activity is available for this patient." />;
}

function SandboxTimeline({ observations, questionnaires, carePlans, careTeams }: { observations: Observation[]; questionnaires: QuestionnaireResponse[]; carePlans: CarePlan[]; careTeams: CareTeam[] }) {
  const items = [
    ...observations.map((resource) => ({ key: `observation-${resource.id}`, title: resource.code?.text ?? "Observation", detail: [resource.valueQuantity?.value === undefined ? "" : `${resource.valueQuantity.value} ${resource.valueQuantity.unit ?? ""}`, resource.device?.display ?? "Device not recorded"].filter(Boolean).join(" · "), date: resource.effectiveDateTime ?? resource.issued ?? resource.meta?.lastUpdated ?? "", reference: `Observation/${resource.id}` })),
    ...questionnaires.map((resource) => ({ key: `questionnaire-${resource.id}`, title: resource.questionnaire ?? "Questionnaire response", detail: resource.source?.display ?? resource.source?.reference ?? "Author not returned", date: resource.authored ?? resource.meta?.lastUpdated ?? "", reference: `QuestionnaireResponse/${resource.id}` })),
    ...carePlans.map((resource) => ({ key: `careplan-${resource.id}`, title: resource.title ?? "Care plan", detail: `${resource.status} · ${resource.intent}`, date: resource.created ?? resource.meta?.lastUpdated ?? "", reference: `CarePlan/${resource.id}` })),
    ...careTeams.map((resource) => ({ key: `careteam-${resource.id}`, title: resource.name ?? "Care team", detail: `${resource.status} · ${resource.participant?.length ?? 0} participant(s)`, date: resource.period?.start ?? resource.meta?.lastUpdated ?? "", reference: `CareTeam/${resource.id}` })),
  ].sort((first, second) => Date.parse(second.date) - Date.parse(first.date));

  return items.length ? <div className="timeline">{items.map((item) => <article className="timeline-item" key={item.key}><span className="timeline-dot" /><div><strong>{item.title}</strong><p>{item.detail} · {item.reference} · {formatDate(item.date)}</p></div></article>)}</div> : <EmptyState text="No records were returned for this chart yet." />;
}

function Demographics({ patient }: { patient: Patient | null }) {
  return <article className="panel detail-grid"><Detail label="Name" value={patient ? patientName(patient) : "—"} /><Detail label="Birth date" value={patient?.birthDate ?? "Not recorded"} /><Detail label="Gender" value={patient?.gender ?? "Not recorded"} /><Detail label="FHIR identity" value={patient?.id ? `Patient/${patient.id}` : "Synthetic patient"} /><Detail label="Contact" value={patientEmail(patient)} /><Detail label="Address" value={patient?.address?.[0]?.text ?? "Not recorded"} /></article>;
}

function RecordList({ title, records, empty }: { title: string; records: object[]; empty: string }) {
  return <article className="panel"><h2>{title}</h2>{records.length ? <div className="record-list">{records.map((record, index) => {
    const summary = describeRecord(record);
    return <div className="record-row" key={summary.id ?? `${summary.reference}-${index}`}><span className="record-icon"><ClipboardList size={16} /></span><div><strong>{summary.title}</strong><p>{summary.detail} · {summary.reference} · {summary.date}</p></div></div>;
  })}</div> : <EmptyState text={empty} />}</article>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

function EmptyState({ text }: { text: string }) {
  return <p className="empty-state">{text}</p>;
}

function patientEmail(patient: Patient | null): string {
  return patient?.telecom?.find((contact) => contact.system === "email")?.value ?? "Email not recorded";
}

function initials(name: string): string {
  return name.split(" ").map((part) => part.charAt(0)).slice(0, 2).join("").toUpperCase();
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function rpmReviewUrl(patientId: string): string {
  const baseUrl = import.meta.env.VITE_RPM_DASHBOARD_URL ?? "http://localhost:5173";
  return `${baseUrl}/?patient=${encodeURIComponent(patientId)}`;
}

function messageFor(error: unknown): string {
  return error instanceof Error ? error.message : "Ovok could not load this patient's records.";
}

function applyReadResult<T>(
  result: PromiseSettledResult<T> | undefined,
  label: string,
  setValue: (value: T) => void,
  failedReads: string[],
): void {
  if (!result) {
    failedReads.push(label);
    return;
  }
  if (result.status === "fulfilled") setValue(result.value);
  else failedReads.push(label);
}

function describeRecord(record: object) {
  const data = record as Record<string, unknown>;
  const resourceType = typeof data.resourceType === "string" ? data.resourceType : "Record";
  const id = typeof data.id === "string" ? data.id : undefined;
  const quantity = data.valueQuantity && typeof data.valueQuantity === "object" ? data.valueQuantity as Record<string, unknown> : null;
  const code = data.code && typeof data.code === "object" ? data.code as Record<string, unknown> : null;
  const subject = data.device && typeof data.device === "object" ? data.device as Record<string, unknown> : null;
  const value = quantity && typeof quantity.value === "number" ? `${quantity.value} ${typeof quantity.unit === "string" ? quantity.unit : ""}`.trim() : "";
  const title = typeof data.kind === "string" ? data.kind === "ecg" ? "ECG reading" : data.kind === "weight" ? `Weight · ${data.value} ${data.unit ?? ""}` : "Questionnaire response" : typeof data.title === "string" ? data.title : typeof code?.text === "string" ? code.text : resourceType;
  const source = typeof data.source === "string" ? data.source : data.source && typeof data.source === "object" && "display" in data.source ? String(data.source.display ?? "") : typeof subject?.display === "string" ? subject.display : "Source not returned";
  const timestamp = [data.recordedAt, data.effectiveDateTime, data.authored, data.created].find((date): date is string => typeof date === "string") ?? "";
  return {
    id,
    title: value ? `${title} · ${value}` : title,
    detail: [source, data.status].filter((item): item is string => typeof item === "string").join(" · "),
    reference: id ? `${resourceType}/${id}` : "No FHIR id returned",
    date: timestamp ? formatDate(timestamp) : "Timestamp not returned",
  };
}

function consentSummary(consents: Consent[]): string {
  if (!consents.length) return "No accessible Consent resource returned";
  return [...new Set(consents.map((consent) => consent.status))].join(", ");
}

interface SandboxEnrollmentActionsProps {
  patient: Patient;
  client: OvokClient | null;
  careTeams: CareTeam[];
  carePlans: CarePlan[];
  devices: DeviceUseStatement[];
  consents: Consent[];
  practitioners: Practitioner[];
  availableDevices: Device[];
  selectedPractitionerId: string;
  selectedNurseId: string;
  selectedDeviceId: string;
  onSelectPractitioner: (id: string) => void;
  onSelectNurse: (id: string) => void;
  onSelectDevice: (id: string) => void;
  onSaved: () => void;
  actionMessage: string | null;
  actionError: string | null;
  actionBusy: boolean;
  setActionBusy: (busy: boolean) => void;
  setActionMessage: (message: string | null) => void;
  setActionError: (message: string | null) => void;
}

function SandboxEnrollmentActions(props: SandboxEnrollmentActionsProps) {
  const {
    patient, client, careTeams, carePlans, devices, consents, practitioners, availableDevices,
    selectedPractitionerId, selectedNurseId, selectedDeviceId, onSelectPractitioner, onSelectNurse, onSelectDevice,
    onSaved, actionMessage, actionError, setActionMessage, setActionError,
    actionBusy, setActionBusy,
  } = props;
  const selectedPractitioner = practitioners.find((item) => item.id === selectedPractitionerId);
  const selectedNurse = practitioners.find((item) => item.id === selectedNurseId);
  const selectedDevice = availableDevices.find((item) => item.id === selectedDeviceId);
  const activeCareTeam = careTeams.find((team) => team.status === "active");
  const teamMatchesSelection = activeCareTeam?.participant?.length === (selectedPractitioner && selectedNurse ? 2 : selectedPractitioner ? 1 : 0) &&
    activeCareTeam.participant?.some((participant) => participant.role?.some((role) => role.text === "Attending physician") && participant.member?.reference === `Practitioner/${selectedPractitionerId}`) === true &&
    (!selectedNurse || activeCareTeam.participant?.some((participant) => participant.role?.some((role) => role.text === "Monitoring nurse") && participant.member?.reference === `Practitioner/${selectedNurseId}`) === true);

  async function assignClinician() {
    if (!client || !patient || !selectedPractitioner) return;
    await runAction(async () => {
      const assignment = toCareTeam(patient, selectedPractitioner, selectedNurse);
      if (activeCareTeam?.id) {
        await client.updateResource({ ...activeCareTeam, ...assignment, id: activeCareTeam.id, meta: activeCareTeam.meta });
        return `CareTeam reassigned to ${practitionerName(selectedPractitioner)}${selectedNurse ? ` and ${practitionerName(selectedNurse)}` : ""}.`;
      }
      await client.createResource(assignment);
      return `CareTeam assigned to ${practitionerName(selectedPractitioner)}${selectedNurse ? ` and ${practitionerName(selectedNurse)}` : ""}.`;
    });
  }

  async function startProgram() {
    if (!client || !patient) return;
    await runAction(async () => {
      await client.createResource(toCarePlan(patient, activeCareTeam));
      return "A CHF RPM CarePlan was created in Ovok.";
    });
  }

  async function assignDevice() {
    if (!client || !patient || !selectedDevice) return;
    await runAction(async () => {
      await client.createResource(toDeviceUseStatement(patient, selectedDevice));
      return `${deviceName(selectedDevice)} was linked with a DeviceUseStatement.`;
    });
  }

  async function runAction(action: () => Promise<string>) {
    setActionBusy(true);
    setActionError(null);
    setActionMessage(null);
    try {
      setActionMessage(await action());
      onSaved();
    } catch (error) {
      setActionError(messageFor(error));
    } finally {
      setActionBusy(false);
    }
  }

  return <article className="panel chart-actions">
    <div className="section-heading"><div><h2>Enrollment actions</h2></div><span className="status-pill">Ovok sandbox</span></div>
    <p>Each action is sent through the signed-in practitioner session. A successful assignment does not grant record access; Ovok AccessPolicies remain authoritative.</p>
    {actionMessage && <p className="notice notice-success" role="status">{actionMessage}</p>}
    {actionError && <p className="notice notice-error" role="alert">Action failed: {actionError}</p>}
    <div className="action-row">
      <label>Attending practitioner<select value={selectedPractitionerId} onChange={(event) => onSelectPractitioner(event.target.value)}><option value="">Select accessible practitioner</option>{practitioners.map((practitioner) => <option key={practitioner.id} value={practitioner.id}>{practitionerName(practitioner)}</option>)}</select></label>
      <button className="button button-secondary" onClick={() => void assignClinician()} disabled={actionBusy || !selectedPractitioner || teamMatchesSelection}>{actionBusy ? "Saving…" : activeCareTeam ? "Update CareTeam" : "Create CareTeam"}</button>
      <button className="button button-secondary" onClick={() => void startProgram()} disabled={actionBusy || carePlans.some((plan) => plan.status === "active")}>Start CHF RPM CarePlan</button>
    </div>
    <div className="action-row">
      <label>Monitoring nurse<select value={selectedNurseId} onChange={(event) => onSelectNurse(event.target.value)}><option value="">Select accessible practitioner</option>{practitioners.map((practitioner) => <option key={practitioner.id} value={practitioner.id}>{practitionerName(practitioner)}</option>)}</select></label>
      <label>Accessible FHIR device<select value={selectedDeviceId} onChange={(event) => onSelectDevice(event.target.value)}><option value="">Select a device</option>{availableDevices.map((device) => <option key={device.id} value={device.id}>{deviceName(device)}</option>)}</select></label>
      <button className="button button-secondary" onClick={() => void assignDevice()} disabled={actionBusy || !selectedDevice || devices.some((statement) => statement.device?.reference === `Device/${selectedDeviceId}`)}>Create DeviceUseStatement</button>
    </div>
    <p>Consent status: {consentSummary(consents)}</p>
    <p className="fine-print">Ovok exposes FHIR device references here, not physical kit inventory, shipping, delivery, or returns. Confirm device availability using your authorized operational process before linking.</p>
  </article>;
}
